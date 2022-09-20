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
    const symb = String.fromCharCode(note.Flagged ? 0x2605 : 0x2606);
    return (
      <li
        className={note.Flagged ? "flagged" : ""}
        data-note-id={note.ID}
        data-flagged={note.Flagged ? "1" : ""}
        key={note.ID}
      >
        <span className="note-stamp">{stamp}</span>&nbsp;|&nbsp;
        <span className="note-actions">
          <span
            className="note-flag"
            role="img"
            aria-label="flag-icon"
            onClick={props.handleFlagClick}
          >
            {symb}
          </span>
          <span
            className="note-edit"
            role="img"
            aria-label="edit-icon"
            onClick={props.handleEditClick}
          >
            &#9998;
          </span>
          <span
            className="note-delete"
            role="img"
            aria-label="close-icon"
            onClick={props.handleDeleteClick}
          >
            &otimes;
          </span>
        </span>
        <br />
        <hr />
        <span className="note-content">{note.Note}</span>
        <form className="note-edit-form hidden">
          <textarea name="text" defaultValue={note.Note} />
          <button
            className="edit-submit-button"
            onClick={props.handleEditSubmit}
          >
            Save
          </button>
          <button
            className="edit-cancel-button"
            //FIXME maybe use onSubmit for the form?
            onClick={props.handleEditCancel}
          >
            Cancel
          </button>
        </form>
      </li>
    );
  });
  return <ul className="note-list">{notes}</ul>;
};

export default Recipe;
