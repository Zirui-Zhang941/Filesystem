import React, { useState, useEffect, useCallback  } from 'react';
import Modal from 'react-modal';
import { useDrag, useDrop } from 'react-dnd';
import { useRef } from 'react';
import { Button,Card } from 'react-bootstrap';
import { Sidebar } from 'flowbite-react';
import { FiFile } from 'react-icons/fi';
import { AiOutlineFolder, AiOutlinePlusCircle } from 'react-icons/ai';
import {useLocation,useNavigate } from 'react-router-dom';
//import "../../src/Mainpage.css";
import DropDownEntity from "./DropDownEntity.jsx";
import SuccessPopup from './SuccessPopup';
//import File from './File.jsx'; // Import the File component
//import FolderDrag from './FolderDrag.jsx'; // Import the Folder Drag 
let topOffestOfLogo = 150; //needed for line rendering in canvas
let sidebarWidth = 250;//the defult size of sidebar is 250 now
let xOfMouseDown = 0; //used for calculating the distance by which the mouse moves during drag
let yOfMouseDown = 0; //used for calculating the distance by which the mouse moves during drag
let buttonHight = 30; // only iused in canvas

// Folder class to represent folder structure
class Folder {
  constructor(name, id,  folders = [], files = [], level = 0, index = 0, offsetWithinParent=0) {
    this.name = name;
    this.level = level;
    this.id = id;
    this.folders = folders;
    this.dx = 0; this.dy = 0;
    this.files = files;this.index = index;this.offsetWithinParent= offsetWithinParent ;
  }
  setPosition(x,y){
    this.x=x; this.y=y;
  }
  //returns all folders as an array rather than tree for folder selection options rendering
  lineralize(){
    let arr= [this];
    for(let i=0; i<this.folders.length; i++){
      arr.push( ...this.folders[i].lineralize() );
    }
    return arr;
  }
  clone2() {
    console.log('cloning '); console.log(this);
    let cloneFolderArr = []; 
    for(let i=0; i<this.folders.length; i++){
      cloneFolderArr.push(this.folders[i].clone2());
    }let cloneFilerArr = []; 
    for(let i=0; i<this.files.length; i++){
      cloneFilerArr.push(this.files[i].clone2());
    }
    return new Folder(this.name, this.id, cloneFolderArr, cloneFilerArr, this.level, this.index, this.offsetWithinParent );
  }
  clone() {
    console.log('cloning '); console.log(this);
    let cloneFolderArr = []; 
    for(let i=0; i<this.folders.length; i++){
      cloneFolderArr.push(this.folders[i].clone());
    }let cloneFilerArr = []; 
    for(let i=0; i<this.files.length; i++){
      cloneFilerArr.push(this.files[i].clone());
    }
    return new Folder(this.name+'(copy)', this.id, cloneFolderArr, cloneFilerArr, this.level, this.index = index,   this.offsetWithinParent );
  }
}
// File class to represent File structure
class File {
  constructor(objFile, level=0, index = 0, offsetWithinParent = 0) {
    this.objFile = objFile;
    this.name=objFile.name;
    this.id=objFile.id;
    this.level=level;
    this.content=objFile.content;
    this.dx = 0; this.dy = 0; this.index = index; this.offsetWithinParent= offsetWithinParent ;
  }
  setPosition(x,y){
    this.x=x; this.y=y;
  }
  clone2() {
    let copy =  JSON.parse(JSON.stringify(this.objFile)); 
    return new File(copy, this.level, this.index,  this.offsetWithinParent );
  }
  clone() {
    let copy =  JSON.parse(JSON.stringify(this.objFile)); 
    copy.name+='(copy)';
    return new File(copy, this.level, this.index,  this.offsetWithinParent );
  }
}

//usually overriden with new data right away
let rootFolder=new Folder('main',1); let idCount=1; let index=0;
console.log(JSON.stringify(rootFolder));

//global variables for copy/pasting
let selectedItems =[];
let selectedItemsCopy =[];

// MainPage component
const MainPage = () => {
  //console.log('tree copy'); //console.log(treeCopy);
  // State variables
  const [isRoot, setIsRoot] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [ifUpload, setIfUpload] = useState(false);//check if the user pressed upload button
  const [Ifdelete,setIfDelete]=useState(false);
  const [IfdeleteFolder, setIfDeleteFolder] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);//for upload, set the file selected when uploading
  const [selectedDelete,setSelectDelete]=useState(null);
  const [selectedDeleteFolder,setSelectDeleteFolder]=useState(null);
  const [selectedFolderName,setSelectedFolderName]=useState('main');//for upload, set the folder name when uploading to default main
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpen2, setModalIsOpen2] = useState(false);
  const [selectedFileModal, setSelectedFileModal] = useState(null);
  const navigate = useNavigate(); // Navigation hook
  const [collapsedFolders, setCollapsedFolders] = useState({}); // State for managing collapsed folders
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // State for managing sidebar collapse
  const [newFolderName, setNewFolderName] = useState(""); // State for new folder name
  const [parentFolderPath, setParentFolderPath] = useState(""); // State for parent folder path of the new folder
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  // State variable to store deleted files temporarily
  const [deletedObjects, setDeletedObjects] = useState([]);
  // Add state to track selected files
  
  const [deleteFolder, setDeleteFolder] = useState(false);
  const [deleteFile, setDeleteFile] = useState(false);
  const [doubleClickedFolder, setDoubleClickedFolder] = useState(null);

  //variable field for Editing File
  const [ifEditing,setIfEditing]=useState(false);
  const [EditContent,setEditContent]=useState("");

  console.log('Tree')
  console.log(rootFolder);


  // handle what happens on key press
  const handleKeyPress = useCallback((event) => {
      if (event.ctrlKey && event.key === 'z') {
        // Prevent default browser behavior (e.g., undoing browser actions)
        event.preventDefault();
        // Call the undo function
        console.log(deletedObjects)
        undoDelete();
        console.log(`Key pressed: ${event.key}`);
      }
      else if (event.ctrlKey && event.key === 'c') {
        // Prevent default browser behavior (e.g., undoing browser actions)
        event.preventDefault();
        selectedItemsCopy = [];
        console.log('copying'); console.log(selectedItems); 
        for(let i = 0; i<selectedItems.length; i++){
          selectedItemsCopy.push(selectedItems[i].clone())
        }
        console.log('Finished copying'); console.log(selectedItemsCopy)
        selectedItems=[];
        toggleFolder(rootFolder.id);toggleFolder(rootFolder.id);
      }
      else if (event.ctrlKey && (event.key === 'v' || event.key === 'p') ) {
        event.preventDefault();
        console.log('pasting');console.log(selectedItemsCopy); console.log('into'); console.log(selectedItems);
        // Prevent default browser behavior (e.g., undoing browser actions)
        for(let i=0; i<selectedItems.length; i++){
          if(selectedItems[i] instanceof Folder){
            console.log('found a folder to add to')
            for(let j=0; j<selectedItemsCopy.length; j++){

              //incrementIDs(selectedItemsCopy[j]);
              if(selectedItemsCopy[j] instanceof Folder){
                console.log('adding folder copy'); console.log(selectedItemsCopy[j])
                selectedItems[i].folders.push(selectedItemsCopy[j])
              } else {console.log('adding file copy'); console.log(selectedItemsCopy[j])
                cloneFileAPICall( sessionStorage.getItem('username'), 
                                  selectedItemsCopy[j].name.slice(0,selectedItemsCopy[j].name.length-6)/**-6 removes '(copy)' to recover the name*/,
                                  selectedItemsCopy[j].name, 
                                  selectedItems[i].name
                                 );
                //selectedItems[i].files.push(selectedItemsCopy[j])
              }
            }
            //toggleFolder(selectedItems[i].id);
            //
          }
        }
        selectedItems = []; selectedItemsCopy = []; toggleFolder(rootFolder.id);toggleFolder(rootFolder.id);
      }
  }, []);

  const cloneFileAPICall = (username, fileName, newFileName, folderName) =>{
    console.log([username, fileName, newFileName, folderName].join(', '))
    fetch(`http://cs506-team-31.cs.wisc.edu:8080/cloneFile?username=${username}&filename=${fileName}&newName=${newFileName}&folder=${folderName}`,{
      method: 'POST',
    }).then(response => {
      if(response.ok){
        console.log(`Clone File Successful!`);
        refresh();
      }else{
        response.json().then(data => {
          alert(data.msg);
        });
      }
    });
  }

  const incrementIDs = (item) => {
    console.log('incrementing id of '); console.log(item)
    item.id=++idCount; 
    if(item instanceof File){
      item.objFile.id= item.id;
    } else {
      for(let i=0; i<item.files.length; i++){ incrementIDs(item.files[i]) }
      for(let i=0; i<item.folders.length; i++){ incrementIDs(item.folders[i]) }
    }

  }

  // Update the file rendering component to handle double-click events and toggle the selection state
  const ItemRightClick = (e,Item) => {
    e.preventDefault(); // Prevent default context menu
    console.log('item'); console.log(Item)
    const index = selectedItems.findIndex((selectedItem) => selectedItem.id === Item.id);
    console.log('index '+index)
    if (index === -1) {
      console.log('adding ')
      selectedItems=[...selectedItems, Item]; // Add Item to selection
    } else {
      selectedItems.splice(index, 1);
    }
    let f = getFolderOf(rootFolder,Item); toggleFolder(f.id); toggleFolder(f.id);
    console.log(selectedItems)
  };

  // Function to undo the last delete action
  const undoDelete = () => {
    // Restore the last deleted object
    if (deletedObjects.length > 0) {
      const lastDeletedObject = deletedObjects.pop();
      if(lastDeletedObject[1] instanceof Folder){
        lastDeletedObject[0].folders.push(lastDeletedObject[1]);
      } else {
        lastDeletedObject[0].files.push(lastDeletedObject[1]);
      }
      toggleFolder(lastDeletedObject[0].id); toggleFolder(lastDeletedObject[0].id);
      //setDeletedObjects([...deletedObjects]); // Update state to reflect changes
    }
  };


  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    // Clean up function to remove event listener when component unmounts
    const fetchData = async () => {
      try {
        //username stored in sessionstorage, set when user logged in
        const username=sessionStorage.getItem('username');
        console.log(username);
        const response = await fetch(`http://cs506-team-31.cs.wisc.edu:8080/viewAllFileName?username=${username}`, {
        method: 'GET',
      });

        if (response.ok) {
          const userData = await response.json();
          console.log('userData')
          console.log(userData);
          index=0;
          rootFolder = await analyseFolder(userData);
          toggleFolder(rootFolder.id);toggleFolder(rootFolder.id);
          console.log(rootFolder); 
        } else {
          const data = await response.json();
          alert(data.msg);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
    
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  //refresh funtion to refresh the page when needed
  const refresh = async () => {
    try {
      const username=sessionStorage.getItem('username');
      const response = await fetch(`http://cs506-team-31.cs.wisc.edu:8080/viewAllFileName?username=${username}`, {
        method: 'GET',
      });
  
      if (response.ok) {
        const userData = await response.json();
        console.log(userData);
        index=0;
        rootFolder = await analyseFolder(userData);
        toggleFolder(rootFolder.id);toggleFolder(rootFolder.id);
        
      } else {
        const data = await response.json();
        alert(data.msg);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };








  //removes everything inside the folder
  const clearFolder = (folder) => {
    for(let i = 0; i < folder.files.length; i++ ){//deletes all files in the directory
      searchForFileInAndDelete(folder, folder.files[i] );
    }
    for(let i = 0; i < folder.folders.length; i++ ){//deletes all folders in the directory
      clearFolder(folder.folders[i]);//first clear the first directory
      searchForFolderInAndDelete(folder, folder.folders[i] );//then delete it
    }
    //treeCopy =rootFolder.clone();
  }
  //returns false if not found
  //returns true if found and deleted
  const searchForFolderInAndDelete = ( folder , targetFolder ) => {
    console.log('Searching '); console.log(folder.name);
    for(let i=0; i<folder.folders.length; i++){
      console.log('Considering '); console.log(folder.folders[i].name);
      if(folder.folders[i].id===targetFolder.id){//found the folder
        //once the folder is found all it's childern have to be deleted also before it itself is deleted
        clearFolder(folder.folders[i]); //removes everything from the to be deleted folder
        folder.folders.splice(i,1);
        //treeCopy =rootFolder.clone();
        handleDeleteFolderBackend(targetFolder.name);
        deletedObjects.push( [folder,targetFolder]);
        //setDeletedObjects([...deletedObjects, [folder,targetFolder]]);
        toggleFolder(folder.id); toggleFolder(folder.id)
        return true;
      }
      else if(searchForFolderInAndDelete(folder.folders[i], targetFolder)){//recursive call
        return true;
      }
    }
    
    return false; // could not find the file
  }
  //an API call to remove folder; precondition - the folder is empty ()
  const handleDeleteFolderBackend = (folderName) => {
    const username=sessionStorage.getItem("username");
    fetch(`http://cs506-team-31.cs.wisc.edu:8080/deleteFolder`,{
      method: 'DELETE',
      body: JSON.stringify({
        "username":username,
        "folderName":folderName,
      }) ,
      headers:{
       "Content-Type": "application/json"
      },
    }).then(response => {
      if(response.ok){
       alert(`Folder `+ folderName+` Deleted Successfuly!`);
       setDeleteFolder(!deleteFolder);
      }else{
        response.json().then(data => {
          alert(data.msg);
        });
      }
    });
  }
  //returns false if not found
  //returns true if found and deleated
  const searchForFileInAndDelete = ( folder , file ) => {
    for(let i=0; i<folder.files.length; i++){
      if(folder.files[i].id===file.id){
        //treeCopy =rootFolder.clone();
        deletedObjects.push([folder,file]);
        handleDeleteFileBackend(folder.files[i].name);
        return true;
      }
    }
    for(let i=0; i<folder.folders.length; i++){
      if(searchForFileInAndDelete(folder.folders[i],file)){
        return true;
      }
    }
    return false; // could not find the file
  }
  
  const handleDeleteFileBackend = (fileName) => {
    const username=sessionStorage.getItem("username");
    const fileNameWithoutExtension = fileName.split('.')[0];
    //console.log(fileNameWithoutExtension);
    
    fetch(`http://cs506-team-31.cs.wisc.edu:8080/deleteFile?fileName=${fileNameWithoutExtension}&username=${username}`,{
      method: 'DELETE',
    }).then(response => {
      if(response.ok){
       alert(`File `+ fileName+` Deleted Successfuly!`);
       refresh();
       setDeleteFile(!deleteFile);
      }else{
        response.json().then(data => {
          alert(data.msg);
        });
      }
    });
  }
  

  //recursively extracts info from specific folder
  //return (frontend) folder
  const analyseFolder = async ( folderEncoding, level=0, offsetWithinParent=0) => {
	  let Folders = [], Files = []; let offest = offsetWithinParent;
    let newFolder = new Folder(folderEncoding.directoryName, ++idCount, Folders, Files, level, index, offsetWithinParent );
  	for(let i=0; i<folderEncoding.subDirectories.length; i++){
		  Folders.push(await analyseFolder(folderEncoding.subDirectories[i],level+1, ++index));
	  }
  	for(let i=0; i<folderEncoding.filenames.length; i++){
		  Files.push(await analyseFile(folderEncoding.filenames[i],level+1, ++index));
	  }
    if(doubleClickedFolder !== null && newFolder.name===doubleClickedFolder.name){
      setDoubleClickedFolder(newFolder);
    }
	  return newFolder;
  }

  //return (frontend) file
  const analyseFile = async ( fileName,level, offsetWithinParent) => {  
    try {
      const username=sessionStorage.getItem("username");
      console.log(username);
      const fileNameWithoutExtension = fileName.split('.')[0];
      const response = await fetch(`http://cs506-team-31.cs.wisc.edu:8080/viewFile?fileName=${fileNameWithoutExtension}&username=${username}`, {
      method: 'GET',
    });
      //

      if (response.ok) {
        console.log('response');
        console.log(response);
        let obj = await response.json();
        console.log('obj'); console.log(obj);
        console.log(obj.content)
        
        console.log(`File `+ fileName+` Accesed Successfuly!`);
        let f = new File({ name : fileNameWithoutExtension, content: obj.content , id:++idCount},level, index, offsetWithinParent);
        console.log('creating File instance')
        console.log(f);
        console.log('Root')
        //console.log(rootFolder);
        //response.json()
        return f;
        //setFolderTree(rootFolder);
      } else {
        const data = await response.json();
        alert(data.msg);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  

  //returns false if FolderNameArr does not define a valid path and folder if path is OK
  //params currFolder - current folder , FolderNameArr - ['folderName1', 'folderName2', ...]
  const getFolderFromPath = (currFolder, FolderNameArr) =>{
    if(FolderNameArr.length===1 && FolderNameArr[0]==='main' && currFolder.name==='main'){//handles special case of uploading to the root
      return currFolder; 
    } 
    else if(FolderNameArr[0]!=='main' && currFolder.name==='main'){//the path does not start with Root
      return false;
    }
    else if(currFolder.name==='main' && FolderNameArr[0]==='main'){//special case that runs only once on the first run
      FolderNameArr.splice(0,1);
    }
    
    console.log('Folder Name Arr');
    console.log(FolderNameArr)
    console.log('Searching '+currFolder.name);
    for(let i = 0; i<currFolder.folders.length; i++){
      let folder = false;
      console.log('Considering '+currFolder.folders[i].name);
      if(FolderNameArr[0]===currFolder.folders[i].name){
        if(FolderNameArr.length===1){ return currFolder.folders[i]; } //found the folder for addition
        folder = getFolderFromPath(currFolder.folders[i], FolderNameArr.slice( 1 ) ); //recursive call on new folder and a new FolderNameArr (without the first element)
      }
      if(folder!==false){
        return folder;
      }
    } 
    return false;   
  }

  // Function to handle moving 
  // targetItem - the item on which the toBeMoved object was dropped
  const handleMove = (toBeMovedItem, targetItem) => {
    
    const username=sessionStorage.getItem("username");
    //console.log('treeCopy');console.log(treeCopy); console.log('rootFolder'); console.log(rootFolder)
    //rootFolder = treeCopy.clone();
    //console.log(toBeMovedItem); console.log(targetItem);
    if(targetItem instanceof Folder && toBeMovedItem instanceof Folder){ //moving folder with folder as the target 
      
      console.log('moving folder with folder as the target ')
      console.log('to be moved item before');
      console.log(toBeMovedItem); 
      //toBeMovedItem = matchFolder(rootFolder, toBeMovedItem);
      //console.log('to be moved item after');
      //console.log(toBeMovedItem);
      let folderClone = toBeMovedItem.clone();
      console.log('clone'); console.log(folderClone);
      searchForFolderInAndDelete(rootFolder,toBeMovedItem);
      targetItem.folders.splice(0,0, folderClone);
      //need an API call here
    } else if(targetItem instanceof Folder ){ //moving file with folder as the target 
      
      movefileAPICall(username,toBeMovedItem.name,targetItem.name);
      //targetItem.files.splice(0,0, toBeMovedItem);
      //need an API call here
    } else if(toBeMovedItem instanceof Folder ){ //moving folder with file as the target 
      //toBeMovedItem = matchFolder(treeCopy, toBeMovedItem);
      let folderClone = toBeMovedItem.clone();
      searchForFolderInAndDelete(rootFolder,toBeMovedItem);
      let targerF = getFolderOf(rootFolder, targetItem);
      targerF.folders.splice(0,0,folderClone)
    } else {//both files
      console.log('moving file with file as the target ')
      console.log('to be moved item ');
      console.log(toBeMovedItem); 
      let targerF = getFolderOf(rootFolder, targetItem);
      console.log(targerF);
      movefileAPICall(username,toBeMovedItem.name,targerF.name);
      
    }
  };
  const movefileAPICall = (username,fileName,folderName) => {
    fetch(`http://cs506-team-31.cs.wisc.edu:8080/movefile?userName=${username}&fileName=${fileName}&folderName=${folderName}`,{
      method: 'POST',
    }).then(response => {
      if(response.ok){
        console.log(`Move File Successful!`);
        refresh();
      }else{
        response.json().then(data => {
          alert(data.msg);
        });
      }
    });
  }
  // handle navigation to the home page
  const handleQuit = () => {
    navigate('/');
  };
  // recursively renders folders that should be rendered (based on toggle status)
  const renderFolder = ( calledFromCanvas, Folder, toggleFolder, openModal, openModal2, itemGroupStyle , itemStyle, subItemGroupStyle, subItemStyle, selectedItemStyle, selectedSubItemStyle) => { 
    if(calledFromCanvas){
      return (
        <div>
          <Drag ITEM={Folder} calledFromCanvas={calledFromCanvas} isToggoled={collapsedFolders[Folder.id]} isRoot={false} key={Folder.id} onMove={handleMove} handleDeleteFolder={handleDeleteFolder}  openModal2={openModal2}
                              toggle={toggleFolder} handleItemRightClick={ItemRightClick} Style = {selectedItems.includes(Folder) ? selectedItemStyle : itemStyle} />
          
          {/* Render sub-items if Root folder is not collapsed */}
          {!collapsedFolders[Folder.id] && (
          <div style={subItemGroupStyle}>
              
            {/* Mapping through folders */}
            {Folder.folders.map((folder, index) => (
              renderFolder(calledFromCanvas,folder, toggleFolder,openModal, openModal2, itemGroupStyle ,
                {//itemStyle
                  marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                  transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                  fontSize: '18px', // Adjust font size
                  padding: `8px 10px`, // Add padding to items
                  color: '#333', // Text color
                },
                subItemGroupStyle, 
                {//SubItemStyle
                  marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                  transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                  fontSize: '16px', // Adjust font size for sub-items
                  padding: '8px 10px', // Add padding to sub-items
                  color: '#666', // Text color for sub-items
                }, 
                {//selectedItemStyle
                  marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                  transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                  fontSize: '16px', // Adjust font size for sub-items
                  padding: `${8}px ${10}px`, // Add padding to sub-items
                  backgroundColor: '#f0f0f0', // Background color for selected item
                  color: '#333', // Text color for selected item
                  fontWeight: 'bold', // Make the text bold for selected item
                }, 
                {//selectedSubItemStyle
                  marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                  transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                  fontSize: '16px', // Adjust font size for sub-items
                  padding: `${8}px ${10}px`, // Add padding to sub-items
                  backgroundColor: '#e0e0e0', // Background color for selected sub-item
                  color: '#666', // Text color for selected sub-item
                  fontWeight: 'bold', // Make the text bold for selected sub-item
                }
              )
              //toggleFolder(folder.id);
            ))}
            {/* Mapping through files */}
            {Folder.files.map((file, index) => (
              <Drag key={file.id} ITEM={file} calledFromCanvas={calledFromCanvas} onMove={handleMove} handleDeleteFile={handleDelete} handleItemRightClick={ItemRightClick} toggle={toggleFolder}
              Style ={selectedItems.includes(file) ? {//selectedSubItemStyle
                marginLeft: `${calledFromCanvas ? 8+file.dx+50*file.level: 0}px`,
                transform: `${calledFromCanvas ? `translate(0, ${10+file.dy}px)` : `translate(0,0)`}`,
                fontSize: '16px', // Adjust font size for sub-items
                padding: `${8}px ${10}px`, // Add padding to sub-items
                backgroundColor: '#e0e0e0', // Background color for selected sub-item
                color: '#666', // Text color for selected sub-item
                fontWeight: 'bold', // Make the text bold for selected sub-item
              } : {//SubItemStyle
                marginLeft: `${calledFromCanvas ? 8+file.dx +50*file.level: 0}px`,
                transform: `${calledFromCanvas ? `translate(0, ${10+file.dy}px)` : `translate(0,0)`}`,
                fontSize: '16px', // Adjust font size for sub-items
                padding: `${8}px ${10}px`, // Add padding to sub-items
                color: '#666', // Text color for sub-items
              }}  openModal={openModal}/>
            ))}
            
            {/* set to false so the non folders are rendered with the delete button */}
            
          </div>
          )}
        </div>
      );
    } else {//not called from canvas
      return (
        <Sidebar.ItemGroup style={itemGroupStyle}>
            
          <Drag ITEM={Folder} isRoot={false} key={Folder.id} onMove={handleMove} handleDeleteFolder={handleDeleteFolder}  openModal2={openModal2}
                              toggle={toggleFolder} handleItemRightClick={ItemRightClick} Style = {selectedItems.includes(Folder) ? selectedItemStyle : itemStyle} />
          
          {/* Render sub-items if Root folder is not collapsed */}
          {!collapsedFolders[Folder.id] && (
            <Sidebar.ItemGroup style={subItemGroupStyle}>
              
            {/* Mapping through folders */}
            {Folder.folders.map((folder, index) => (
              renderFolder(calledFromCanvas,folder, toggleFolder,openModal, openModal2, itemGroupStyle ,
                {//itemStyle
                  marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                  transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                  fontSize: '18px', // Adjust font size
                  padding: `8px 10px`, // Add padding to items
                  color: '#333', // Text color
                },
                subItemGroupStyle, 
                {//SubItemStyle
                  marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                  transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                  fontSize: '16px', // Adjust font size for sub-items
                  padding: '8px 10px', // Add padding to sub-items
                  color: '#666', // Text color for sub-items
                }, 
                {//selectedItemStyle
                  marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                  transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                  fontSize: '16px', // Adjust font size for sub-items
                  padding: `${8}px ${10}px`, // Add padding to sub-items
                  backgroundColor: '#f0f0f0', // Background color for selected item
                  color: '#333', // Text color for selected item
                  fontWeight: 'bold', // Make the text bold for selected item
                }, 
                {//selectedSubItemStyle
                  marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                  transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                  fontSize: '16px', // Adjust font size for sub-items
                  padding: `${8}px ${10}px`, // Add padding to sub-items
                  backgroundColor: '#e0e0e0', // Background color for selected sub-item
                  color: '#666', // Text color for selected sub-item
                  fontWeight: 'bold', // Make the text bold for selected sub-item
                }
              )
              //toggleFolder(folder.id);
            ))}
            {/* Mapping through files */}
            {Folder.files.map((file, index) => (
              <Drag key={file.id} ITEM={file} onMove={handleMove} handleDeleteFile={handleDelete} handleItemRightClick={ItemRightClick} toggle={toggleFolder}
              Style ={selectedItems.includes(file) ? {//selectedSubItemStyle
                marginLeft: `${calledFromCanvas ? 8+file.dx+50*file.level: 0}px`,
                transform: `${calledFromCanvas ? `translate(0, ${10+file.dy}px)` : `translate(0,0)`}`,
                fontSize: '16px', // Adjust font size for sub-items
                padding: `${8}px ${10}px`, // Add padding to sub-items
                backgroundColor: '#e0e0e0', // Background color for selected sub-item
                color: '#666', // Text color for selected sub-item
                fontWeight: 'bold', // Make the text bold for selected sub-item
              } : {//SubItemStyle
                marginLeft: `${calledFromCanvas ? 8+file.dx+50*file.level : 0}px`,
                transform: `${calledFromCanvas ? `translate(0, ${10+file.dy}px)` : `translate(0,0)`}`,
                fontSize: '16px', // Adjust font size for sub-items
                padding: `${8}px ${10}px`, // Add padding to sub-items
                color: '#666', // Text color for sub-items
              }}  openModal={openModal}/>
            ))}
            
            {/* set to false so the non folders are rendered with the delete button */}
            
          </Sidebar.ItemGroup>
          )}
        </Sidebar.ItemGroup>
      );
    }
    
  };
  //the styles are needed foe dynamically changing styles
  const renderRoot = (calledFromCanvas,Folder, toggleFolder, openModal, openModal2, itemGroupStyle , itemStyle, subItemGroupStyle, subItemStyle, selectedItemStyle, selectedSubItemStyle) => { 
    if(calledFromCanvas){return (
      <div>
        <Drag ITEM={Folder} calledFromCanvas={calledFromCanvas} isToggoled={collapsedFolders[Folder.id]} isRoot={true} key={Folder.id} onMove={handleMove} handleDeleteFolder={handleDeleteFolder}  openModal2={openModal2}
                            toggle={toggleFolder} handleItemRightClick={ItemRightClick} Style = {selectedItems.includes(Folder) ? selectedItemStyle : itemStyle} />     
        {/* Render sub-items if Root folder is not collapsed */}
        {!collapsedFolders[Folder.id] && (
          <div>
          {Folder.folders.map((folder, index) => (
            renderFolder(calledFromCanvas, folder, toggleFolder, openModal, openModal2, itemGroupStyle ,  
              {//itemStyle
                marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                fontSize: '18px', // Adjust font size
                padding: `8px 10px`, // Add padding to items
                color: '#333', // Text color
              },
              subItemGroupStyle, 
              {//SubItemStyle
                marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                fontSize: '16px', // Adjust font size for sub-items
                padding: '8px 10px', // Add padding to sub-items
                color: '#666', // Text color for sub-items
              }, 
              {//selectedItemStyle
                marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                fontSize: '16px', // Adjust font size for sub-items
                padding: `${8}px ${10}px`, // Add padding to sub-items
                backgroundColor: '#f0f0f0', // Background color for selected item
                color: '#333', // Text color for selected item
                fontWeight: 'bold', // Make the text bold for selected item
              }, 
              {//selectedSubItemStyle
                marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                fontSize: '16px', // Adjust font size for sub-items
                padding: `${8}px ${10}px`, // Add padding to sub-items
                backgroundColor: '#e0e0e0', // Background color for selected sub-item
                color: '#666', // Text color for selected sub-item
                fontWeight: 'bold', // Make the text bold for selected sub-item
              }
            )
          ))}
          {/* Mapping through files */}
          {Folder.files.map((file, index) => (
           <Drag key={file.id} calledFromCanvas={calledFromCanvas} ITEM={file} onMove={handleMove} handleEditFile={handleEditFile} handleDeleteFile={handleDelete}  toggle={toggleFolder}
                  handleItemRightClick={ItemRightClick} openModal={openModal} 
                  Style ={selectedItems.includes(file) ? {//selectedSubItemStyle
                    marginLeft: `${calledFromCanvas ? 8+file.dx+50*file.level: 0}px`,
                    transform: `${calledFromCanvas ? `translate(0, ${10+file.dy}px)` : `translate(0,0)`}`,
                    fontSize: '16px', // Adjust font size for sub-items
                    padding: `${8}px ${10}px`, // Add padding to sub-items
                    backgroundColor: '#e0e0e0', // Background color for selected sub-item
                    color: '#666', // Text color for selected sub-item
                    fontWeight: 'bold', // Make the text bold for selected sub-item
                  } : {//SubItemStyle
                    marginLeft: `${calledFromCanvas ? 8+file.dx+50*file.level : 0}px`,
                    transform: `${calledFromCanvas ? `translate(0, ${10+file.dy}px)` : `translate(0,0)`}`,
                    fontSize: '16px', // Adjust font size for sub-items
                    padding: `${8}px ${10}px`, // Add padding to sub-items
                    color: '#666', // Text color for sub-items
                  }} />

          ))}
          </div>
        )}
        </div>
    );

    }
    else{return (//not called from canvas
      <Sidebar.ItemGroup style={itemGroupStyle}>
          <Drag ITEM={Folder} isRoot={true} key={Folder.id} onMove={handleMove} handleDeleteFolder={handleDeleteFolder}  openModal2={openModal2} 
                            toggle={toggleFolder} handleItemRightClick={ItemRightClick} Style = {selectedItems.includes(Folder) ? selectedItemStyle : itemStyle} />

        
        {/* Render sub-items if Root folder is not collapsed */}
        {!collapsedFolders[Folder.id] && (
          <Sidebar.ItemGroup style={subItemGroupStyle}>
            {/* Mapping through folders */}
          {Folder.folders.map((folder, index) => (
            renderFolder(calledFromCanvas, folder, toggleFolder, openModal, openModal2, itemGroupStyle ,  
              {//itemStyle
                marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                fontSize: '18px', // Adjust font size
                padding: `8px 10px`, // Add padding to items
                color: '#333', // Text color
              },
              subItemGroupStyle, 
              {//SubItemStyle
                marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                fontSize: '16px', // Adjust font size for sub-items
                padding: '8px 10px', // Add padding to sub-items
                color: '#666', // Text color for sub-items
              }, 
              {//selectedItemStyle
                marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                fontSize: '16px', // Adjust font size for sub-items
                padding: `${8}px ${10}px`, // Add padding to sub-items
                backgroundColor: '#f0f0f0', // Background color for selected item
                color: '#333', // Text color for selected item
                fontWeight: 'bold', // Make the text bold for selected item
              }, 
              {//selectedSubItemStyle
                marginLeft: `${calledFromCanvas ? 8+folder.dx+50*folder.level: 0}px`,
                transform: `${calledFromCanvas ? `translate(0, ${10+folder.dy}px)` : `translate(0,0)`}`,
                fontSize: '16px', // Adjust font size for sub-items
                padding: `${8}px ${10}px`, // Add padding to sub-items
                backgroundColor: '#e0e0e0', // Background color for selected sub-item
                color: '#666', // Text color for selected sub-item
                fontWeight: 'bold', // Make the text bold for selected sub-item
              }
            )
          ))}
          {/* Mapping through files */}
          {Folder.files.map((file, index) => (
           <Drag key={file.id} ITEM={file} onMove={handleMove} handleDeleteFile={handleDelete} handleEditFile={handleEditFile} toggle={toggleFolder} 
                  handleItemRightClick={ItemRightClick} openModal={openModal} 
                  Style ={selectedItems.includes(file) ? {//selectedSubItemStyle
                    marginLeft: `${calledFromCanvas ? 8+file.dx: 0}px`,
                    top: `${calledFromCanvas ? 10+file.dy : 0}px`,
                    fontSize: '16px', // Adjust font size for sub-items
                    padding: `${8}px ${10}px`, // Add padding to sub-items
                    backgroundColor: '#e0e0e0', // Background color for selected sub-item
                    color: '#666', // Text color for selected sub-item
                    fontWeight: 'bold', // Make the text bold for selected sub-item
                  } : {//SubItemStyle
                    marginLeft: `${calledFromCanvas ? 8+file.dx : 0}px`,
                    top: `${calledFromCanvas ? 10+file.dy : 0}px`,
                    fontSize: '16px', // Adjust font size for sub-items
                    padding: `${8}px ${10}px`, // Add padding to sub-items
                    color: '#666', // Text color for sub-items
                  }} />
          ))}
          
          {/* set to false so the non folders are rendered with the delete button */}
          
          {/* Mapping through folders */}
          
        </Sidebar.ItemGroup>
        )}
      </Sidebar.ItemGroup>
    );}
    
  };
  // creates a new Folder
  const createNewFolder = () => {
    if(newFolderName.trim() !== "" ){
        // RegEx to remove leading and trailing slashes, if any
      let FolderNameArr = parentFolderPath.replace(/^\/|\/$/g, '');
      // Split the path into an array using slashes as delimiter
      FolderNameArr=FolderNameArr.split('/');
      console.log(FolderNameArr);  
      handleCreateFolderBackend();  
        setParentFolderPath(""); // Clear the input field after creating the folder
        setNewFolderName(""); // Clear the input field after creating the folder
        setShowInput(false); // Hide the input field after creating the folder
      
      //treeCopy =rootFolder.clone();
    }
  };


  

  const handleCreateFolderBackend=()=>{
    const username=sessionStorage.getItem("username");
    fetch(`http://cs506-team-31.cs.wisc.edu:8080/createFolder`,{
      method: 'POST',
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "username":username,
        "folderName":newFolderName,
        "path":parentFolderPath,
      }),
    }).then(response => {
      if(response.ok){
        alert(`Create Folder Successful!`);
        refresh();
      }else{
        response.json().then(data => {
          alert(data.msg);
        });
      }

    });
  }

  // handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleEditChange=(event)=>{
    setEditContent(event.target.value);
  }

  const closeSuccessPopup = () => {
    setSuccessPopupOpen(false);
  };

  const handleFolderChange = (event) => {
    console.log('handling folder selection')
    console.log(event.target.value)
    setSelectedFolderName(event.target.value);
  };
  const handleDeleteChange = (event) => {
    setSelectDelete(event.target.value);
  };
  const handleDeleteFolderChange = (event) => {
    setSelectDeleteFolder(event.target.value);
  };
  // handle file upload
  const handleUpload = () => {
    setSuccessPopupOpen(true);
    if (selectedFile) {
      const formData = new FormData();

      const username=sessionStorage.getItem('username');
      //setting up formdata to send
      formData.append('username', username);
      formData.append('path', selectedFolderName);
      formData.append('file', selectedFile);

      // Sending the file to backend server using fetch API
      fetch(`http://cs506-team-31.cs.wisc.edu:8080/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
        .then(response => {
          if(response.ok){
            refresh();
          }else{
            response.json().then(data => {
              alert(data.msg);
            });
          }
        })
        .catch(error => {
          console.error('Error uploading file:', error);
        });
        setSelectedFolderName('main');//set to defult after upload
    } else {
      console.error('No file selected');
    }

    setIfEditing(false);
    setIfUpload(!ifUpload);

  };
  //only to store the filename to to changed
  const [EditFileName,setEditFileName]=useState();
  const handleEditFile=(file)=>{
    setIfUpload(false);
    setEditFileName(file.name);
    setIfEditing((prev)=>!prev);
    //set IfEditing to open up a modal
  }
  const handleupdateFIle=()=>{
    const formData = new FormData();
    //set up formData here
      const username=sessionStorage.getItem('username');
      formData.append('username', username);
      formData.append('fileName', EditFileName);
      formData.append('content', EditContent);
    //fetch to endpoint to update file
    fetch('http://cs506-team-31.cs.wisc.edu:8080/updateFile',{
        method: 'POST',
        body: formData,
    }).then(response => {
      if(response.ok){
        alert("Update File Content successful!")
        refresh();
        setIfEditing((prev)=>!prev);
      }else{
        response.json().then(data => {
          alert(data.msg);
        });
      }
    });
  }

  const handleDelete=(file)=>{
    if(searchForFileInAndDelete(rootFolder,file)){
      console.log('Success')
    }
  }
  const handleDeleteFolder=(folder)=>{
    if(searchForFolderInAndDelete(rootFolder,folder)){
      console.log('Success')
    }
  }

  // toggle the upload section
  const setUpload = () => {
    //close other widows
    setIfDelete(false);
    setIfEditing(false);

    setShowInput(false);
    setIfUpload(!ifUpload);
  };
  const setInput = () => {
    setIfDelete(false);
    setIfUpload(false);
    setShowInput(!showInput);
  };
  const setRoot = () => {
    setIsRoot(false);
  };
  const setDelete = () => {
    setIfDelete(false);
    setIfDelete(!Ifdelete);
  };
  // toggle folder collapse/expand
  const toggleFolder = (id) => {
    setCollapsedFolders((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  // toggle sidebar collapse/expand
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // open modal to view file
  const openModal = (file) => {
    setSelectedFileModal(file.objFile);
    setModalIsOpen(true);
  };
  // open modal to view file
  const openModal2 = (folder) => {

    setDoubleClickedFolder(folder);
    setModalIsOpen2(true);
  };
  // close modal and update file content if it has been edited
  const closeModal2 = () => {
    // Clear selected file modal
    setDoubleClickedFolder(null);
    // Close modal
    setModalIsOpen2(false);
  };
  // close modal and update file content if it has been edited
  const closeModal = () => {
    // Check if file content has been edited
    if (selectedFileModal && selectedFileModal.content !== fileContentRef.current.value) {
      // Update file content
      selectedFileModal.content = fileContentRef.current.value;
      // Perform API call or any other necessary actions to save the updated content
      // For demonstration purposes, you can print the updated content
      console.log('Updated file content:', selectedFileModal.content);
    }
    // Clear selected file modal
    setSelectedFileModal(null);
    // Close modal
    setModalIsOpen(false);
  };

  const fileContentRef = useRef(null);

  // component UI
  return (
    <div>
    {/* Left Sidebar */}
    <div style={{height: '99vh', width: '50px', backgroundColor: '#808080', position: 'fixed', top: '4px', bottom: 0, left: 0, borderRadius: '10px', background: 'darkgray' }}>
      {/* Content of the Left Sidebar goes here */}
      <div style={{ marginTop: '15px' }}> 
        <button style={{ border: 'none', background: 'transparent', marginLeft: '-17px' }} onClick={setUpload}>
          <img src='./src/components/upload_icon.png' alt="Upload" style={{ width: '50px', height: '50px', background: 'transparent'}}/>
        </button>
      </div>
      <div style={{ marginTop: '825px' }}> 
        <button style={{ border: 'none', background: 'transparent', color: 'red' }} onClick={handleQuit}>
          <img src='./src/components/logout.png' alt="Logout" style={{ width: '25px', height: '25px', background: 'transparent', marginLeft: '-2px'}}/>
        </button>
      </div>
      <div style={{ marginTop: '-855px' }}>
        <SuccessPopup isOpen={successPopupOpen} closeModal={closeSuccessPopup} />
        <Button style={{ border: 'none', background: 'transparent'}} onClick={setInput}>
          <img src='./src/components/folder_icon.png' alt="Create Folder" style={{ width: '30px', height: '30px', background: 'transparent', marginLeft: '-6px'}}/>
        </Button>
        {showInput && (
          <div style={{marginLeft: '800px', marginTop: '250px' }}>
            <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} 
              placeholder="New Folder Name" style={{ width: '250px' }}/>
            <input type="text" value={parentFolderPath} onChange={(e) => setParentFolderPath(e.target.value)} 
              placeholder="New Folder Path (e.g. Root/Sub Folder 1/)" style={{ width: '250px' }} />
            <button style={{marginTop: '5px', marginLeft: '35px'}} onClick={createNewFolder}>Create</button>
          </div>
        )}
      </div>
    </div>

    {/* Main Sidebar */}
    <div style={{ marginLeft: '50px', transition: 'margin-left 0.5s', overflow: 'hidden', position: 'relative'}}>
      {!sidebarCollapsed && (
        <Sidebar style={{height: '99vh', 
        width: `${sidebarWidth}px`, // Adjust the width as needed
        border: '1px solid #ccc', // Add border
        borderRadius: '10px', // Add rounded corners
        backgroundColor: 'white', // Background color
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', }} id='sidebar'>
          {/* Sidebar logo */}
          <Sidebar.Logo href="#" style={logoStyle} img="src/components/logo.svg" imgAlt="506 Studs">506 Studs</Sidebar.Logo>

          {/* Root folder group, will populate with folders from json later */}
          {renderRoot( false, rootFolder, toggleFolder, openModal, openModal2, itemGroupStyle , itemStyle, subItemGroupStyle, subItemStyle, selectedItemStyle, selectedSubItemStyle)}
          
          {/* Button to create new folder */}

        </Sidebar>
      )}
    </div>

    {/* Main content section */}
    <div style={{ top:'0px', left:'35%' , position:'absolute'}}>
      <h1 className='Header'>Welcome {sessionStorage.getItem("username")}!</h1>
      {/* Render file upload section if 'ifUpload' state is true */}
      {ifUpload && (
          <div className='choosefile'>
            <p>Choose a file to Upload</p>
            <input type="file" onChange={handleFileChange}/>
            <p>Choose a folder</p>
            
            {/* Mapping through folders */}
            <select defaultValue={'main'} onChange={handleFolderChange}> 
            {rootFolder.lineralize().map((folder, index) => (
              <option value={folder.name}>{folder.name}</option>
            ))}
            </select>
            <div>
              <Button style={{ marginTop: '10px' }} onClick={handleUpload}>Submit</Button>
            </div>
          </div>
      )}
      {
        ifEditing&&(
          <div className='choosefile'>
          
          <h2>Edit Content</h2>
          <input style={{ marginBottom: '10px', height: '40px' }} onChange={handleEditChange}/>    
          <div>   
            <Button style={{ marginTop: '10px' }} onClick={handleupdateFIle}>Save Changes</Button>
          </div>
          <>
            <button style={{ marginTop: '10px' }} onClick={handleEditFile}>Cancel</button>
          </>
        </div>
        )
      }
    </div>
      

      {/* Arrow Button to Toggle Sidebar */}
      <button className="toggle-sidebar-button" onClick={toggleSidebar} style={{ position: 'fixed', top: '50%', left: sidebarCollapsed ? '0' : `${sidebarWidth}px` }}>
        {sidebarCollapsed ? '>' : '<'}
      </button>
      {resizeSidebarButton(sidebarCollapsed, toggleFolder)}
      
      
      {/* Modal for viewing folder contents on canvas */}
      <Modal
          isOpen={modalIsOpen2}
          onRequestClose={closeModal2}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            border: 'none',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'gray'
          },
        }}
      >
        {doubleClickedFolder && <CanvasComponent folder={doubleClickedFolder} toggleFolder={toggleFolder} openModal2={openModal2}  openModal={openModal} 
                            itemGroupStyle={itemGroupStyle}  itemStyle={itemStyle} subItemGroupStyle={subItemGroupStyle} subItemStyle={subItemStyle}
                            selectedItemStyle={selectedItemStyle} selectedSubItemStyle={selectedSubItemStyle} renderFolder ={renderFolder} renderRoot={renderRoot}  />}

    
        <button onClick={closeModal2} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#333' }}>×</button>
      </Modal>
      {/* Modal for viewing file content */}
      <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            border: 'none',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'gray'
          },
        }}
      >

        {selectedFileModal && (
          <div>
            <h2>{selectedFileModal.name}</h2>
            <textarea
              ref={fileContentRef}
              defaultValue={selectedFileModal.content}
              rows={10} // Adjust the number of rows as needed
              cols={50} // Adjust the number of columns as needed
            />
          </div>
        )}
        <button onClick={closeModal} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#333' }}>×</button>
      </Modal>
    </div>
  );
};

const itemGroupStyle = {
  padding: '10px', // Add padding to item groups
};

const itemStyle = {
  fontSize: '18px', // Adjust font size
  padding: '8px 10px', // Add padding to items
  color: '#333', // Text color
};

const subItemGroupStyle = {
  paddingLeft: '20px', // Indent sub-item groups
};

const subItemStyle = {
  fontSize: '16px', // Adjust font size for sub-items
  padding: '8px 10px', // Add padding to sub-items
  color: '#666', // Text color for sub-items
};
const selectedItemStyle = {
  fontSize: '16px', // Adjust font size for sub-items
  padding: '8px 10px', // Add padding to sub-items
  backgroundColor: '#f0f0f0', // Background color for selected item
  color: '#333', // Text color for selected item
  fontWeight: 'bold', // Make the text bold for selected item
};

const selectedSubItemStyle = {
  fontSize: '16px', // Adjust font size for sub-items
  padding: '8px 10px', // Add padding to sub-items
  backgroundColor: '#e0e0e0', // Background color for selected sub-item
  color: '#666', // Text color for selected sub-item
  fontWeight: 'bold', // Make the text bold for selected sub-item
};

const logoStyle = {
  width: '40px',
  height: '40px',
  padding: '20px',
  fontSize: '30px',
  display: 'flex',
  alignItems: 'center',
  background: 'transparent',
  whiteSpace: 'nowrap', // Ensures the text stays in one line
};


//let folderCopy = null;
let hoveredOverObject = null; 
let canvasRoot = null;
const CanvasComponent = ({folder, toggleFolder, openModal, openModal2, itemGroupStyle , itemStyle, subItemGroupStyle, subItemStyle, selectedItemStyle, selectedSubItemStyle, renderRoot, renderFolder}) => {
  
  //renderFolder(folder, toggleFolder, openModal, itemGroupStyle , itemStyle, subItemGroupStyle, subItemStyle, selectedItemStyle, selectedSubItemStyle)
  return (
    <div style={{ marginLeft: '0px', transition: 'margin-left 0.5s', overflow: 'hidden', position: 'relative'}}>
   
      <Sidebar style={{height: '99vh', 
        width: `900px`, // Adjust the width as needed
        border: '1px solid #ccc', // Add border
        borderRadius: '10px', // Add rounded corners
        backgroundColor: 'white', // Background color
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', }} id='sidebar'>
        {/* Sidebar logo */}
        <Sidebar.Logo href="#" style={logoStyle} img="src/components/logo.svg" imgAlt="506 Studs">506 Studs</Sidebar.Logo>

        {/* Root folder group, will populate with folders from json later */}
        {renderRoot(true,folder, toggleFolder, openModal, openModal2, 
                  itemGroupStyle ,  
                  {//itemStyle
                    marginLeft: `${8+folder.dx+50*folder.level}px`,
                    transform: `translate(0, ${10+folder.dy}px)`,
                    fontSize: '18px', // Adjust font size
                    padding: `8px 10px`, // Add padding to items
                    color: '#333', // Text color
                  },
                  subItemGroupStyle, 
                  {//SubItemStyle
                    marginLeft: `${8+folder.dx+50*folder.level}px`,
                    transform: `translate(0, ${10+folder.dy}px)`,
                    fontSize: '16px', // Adjust font size for sub-items
                    padding: '8px 10px', // Add padding to sub-items
                    color: '#666', // Text color for sub-items
                  }, 
                  {//selectedItemStyle
                    marginLeft: `${8+folder.dx+50*folder.level}px`,
                    transform: `translate(0, ${10+folder.dy}px)`,
                    fontSize: '16px', // Adjust font size for sub-items
                    padding: `${8}px ${10}px`, // Add padding to sub-items
                    backgroundColor: '#f0f0f0', // Background color for selected item
                    color: '#333', // Text color for selected item
                    fontWeight: 'bold', // Make the text bold for selected item
                  }, 
                  {//selectedSubItemStyle
                    marginLeft: `${8+folder.dx+50*folder.level}px`,
                    transform: `translate(0, ${10+folder.dy}px)`,
                    fontSize: '16px', // Adjust font size for sub-items
                    padding: `${8}px ${10}px`, // Add padding to sub-items
                    backgroundColor: '#e0e0e0', // Background color for selected sub-item
                    color: '#666', // Text color for selected sub-item
                    fontWeight: 'bold', // Make the text bold for selected sub-item
                  }
                  )}
        
        {/* Button to create new folder */}

      </Sidebar>
  
    </div>
  );
};

//returns the parent folder that contains the item, or flse if not found
//currFolder - the folder that is currently being considered as the parent 
const getFolderOf = (currFolder, item) =>{
  if(item.id===currFolder.id ){return currFolder;}//only relevant for the original folder on which the function was called
  for(let i = 0; i<currFolder.folders.length; i++){
    console.log('Considering '+currFolder.folders[i].name);
    if(item.id===currFolder.folders[i].id){
      return currFolder;  //found the parent folder and the item is a folder
    }
    let folder = getFolderOf(currFolder.folders[i], item);//recursive call
    if(folder!==false){
      return folder;
    }
  } for(let i = 0; i<currFolder.files.length; i++){
    console.log('Considering '+currFolder.files[i].name);
    if(item.id===currFolder.files[i].id){
      return currFolder;  //found the parent folder and the item is a file
    }
  } 
  return false;  
}
const resizeSidebarButton = (isColapsed, toggle) => {
  // Event handler for mouse move
  const handleMouseMove = (e) => {
    const newWidth = e.clientX - 50;
    console.log(newWidth)
    sidebarWidth= newWidth;
    toggle(rootFolder.id);
    toggle(rootFolder.id);
  };

  // Event handler for mouse up
  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Event handler for mouse down on resizable handle
  const handleMouseDown = () => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    

    // Clean up event listeners
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div>
    <button className="resize-sidebar-button" onMouseDown={handleMouseDown} onMouseUp = {handleMouseUp} 
            style={{ position: 'fixed', top: '60%', left: `${isColapsed ? 0 : sidebarWidth}px` }}>
    {'o'}
    </button></div>
  );
};
function updateIndentation(ITEM, dx, dy){
  ITEM.dx += dx;  ITEM.dy += dy; 
  if(ITEM instanceof Folder){
    ITEM.folders.map((folder)=>{updateIndentation(folder,dx,dy)})
    ITEM.files.map((file)=>{updateIndentation(file,dx,dy)})
  }
}
const Drag = ({ ITEM, calledFromCanvas, isRoot, isToggoled, handleDeleteFile,handleEditFile, openModal , handleItemRightClick, onMove, handleDeleteFolder, toggle, Style, openModal2 }) => {

   const handleMouseMove = (e) => {
    
    const dx = e.clientX - xOfMouseDown; const dy = e.clientY - yOfMouseDown;
    xOfMouseDown = e.clientX; yOfMouseDown = e.clientY;
    updateIndentation(ITEM, dx, dy);
    console.log('dx '+ITEM.dx+' dy '+ITEM.dy); console.log('refs')
    //console.log([ref.current.offsetTop, ref.current.offsetLeft])
    toggle(getFolderOf(rootFolder,ITEM).id);
    toggle(getFolderOf(rootFolder,ITEM).id);
  };

  // Event handler for mouse up
  const handleMouseUp = () => {
    
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Event handler for mouse down on resizable handle
  const handleMouseDown = (e) => {
    xOfMouseDown = e.clientX; yOfMouseDown = e.clientY; 
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if(calledFromCanvas){
      console.log('using effect from canvas')
    }
    console.log(ITEM);
    // Clean up event listeners
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const ref = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  //const [folderCopy, setFolderCopy] = useState(folder.clone());
  const [visible, setVisible] = useState(ITEM);

  const [{ isOver }, drop] = useDrop({
    accept: ['file','folder'],
    hover(item) {
      if (!ref.current) {
        handleMouseMove();
        return;
      }
      console.log(item )
      console.log('hovering over '); console.log(ITEM);
      // Update the hovered folder
      hoveredOverObject = ITEM;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [, drag] = useDrag({
    type: 'folder',
    item: { ITEM },
    end: (item, monitor) => {
      setIsDragging(false);
      console.log('item.ITEM');console.log(item.ITEM);
      console.log('hoveredOverObject');console.log(hoveredOverObject)
      if (item.ITEM.id !== hoveredOverObject.id) {
        onMove(item.ITEM, hoveredOverObject);
      }
      handleMouseUp();
      return {obj:hoveredOverObject,};
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  drag(drop(ref));
  
  
  if(calledFromCanvas){
    if (ITEM instanceof Folder) {
      if(isRoot){//no delete button
          return (<div ref={ref} style={{ position:`relative`, display: 'flex', alignItems: 'center', opacity: isDragging ? 0.5 : 1 }}>
            {!isToggoled && (<div>
              {ITEM.folders.map((item, index)=> {
                return (
                  <Line2 dx={item.dx-ITEM.dx+50} dy={item.dy-ITEM.dy+buttonHight*(index+1)} 
                          thickness={5} marginLeft={Style.marginLeft} transform={Style.transform}/>
                );
              })}
              {ITEM.files.map((item, index) => {
                return (
                  <Line2 dx={item.dx-ITEM.dx+50} dy={item.dy-ITEM.dy+buttonHight*(index+1+ITEM.folders.length)} 
                          thickness={5} marginLeft={Style.marginLeft} transform={Style.transform}/>
                );
              })}
              </div>
            )}
            <Button
              key={ITEM.id}
              href="#"
              height = {buttonHight}
              icon={AiOutlineFolder}
              onContextMenu={(e) => handleItemRightClick(e, ITEM)}
              style={Style}
              onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
              onDoubleClick={() => openModal2(ITEM)}
              onMouseEnter={() => setVisible(ITEM)}
              onMouseLeave={() => setVisible(null)}
              onClick={() => toggle(ITEM.id)}
              active={isOver} // Optionally, you can apply active styling when folder is hovered
            >
              {ITEM.name}
            </Button>
          </div>);
      }
      else{
        return (
          <div ref={ref} style={{  position:`relative`, display: 'flex', alignItems: 'center', opacity: isDragging ? 0.5 : 1 }}>
            {!isToggoled && (<div>
              {ITEM.folders.map((item, index)=> {
                return (
                  <Line2 dx={item.dx-ITEM.dx+50} dy={item.dy-ITEM.dy+buttonHight*(index+1)} 
                          thickness={5} marginLeft={Style.marginLeft} transform={Style.transform}/>
                );
              })}
              {ITEM.files.map((item, index) => {
                return (
                  <Line2 dx={item.dx-ITEM.dx+50} dy={item.dy-ITEM.dy+buttonHight*(index+1+ITEM.folders.length)} 
                          thickness={5} marginLeft={Style.marginLeft} transform={Style.transform}/>
                );
              })}
              </div>
            )}
            <Button
              key={ITEM.id}
              href="#"
              icon={AiOutlineFolder}
              onContextMenu={(e) => handleItemRightClick(e, ITEM)}
              style={Style}
              onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
              onDoubleClick={() => openModal2(ITEM)}
              onMouseEnter={() => setVisible(ITEM)}
              onMouseLeave={() => setVisible(null)}
              onClick={() => toggle(ITEM.id)}
              active={isOver} // Optionally, you can apply active styling when folder is hovered
            >
              {ITEM.name}
            </Button>
            <button onClick={() => handleDeleteFolder(ITEM)} style={{ marginLeft: '5px', padding: '5px', background: 'none', border: 'none' }}>
              <img src="./src/components/delete_icon.png" alt="Delete" style={{ width: '20px', height: '20px', transform: Style.transform }}  />
            </button>
          </div>
        );
      }
    } else {//file
      return (
        <div ref={ref} key={ITEM.id} style={{ opacity: isDragging ? 0.5 : 1, display: 'flex', alignItems: 'center' }}>
          <Button href="#" icon={FiFile} style={Style}
            onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
            onClick={() => openModal(ITEM)} onContextMenu={(e) => handleItemRightClick(e, ITEM)} >
            {ITEM.name}
          </Button>
          <button onClick={() => handleEditFile(ITEM)} style={{ marginLeft: '5px', padding: '5px', background: 'none', border: 'none',  transform: Style.transform  }}>
            <img src="./src/components/edit_icon.jpg" alt="Edit" style={{ width: '20px', height: '20px' }} />
          </button>
          {/* Delete button */}
          <button onClick={() => handleDeleteFile(ITEM)} style={{ marginLeft: '5px', padding: '5px', background: 'none', border: 'none', transform: Style.transform }}>
            <img src="./src/components/delete_icon.png" alt="Delete" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      );
    }
  }
  else{//not called from canvas
    if (ITEM instanceof Folder) {
      if(isRoot){//no delete button
          return (<div ref={ref} style={{ display: 'flex', alignItems: 'center', opacity: isDragging ? 0.5 : 1 }}>
            <Sidebar.Item
              key={ITEM.id}
              href="#"
              icon={AiOutlineFolder}
              onContextMenu={(e) => handleItemRightClick(e, ITEM)}
              style={Style}
              onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
              onDoubleClick={() => openModal2(ITEM)}
              onMouseEnter={() => setVisible(ITEM)}
              onMouseLeave={() => setVisible(null)}
              onClick={() => toggle(ITEM.id)}
              active={isOver} // Optionally, you can apply active styling when folder is hovered
            >
              {ITEM.name}
            </Sidebar.Item>
          </div>);
      }
      else{
        return (
          <div ref={ref} style={{ display: 'flex', alignItems: 'center', opacity: isDragging ? 0.5 : 1 }}>
            <Sidebar.Item
              key={ITEM.id}
              href="#"
              icon={AiOutlineFolder}
              onContextMenu={(e) => handleItemRightClick(e, ITEM)}
              style={Style}
              onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
              onDoubleClick={() => openModal2(ITEM)}
              onMouseEnter={() => setVisible(ITEM)}
              onMouseLeave={() => setVisible(null)}
              onClick={() => toggle(ITEM.id)}
              active={isOver} // Optionally, you can apply active styling when folder is hovered
            >
              {ITEM.name}
            </Sidebar.Item>
            <button onClick={() => handleDeleteFolder(ITEM)} style={{ marginLeft: '5px', padding: '5px', background: 'none', border: 'none' }}>
              <img src="./src/components/delete_icon.png" alt="Delete" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        );
      }
    } else {
      return (
        <div ref={ref} key={ITEM.id} style={{ opacity: isDragging ? 0.5 : 1, display: 'flex', alignItems: 'center' }}>
          <Sidebar.Item href="#" icon={FiFile} style={Style}
            onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
            onClick={() => openModal(ITEM)} onContextMenu={(e) => handleItemRightClick(e, ITEM)} >
            {ITEM.name}
          </Sidebar.Item>
          <button onClick={() => handleEditFile(ITEM)} style={{ marginLeft: '5px', padding: '5px', background: 'none', border: 'none' }}>
            <img src="./src/components/edit_icon.jpg" alt="Edit" style={{ width: '20px', height: '20px' }} />
          </button>
          {/* Delete button */}
          <button onClick={() => handleDeleteFile(ITEM)} style={{ marginLeft: '5px', padding: '5px', background: 'none', border: 'none' }}>
            <img src="./src/components/delete_icon.png" alt="Delete" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      );
    }
  }
  

};

const Line2 = ({ dx, dy, color="black", thickness=5, marginLeft , transform}) => {
  const length = Math.sqrt((dx) ** 2 + (dy) ** 2);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <div
      className="line"
      style={{
        position: 'absolute',
        marginLeft: marginLeft,
        width: `${length}px`,
        height: `${thickness}px`,
        transform: `rotate(${angle}deg) ${transform} translate(${dx/2}px,${dy/2}px)`,
        backgroundColor: color,
      }}
    ></div>
  );
};
export default MainPage;

