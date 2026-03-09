import React from "react";
import * as Util from "./Util";

const ResultList = (props) => {
  const filteredItems = Util.applyFilters(props.items, props.filters);
  const rows = filteredItems.map((item) => {
    return (
      <li key={item.ID} id={item.ID} onClick={props.handleClick}>
        {item.Title}
      </li>
    );
  });
  return <ul className="result-list">{rows}</ul>;
};

export default ResultList;
