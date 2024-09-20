import React from 'react';
import Modal from 'react-modal';

// Component for displaying a success popup when a file is uploaded successfully
const SuccessPopup = ({ isOpen, closeModal }) => {
  // Custom styles for the modal
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'lightgreen',
      border: '2px solid green',
      borderRadius: '8px',
      padding: '20px',
    },
  };

  // Render the success popup modal
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Success Popup"
      style={customStyles}
    >
      {/* Title for the popup */}
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>File Uploaded Successfully!</h2>
      
      {/* Button to close the modal */}
      <button style={{ display: 'block', margin: '0 auto' }} onClick={closeModal}>Close</button>
    </Modal>
  );
};

export default SuccessPopup;
