import React from "react";
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
      <TagList
        tags={recipe.Labels}
        handleUnlinkClick={props.handleLabelUnlinkClick}
      />
      <button className="link-tag-button" onClick={props.handleLabelLinkClick}>
        add Label
      </button>
      <span className="note-list-title">Notes</span>
      <NoteList
        notes={recipe.Notes}
        handleDeleteClick={props.handleNoteDeleteClick}
        handleFlagClick={props.handleFlagClick}
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
          &times;
        </span>
      </li>
    );
  });
  return <ul className="tag-list">{tags}</ul>;
};

const NoteList = (props) => {
  if (!props.notes || !props.notes.length) {
    return <div>no notes</div>;
  }
  const notes = props.notes.map((note) => {
    const stamp = new Date(note.Created * 1000).toLocaleString("en-UK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return (
      <li
        className={note.Flagged ? "flagged" : ""}
        data-note-id={note.ID}
        data-flagged={note.Flagged ? "1" : ""}
        key={note.ID}
      >
        <span
          className="note-flag"
          role="img"
          aria-label="flag-icon"
          onClick={props.handleFlagClick}
        >
          🚩
        </span>
        <span className="note-stamp">{stamp}</span>
        <span
          className="note-delete"
          role="img"
          aria-label="close-icon"
          onClick={props.handleDeleteClick}
        >
          &times;
        </span>
        <br />
        {note.Note}
      </li>
    );
  });
  return <ul className="note-list">{notes}</ul>;
};

export default Recipe;
