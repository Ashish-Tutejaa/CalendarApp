import React, {useState, useEffect} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {Form, FormGroup, Label, Input} from 'reactstrap'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

export default function AuthModal({display, setDisplay}){

    const [AuthOption, setAuthOption] = useState(display[1]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        setAuthOption(display[1]);
    }, display)

    return <div className={`AuthModal${display[0] === 0 ? '' : " showModal"}`}>
        <div className='AuthForm'>
        <FontAwesomeIcon className="LoginCancel" icon={faTimes} onClick={() => {setDisplay([0,0])}}/>
        
            <div className='AuthChoice'>
                <div onClick={() => setAuthOption(0)} className={`${AuthOption === 0 ? 'addCol' : ''}`}>
                    <h4>Sign In</h4>
                </div>
                <div onClick={() => setAuthOption(1)} className={`${AuthOption === 1 ? 'addCol' : ''}`}>
                    <h4>Sign Up</h4>
                </div>
            </div>
            
            <div className='AuthDetails'>
                {AuthOption === 0 ? <>
                    <Form>
                        <FormGroup>
                            <Label for='uname'>Username:</Label>
                            <Input value={username} onChange={(e) => {setUsername(e.target.value)}} type='text' name='uname' id='uname' placeholder='Please Enter your Username.'></Input>
                        </FormGroup>
                        <FormGroup>
                            <Label for='pass'>Password:</Label>
                            <Input value={password} onChange={(e) => {setPassword(e.target.value)}} type='password' name='pass' id='pass' placeholder='Please Enter your Password.'></Input>
                        </FormGroup>
                        <FormGroup>
                            <Input onClick={(e) => {
                                e.preventDefault();
                                if(localStorage.getItem('token') !== null){
                                    alert('you\'re already logged in!')
                                    return;
                                }
                                fetch("http://localhost:5000/login", {
                                    method : "POST",
                                    headers : {
                                        'Content-Type' : 'application/json'
                                    },
                                    body : JSON.stringify({
                                        username,
                                        password
                                    })
                                }).then(res => res.json()).then(res => {
                                    if(res.err){
                                        alert(res.err)
                                    } else {
                                        alert("Successfully logged in.");
                                        localStorage.setItem('token',res.token);
                                        setDisplay([0,0]);
                                    }
                                })
                            }} style={{marginTop: "28px"}} type='submit' name='submit' id='submit'></Input>
                        </FormGroup>
                    </Form>
                </>: <>
                    <Form>
                        <FormGroup>
                            <Label for='uname'>Username:</Label>
                            <Input value={username} onChange={(e) => {setUsername(e.target.value)}} type='text' name='uname' id='uname' placeholder='Please Enter your Username.'></Input>
                        </FormGroup>
                        <FormGroup>
                            <Label for='pass'>Password:</Label>
                            <Input value={password} onChange={(e) => {setPassword(e.target.value)}} type='password' name='pass' id='pass' placeholder='Please Enter your Password.'></Input>
                        </FormGroup>
                        <FormGroup>
                            <Input onClick={(e) => {
                                e.preventDefault();
                                if(localStorage.getItem('token') !== null){
                                    alert('you\'re already logged in!')
                                    return;
                                }
                                fetch("http://localhost:5000/register", {
                                    method : "POST",
                                    headers : {
                                        'Content-Type' : 'application/json'
                                    },
                                    body : JSON.stringify({
                                        username,
                                        password
                                    })
                                }).then(res => res.json()).then(res => {
                                    if(res.err){
                                        alert(res.err)
                                    } else {
                                        alert("Successfully registered and logged in.");
                                        localStorage.setItem('token',res.token);
                                        setDisplay([0,0])
                                    }
                                })
                            }} style={{marginTop: "28px"}} type='submit' name='submit' id='submit'></Input>
                        </FormGroup>
                    </Form>
                </>}
            </div>

        </div>
    </div>
}