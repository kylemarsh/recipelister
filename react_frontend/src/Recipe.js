import React from "react";

const Recipe = (props) => {
  const recipe = props.recipe;
  if (!recipe) {
    return <div>Nothing to show</div>;
  }
  return (
    <div className="recipe-container">
      <h2>{recipe.Title}</h2>
      <p className="recipe-body">{recipe.Body}</p>
      <span className="tag-list-title">Tags</span>
      <TagList tags={recipe.Labels} />
      <span className="note-list-title">Notes</span>
      <NoteList notes={recipe.Notes} handleFlagClick={props.handleFlagClick} />
    </div>
  );
};

const TagList = (props) => {
  if (!props.tags || !props.tags.length) {
    return <div>no tags</div>;
  }
  const tags = props.tags.map((tag) => {
    return <li key={tag.ID}>{tag.Label}</li>;
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
        <br />
        {note.Note}
      </li>
    );
  });
  return <ul className="note-list">{notes}</ul>;
};

export default Recipe;
