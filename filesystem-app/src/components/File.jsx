import { useDrag, useDrop } from 'react-dnd';
import { useRef } from 'react';
import { Sidebar } from 'flowbite-react';
import { FiFile } from 'react-icons/fi';
const subItemStyle = {
  fontSize: '16px', // Adjust font size for sub-items
  padding: '8px 10px', // Add padding to sub-items
  color: '#666', // Text color for sub-items
};

let hoveredOverObject = null; 

const File = ({ file, onMove, handleDeleteFile, openModal , handleFileDoubleClick}) => {

  const ref = useRef(null);
  console.log('initialized a file ');
  // Hook for drag and drop
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'file',
    item: { file },
    end: (item, monitor) => {
      console.log(item);
      console.log(`You dropped ${item.file.name} `); console.log(`into`); console.log(hoveredOverObject)
      if (item.file.id !== hoveredOverObject.id) {
        console.log('calling move ');
        onMove(item.file, hoveredOverObject);
      }
      return {obj:hoveredOverObject,};
    },
    collect: (monitor) => {
      return{
        isDragging: !!monitor.isDragging(),
      };
    },
  }));
 
  console.log('isDragging '+ isDragging);
  // Hook for drop
  const [, drop] = useDrop({
    accept: ['file', 'folder'], // Accept both files and folders
    hover(item) {
      if (!ref.current) {
        return;
      }
      
      hoveredOverObject = file;
      console.log('hovering over '); console.log(file);
    },
  });
  const getFolder = () =>{return false}
  // Attach drag and drop refs
  drag(drop(ref));

  return (
    <div ref={ref} key={file.id} style={{ opacity: isDragging ? 0.5 : 1, display: 'flex', alignItems: 'center' }}>
    <Sidebar.Item href="#" icon={FiFile} style={subItemStyle} onClick={() => openModal(file)} getFolder={()=>getFolder()} onDoubleClick={() => handleFileDoubleClick(file)} >
      {file.name}
    </Sidebar.Item>
    {/* Delete button */}
    <button onClick={() => handleDeleteFile(file)} style={{ marginLeft: '5px', padding: '5px', background: 'none', border: 'none' }}>
      <img src="./src/components/delete_icon.png" alt="Delete" style={{ width: '20px', height: '20px' }} />
    </button>
  </div>
  );
};

export default File;


/**const File = (props) => {
    return <div>
        <h2>{props.filename} {props.fileproperty}</h2>
        <img></img>
    </div>
}

export default File;*/