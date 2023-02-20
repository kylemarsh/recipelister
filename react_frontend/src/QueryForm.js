import React from "react";
import AdvancedQuery from "./AdvancedQuery.js";

const QueryForm = (props) => {
  return (
    <form className="query-form" onSubmit={suppressSubmit}>
      <input
        placeholder="Search recipe titles"
        name="fragments"
        type="text"
        value={props.fragments}
        onChange={props.handleChange}
      />
      <div className="search-options">
        <label>
          <input
            name="showAdvancedOptions"
            type="checkbox"
            checked={props.advancedQuery}
            onChange={props.handleChange}
          />
          Advanced
        </label>
        {props.showAdvancedOptions ? (
          <AdvancedQuery
            fullText={props.fullText}
            handleChange={props.handleChange}
            allLabels={props.allLabels}
            tagsAll={props.tagsAll}
            tagsAny={props.tagsAny}
            tagsNone={props.tagsNone}
            handleMultiselectUpdate={props.handleMultiselectUpdate}
          />
        ) : (
          ""
        )}
      </div>
    </form>
  );
};

const suppressSubmit = (e) => {
  e.preventDefault();
};
export default QueryForm;
