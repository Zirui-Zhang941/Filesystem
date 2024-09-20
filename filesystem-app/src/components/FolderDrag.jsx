import { useDrag, useDrop } from 'react-dnd';
import { useRef, useState } from 'react';
import { Sidebar } from 'flowbite-react';
import { AiOutlineFolder } from 'react-icons/ai';


const itemStyle = {
  fontSize: '18px',
  padding: '8px 10px',
  color: '#333',
};
let folderCopy = null;
let hoveredOverObject = null; 
const FolderDrag = ({ folder, onMove, handleDeleteFolder, toggle }) => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  //const [folderCopy, setFolderCopy] = useState(folder.clone());
  const [visible, setVisible] = useState(folder);

  const [{ isOver }, drop] = useDrop({
    accept: ['file','folder'],
    hover(item) {
      if (!ref.current) {
        return;
      }
      console.log('hovering over '); console.log(folder);
      // Update the hovered folder
      hoveredOverObject = folder;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [, drag] = useDrag({
    type: 'folder',
    item: { folder },
    end: (item, monitor) => {
      setIsDragging(false);
      console.log('item.folder');console.log(item.folder);
      console.log('hoveredOverObject');console.log(hoveredOverObject)
      if (item.folder.id !== hoveredOverObject.id) {
        onMove(item.folder, hoveredOverObject);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const getFolder = () => {
    return folder;
  }

  const handleClick = (event) => {
    //event.stopPropagation(); // Stop propagation to parent elements
    toggle(folder.id);
  };

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'center', opacity: isDragging ? 0.5 : 1 }}>
      <Sidebar.Item
        key={folder.id}
        href="#"
        getFolder={()=>getFolder()}
        icon={AiOutlineFolder}
        style={itemStyle}
        onMouseEnter={() => setVisible(folder)}
        onMouseLeave={() => setVisible(null)} 
        onClick={handleClick}
        active={isOver} // Optionally, you can apply active styling when folder is hovered
      >
        {folder.name}
      </Sidebar.Item>
      <button onClick={() => handleDeleteFolder(folder)} style={{ marginLeft: '5px', padding: '5px', background: 'none', border: 'none' }}>
        <img src="./src/components/delete_icon.png" alt="Delete" style={{ width: '20px', height: '20px' }} />
      </button>
    </div>
  );
};

export default FolderDrag;
