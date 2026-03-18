import React, { useRef, useEffect } from "react";
import Combobox from "react-widgets/Combobox";
import * as Util from "./Util";

// This component manages the display of labels that are tagged to a recipe.
// Terminology:
//   - Label: An attribute object (e.g., "chicken", "vegan") that exists in the database
//   - Tag: The association between a recipe and a label
// The component is named "TagList" because it shows which labels are tagged to this recipe.

const TagList = (props) => {
  var tags;
  if (props.tags && props.tags.length) {
    tags = props.tags.map((tag) => {
      return (
        <TagListItem
          key={tag.ID}
          tag={tag}
          unlinkHandler={props.handlers.UnlinkClick}
          loggedIn={props.loggedIn}
          isAdmin={props.isAdmin}
        />
      );
    });
  }
  return (
    <div className="tag-list-container">
      <ul className="tag-list">
        {tags}
        {props.loggedIn && props.isAdmin ? (
          <li>
            {props.showTaggingForm ? (
              <TagRecipeForm
                allLabels={props.allLabels}
                currentTags={props.tags}
                handleSubmit={props.handlers.LinkSubmit}
                handleCancel={props.handlers.LinkCancel}
              />
            ) : (
              <AddTagTrigger handleTriggerClick={props.handlers.LinkClick} />
            )}
          </li>
        ) : (
          ""
        )}
      </ul>
    </div>
  );
};

const TagListItem = (props) => {
  return (
    <li data-label-id={props.tag.ID} data-label-name={props.tag.Label}>
      {props.tag.Label}
      {props.loggedIn && props.isAdmin ? (
        <span
          className="tag-unlink"
          role="img"
          aria-label="delete-icon"
          onClick={props.unlinkHandler}
        >
          &otimes;
        </span>
      ) : (
        ""
      )}
    </li>
  );
};

const AddTagTrigger = (props) => {
  return (
    <span className="link-tag-trigger" onClick={props.handleTriggerClick}>
      + add label
    </span>
  );
};

const TagRecipeForm = (props) => {
  const inputRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // Filter out labels already tagged to this recipe
  const currentTagIds = props.currentTags ? props.currentTags.map(t => t.ID) : [];
  const availableLabels = props.allLabels ? props.allLabels.filter(l => !currentTagIds.includes(l.ID)) : [];

  // Sort labels for display
  const sortedLabels = Util.sortLabelsForMultiselect(availableLabels);

  // Handle selection from dropdown - auto-submit
  const handleSelect = (value) => {
    if (value && typeof value === 'object') {
      // User selected from dropdown, auto-submit
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.requestSubmit();
        }
      }, 0);
    }
  };

  // Allow creating new labels
  const handleCreate = (name) => {
    return name;
  };

  // Render list items with "(new)" indicator for typed values that don't exist
  const renderListItem = ({ item }) => {
    // Check if this item is a string (newly typed) vs object (existing label)
    if (typeof item === 'string') {
      return (
        <span>
          {item} <em>(new)</em>
        </span>
      );
    }
    return <span>{item.Label}</span>;
  };

  // Handle Tab key to submit and reopen form
  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      // Create synthetic submit event with custom flag
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      submitEvent.fromTabKey = true;
      formRef.current.dispatchEvent(submitEvent);
    }
  };

  return (
    <form ref={formRef} className="link-tag-form" onSubmit={props.handleSubmit}>
      <Combobox
        ref={inputRef}
        name="label"
        dataKey="ID"
        textField="Label"
        groupBy="Type"
        data={sortedLabels}
        onCreate={handleCreate}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        renderListItem={renderListItem}
        placeholder="label"
      />
      <button className="inline-text-button submit">
        {String.fromCharCode(0x2713)}
      </button>
      <button
        className="inline-text-button cancel"
        onClick={props.handleCancel}
      >
        {String.fromCharCode(0x2717)}
      </button>
    </form>
  );
};

export default TagList;
