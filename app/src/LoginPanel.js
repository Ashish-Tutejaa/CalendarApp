import React, {useState} from 'react';
import {Button} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import AuthModal from './AuthModal.js'

const loggedIn = () => {
    return localStorage.getItem('token');
}

const LoginPanel = ({getToDos, clearAll, display, changeDisplay}) => {

    const flexCenter = 'd-flex flex-column justify-content-center align-items-center';
    const flexStart = 'd-flex flex-column justify-content-start align-items-start'
    const [showModal, setShowModal] = useState([0,0]);
    return <>
        <div className={`LoginPanel${display===0 ? "" : " showLogin"}`}>
            <FontAwesomeIcon className="LoginCancel" icon={faTimes} onClick={() => {changeDisplay(p => p === 0 ? 1 : 0)}}/>
            <div className={`LoginMenu${display===0 ? "Hide" : "Show"} ${loggedIn() === null ? flexCenter : flexStart}`}>
                {loggedIn() === null ? 
                <>
                    <h2>You're not logged in!</h2> 
                    <div>
                        <Button onClick={() => setShowModal([1,0])} className='buttons'>Sign In</Button>
                        <Button onClick={() => setShowModal([1,1])} className='buttons'>Sign Up</Button>
                    </div>
                </>
                : <>
                    <h2>You're logged In!</h2>
                    <Button onClick={() => {
                        localStorage.removeItem('token');
                        setShowModal([0,0]);
                        clearAll();
                    }} className='buttons'>Sign Out</Button>
                </>}
            </div>
        </div>
        <AuthModal getToDos={getToDos} display={showModal} setDisplay={setShowModal}/>
    </> 
}

export default LoginPanel;