import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(''); // State variable for username
  const [password, setPassword] = useState(''); // State variable for password

  
  // handles login
  const handleLogin=()=>{
    //set up the formData sending to Backend
    const formData=new FormData();
    formData.append("username",username);
    formData.append("password",password);

      fetch(`http://cs506-team-31.cs.wisc.edu:8080/login`,{
        method: 'POST',
        body:formData,
      }).then(response=>{
        if(response.ok||response.status===204){
          sessionStorage.setItem('username',username)
          alert(`Login Successful!`);
          navigate('/main');
        }else{
          alert("Wrong Username or Passowrd!")
          response.json().then(data => {
            alert(data.msg);
          });
        }

      });

  }
  
  // Function to handle changes in the username input field
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  // Function to handle changes in the password input field
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  // navigate user to register page if not a prior user
  const handleRegister = () => {
    navigate(`/register`)
  };

  return (
    <div style={styles.container}>
      <h1>MySQL Filesystem</h1>
      <div style={styles.formContainer}>
        <div style={styles.inputContainer}>
          <input type="text" placeholder="Username" style={styles.input} value={username} onChange={handleUsernameChange} />
        </div>
        <div style={styles.inputContainer}>
          <input type="password" placeholder="Password" style={styles.input} value={password} onChange={handlePasswordChange} />
        </div>
        <button onClick={handleLogin} style={styles.button}>Login</button>
        <button onClick={handleRegister} style={styles.button}>Register</button>

      </div>
    </div>
  );
}

//CSS
const styles = {
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '250px',
  },
  button: {
    margin: '5px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
    width: '250px',
  },
};

export default LoginPage;
