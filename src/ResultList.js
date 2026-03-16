import React from "react";
import * as Util from "./Util";

const ResultList = (props) => {
  const sortedItems = Util.sortRecipes(props.items, props.sortBy, props.shuffleKeys);
  const rows = sortedItems.map((item) => {
    return (
      <li key={item.ID} id={item.ID} onClick={props.handleClick}>
        {item.New && "• "}{item.Title}
        {item.Labels && item.Labels.map(label =>
          label.Icon ? (
            <span
              key={label.ID}
              className="recipe-icon"
              title={label.Label}
              onClick={(e) => props.handleIconClick(e, label)}
            >
              {label.Icon}
            </span>
          ) : null
        )}
      </li>
    );
  });
  return <ul className="result-list">{rows}</ul>;
};

export default ResultList;
