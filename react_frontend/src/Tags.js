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
          <LinkTagForm
            handleTriggerClick={props.handlers.LinkClick}
            handleSubmit={props.handlers.LinkSubmit}
            handleCancel={props.handlers.LinkCancel}
          />
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

const LinkTagForm = (props) => {
  return (
    <div className="link-tag-container">
      <span className="link-tag-trigger" onClick={props.handleTriggerClick}>
        + add label
      </span>
      <form className="link-tag-form hidden" onSubmit={props.handleSubmit}>
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
    </div>
  );
};

export default TagList;
