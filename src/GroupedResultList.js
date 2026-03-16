import React from "react";
import * as Util from "./Util";
import ResultList from "./ResultList";

const GroupedResultList = (props) => {
  const filteredItems = Util.applyFilters(props.items, props.filters);

  // If grouping is disabled, just render a single ResultList
  if (!props.groupBy) {
    return (
      <ResultList
        items={filteredItems}
        sortBy={props.sortBy}
        shuffleKeys={props.shuffleKeys}
        handleClick={props.handleClick}
        handleIconClick={props.handleIconClick}
      />
    );
  }

  // Grouping is enabled
  const groupingLabels = Util.getGroupingLabels(props.labels, props.groupBy).sort();

  // Get recipes that don't have any grouping labels
  const otherRecipes = filteredItems.filter((recipe) => {
    if (!recipe.Labels || !recipe.Labels.length) {
      return true;
    }
    const hasGroupingLabel = recipe.Labels.some((label) =>
      groupingLabels.some((groupLabel) => groupLabel.toLowerCase() === label.Label.toLowerCase())
    );
    return !hasGroupingLabel;
  });

  const renderGroup = (labelName, recipes) => {
    if (recipes.length === 0) {
      return null;
    }

    const isExpanded = props.expandedGroups[labelName] || false;
    const icon = isExpanded ? "▼" : "▶";

    return (
      <div key={labelName} className="group-section">
        <div
          className="group-header"
          onClick={() => props.handleGroupToggle(labelName)}
        >
          <span className="group-icon">{icon}</span>
          <span className="group-label">{labelName}</span>
          <span className="group-count">({recipes.length})</span>
        </div>
        {isExpanded && (
          <ResultList
            items={recipes}
            sortBy={props.sortBy}
            shuffleKeys={props.shuffleKeys}
            handleClick={props.handleClick}
            handleIconClick={props.handleIconClick}
          />
        )}
      </div>
    );
  };

  return (
    <div className="grouped-result-list">
      {groupingLabels.map((labelName) => {
        const groupRecipes = Util.filterRecipesByLabel(filteredItems, labelName);
        return renderGroup(labelName, groupRecipes);
      })}
      {renderGroup("Other", otherRecipes)}
    </div>
  );
};

export default GroupedResultList;
