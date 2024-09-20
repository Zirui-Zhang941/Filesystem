import React from 'react';
import { Button, Container,Row,Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState,useRef,useContext } from "react"
import Form from 'react-bootstrap/Form';
import "../../src/Register.css";
const RegisterPage=()=>{
    const [username,setUserName]=useState();
    const [password,setPassword]=useState();
    const [repassword,setRepassword]=useState();

    const backStyle = {
        position: 'absolute',
        top: '0%', 
        left: '0%', 
    };
    //set up navigator
    const navigate = useNavigate();

    const handleQuit = () => {
      navigate('/'); 
    };
    //handle register
    const handleRegister=()=>{
        if(!username&&!password){
            alert(`You must provide both a username and password!`);
            return;
        }
        if(password!==repassword){
            alert(`Your passwords do not match!`);
            return;
        }
        fetch(`http://cs506-team-31.cs.wisc.edu:8080/register`,{
            method: 'POST',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password,
            }),
        }).then(response => {
            if(response.ok){
                alert(`Successful!`);
                navigate('/'); 
            }else{
                response.json().then(data => {
                    alert(data.msg);
                });
            }
            
        });
    }

    return(
        <div>
            <h1 className='HeaderRegister'>Sign up</h1>
            <Button style={backStyle} onClick={handleQuit}>Back</Button>
            
            <Form.Label className='Registerinfo' htmlFor="username">Username</Form.Label>
            <Form.Control className='Registerinfo2' type="username" placeholder="Username" id='username'
            onChange={(e)=>setUserName(e.target.value)}
            />
            <div>
            <Form.Label className='Registerinfo3' htmlFor="password">Password</Form.Label>
            <Form.Control className='Registerinfo4' type="password" placeholder="Password" id='password'
            onChange={(e)=>setPassword(e.target.value)}
            />
            </div>
            
            <Form.Label  className='Registerinfo5' htmlFor="Repeat Password">Repeat Password</Form.Label>
            <Form.Control className='Registerinfo6' type="password" placeholder="Confirm Password" id='repassword'
            onChange={(e)=>setRepassword(e.target.value)}
            />
            <Button onClick={handleRegister} className='Registerinfo7'>Register</Button>
        </div>

    );
}

export default RegisterPage;