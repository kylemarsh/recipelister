import { React } from "react";

export default function Alert(props) {
  return (
    <div className={`alert ${props.type}`}>
      <span className="alert-close-button" onClick={props.handleClose}>
        &times;
      </span>
      {props.message}
    </div>
  );
}
