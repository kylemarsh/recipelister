import React from 'react'

const LoginComponent = props => {
    const text = props.loggedIn ? (props.username + " Log Out") : "Log In"
    return <button className="authButton" onClick={props.handleClick}>{text}</button>
}

export default LoginComponent
