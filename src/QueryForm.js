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
            checked={props.showAdvancedOptions}
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
      <div className="sort-buttons">
        <button
          type="button"
          className={props.sortBy === "alphabetic" ? "active" : ""}
          onClick={() => props.handleSortChange("alphabetic")}
          title="Sort alphabetically"
          data-tooltip="Sort alphabetically"
        >
          🔤
        </button>
        <button
          type="button"
          className={props.sortBy === "newest" ? "active" : ""}
          onClick={() => props.handleSortChange("newest")}
          title="Sort by newest first"
          data-tooltip="Sort by newest first"
        >
          📅
        </button>
        <button
          type="button"
          className={props.sortBy === "shuffle" ? "active" : ""}
          onClick={() => props.handleSortChange("shuffle")}
          title="Shuffle"
          data-tooltip="Shuffle"
        >
          🔀
        </button>
        <span className="button-divider"></span>
        <button
          type="button"
          className={props.groupBy !== "" ? "active" : ""}
          onClick={props.handleGroupToggle}
          title="Group by label type"
          data-tooltip="Group by label type"
        >
          📂{props.groupBy !== "" ? ` ${props.groupBy}` : ""}
        </button>
      </div>
    </form>
  );
};

const suppressSubmit = (e) => {
  e.preventDefault();
};
export default QueryForm;
