import React from "react";

const LoginComponent = (props) => {
  if (props.loggedIn) {
    return (
      <button className="authButton" onClick={props.handleClick}>
        Log Out
      </button>
    );
  }

  return (
    <form>
      <input placeholder="Username" name="username" type="text" />
      <input name="password" type="password" />
      <button className="authButton" onClick={props.handleClick}>
        Log In
      </button>
    </form>
  );
};

export default LoginComponent;
