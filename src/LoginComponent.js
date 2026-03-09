import React from "react";

const LoginComponent = (props) => {
  if (props.loggedIn) {
    return (
      <form className="login-container">
        <button className="auth-button" onClick={props.handleClick}>
          Log Out
        </button>
      </form>
    );
  }

  return (
    <form className="login-container">
      <input placeholder="Username" name="username" type="text" />
      <input name="password" type="password" placeholder="Password" />
      <button className="auth-button" onClick={props.handleClick}>
        Log In
      </button>
    </form>
  );
};

export default LoginComponent;
