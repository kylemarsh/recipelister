import React from "react";
import Multiselect from "react-widgets/Multiselect";

const AdvancedQuery = (props) => {
  return (
    <div className="advanced-options">
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
        All
        <Multiselect
          dataKey="ID"
          textField="Label"
          data={props.allLabels}
          value={props.tagsAll}
          focusFirstItem={true}
          onChange={(value) => props.handleMultiselectUpdate("tagsAll", value)}
          placeholder="recipes having ALL these labels"
        />
      </label>
      <label>
        Any
        <Multiselect
          dataKey="ID"
          textField="Label"
          data={props.allLabels}
          value={props.tagsAny}
          focusFirstItem={true}
          onChange={(value) => props.handleMultiselectUpdate("tagsAny", value)}
          placeholder="recipes having ANY of these labels"
        />
      </label>
      <label>
        None
        <Multiselect
          dataKey="ID"
          textField="Label"
          data={props.allLabels}
          value={props.tagsNone}
          focusFirstItem={true}
          onChange={(value) => props.handleMultiselectUpdate("tagsNone", value)}
          placeholder="recipes having NONE of these labels"
        />
      </label>
    </div>
  );
};

export default AdvancedQuery;
