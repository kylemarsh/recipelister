import React from "react";
import Multiselect from "react-widgets/Multiselect";
import * as Util from "./Util";

const AdvancedQuery = (props) => {
  const sortedLabels = Util.sortLabelsForMultiselect(props.allLabels);

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
          groupBy="Type"
          data={sortedLabels}
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
          groupBy="Type"
          data={sortedLabels}
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
          groupBy="Type"
          data={sortedLabels}
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
