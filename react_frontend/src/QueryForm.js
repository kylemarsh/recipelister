import React from "react";
import AdvancedQuery from "./AdvancedQuery.js";

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
      <div className="search-options">
        <label>
          <input
            name="fullText"
            type="checkbox"
            checked={props.fullText}
            onChange={props.handleChange}
          />
          Search full recipe text
        </label>
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

export default QueryForm;
