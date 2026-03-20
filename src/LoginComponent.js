import React from "react";

const LoginComponent = (props) => {
  if (props.loggedIn) {
    return (
      <form className="login-container">
        {props.isAdmin && !props.showLabelManager && (
          <button
            type="button"
            className="manage-labels-button"
            onClick={props.handleManageLabelsClick}
            title="Manage Labels"
            data-tooltip="Manage Labels"
          >
            ⚙️
          </button>
        )}
        <button
          className="auth-button"
          onClick={props.handleClick}
          title="Log Out"
          data-tooltip="Log Out"
        >
          👋
        </button>
      </form>
    );
  }

  return (
    <form className="login-container">
      <input placeholder="Username" name="username" type="text" />
      <input name="password" type="password" placeholder="Password" />
      <button
        className="auth-button"
        onClick={props.handleClick}
        title="Log In"
        data-tooltip="Log In"
      >
        👤
      </button>
    </form>
  );
};

export default LoginComponent;
