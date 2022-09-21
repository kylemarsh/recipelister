import React from "react";

const TagList = (props) => {
  var tags;
  if (props.tags && props.tags.length) {
    tags = props.tags.map((tag) => {
      return (
        <TagListItem
          key={tag.ID}
          tag={tag}
          unlinkHandler={props.handlers.UnlinkClick}
        />
      );
    });
  }
  return (
    <div className="tag-list-container">
      <ul className="tag-list">
        {tags}
        <li>
          {props.showLabelEditor ? (
            <LinkTagForm
              handleSubmit={props.handlers.LinkSubmit}
              handleCancel={props.handlers.LinkCancel}
            />
          ) : (
            <LinkTagTrigger handleTriggerClick={props.handlers.LinkClick} />
          )}
        </li>
      </ul>
    </div>
  );
};

const TagListItem = (props) => {
  return (
    <li data-tag-id={props.tag.ID} data-tag-name={props.tag.Label}>
      {props.tag.Label}
      <span
        className="tag-unlink"
        role="img"
        aria-label="delete-icon"
        onClick={props.unlinkHandler}
      >
        &otimes;
      </span>
    </li>
  );
};

const LinkTagTrigger = (props) => {
  return (
    <span className="link-tag-trigger" onClick={props.handleTriggerClick}>
      + add label
    </span>
  );
};

const LinkTagForm = (props) => {
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
