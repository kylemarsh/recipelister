import React from "react";

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
  return (
    <form className="link-tag-form" onSubmit={props.handleSubmit}>
      <input name="label" type="text" placeholder="label" />
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
