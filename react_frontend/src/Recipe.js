import React from "react";
import NoteList from "./Notes";
import * as Util from "./Util";

const Recipe = (props) => {
  const recipe = Util.selectRecipe(props.targetRecipeId, props.recipes);
  if (!recipe) {
    return <div className="recipe-container"></div>;
  }
  return (
    <div className="recipe-container" data-recipe-id={recipe.ID}>
      <h2>{recipe.Title}</h2>
      <p className="recipe-body">{recipe.Body}</p>
      <span className="tag-list-title">Tags</span>
      <div className="tag-list-container">
        <TagList
          tags={recipe.Labels}
          handleUnlinkClick={props.handleLabelUnlinkClick}
        />
        <span className="link-tag-trigger" onClick={props.handleLabelLinkClick}>
          &oplus;
        </span>
        <form
          className="link-tag-form hidden"
          onSubmit={props.handleLabelLinkSubmit}
        >
          <input name="label" type="text" placeholder="label" />
          <button className="inline-text-button submit">
            {String.fromCharCode(0x2713)}
          </button>
          <button
            className="inline-text-button cancel"
            onClick={props.handleLabelLinkCancel}
          >
            {String.fromCharCode(0x2717)}
          </button>
        </form>
      </div>
      <span className="note-list-title">Notes</span>
      <NoteList
        notes={recipe.Notes}
        handleDeleteClick={props.handleNoteDeleteClick}
        handleEditClick={props.handleNoteEditClick}
        handleEditSubmit={props.handleNoteEditSubmit}
        handleEditCancel={props.handleNoteEditCancel}
        handleFlagClick={props.handleNoteFlagClick}
        handleAddClick={props.handleNoteAddClick}
        handleAddCancel={props.handleNoteAddCancel}
        handleAddSubmit={props.handleNoteAddSubmit}
      />
    </div>
  );
};

const TagList = (props) => {
  if (!props.tags || !props.tags.length) {
    return <div>no tags</div>;
  }
  const tags = props.tags.map((tag) => {
    return (
      <li key={tag.ID} data-tag-id={tag.ID} data-tag-name={tag.Label}>
        {tag.Label}
        <span
          className="tag-unlink"
          role="img"
          aria-label="close-icon"
          onClick={props.handleUnlinkClick}
        >
          &otimes;
        </span>
      </li>
    );
  });
  return <ul className="tag-list">{tags}</ul>;
};

export default Recipe;
