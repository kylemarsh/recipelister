import React from "react";

const QueryForm = (props) => {
  return (
    <form className="query-form">
      <input
        placeholder="Search recipe titles"
        name="fragments"
        type="text"
        value={props.fragments}
        onChange={props.handleChange}
      />
      <label>
        <input
          name="fullText"
          type="checkbox"
          checked={props.fullText}
          onChange={props.handleChange}
        />
        Search full recipe text
      </label>
    </form>
  );
};

export default QueryForm;
