import React from "react";

const Recipe = (props) => {
  if (!Object.entries(props).length && props.constructor === Object) {
    return <div>Nothing to show</div>;
  }
  return (
    <div className="recipe-container">
      <h2>{props.Title}</h2>
      <p className="recipe-body">{props.Body}</p>
      <span className="tag-list-title">Tags</span>
      <TagList tags={props.Labels} />
      <span className="note-list-title">Notes</span>
      <NoteList notes={props.Notes} />
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
    return (
      <li className={note.Flagged ? "flagged" : "unflagged"} key={note.ID}>
        <span className="note-stamp">{note.Created}</span>
        {note.Note}
      </li>
    );
  });
  return <ul className="note-list">{notes}</ul>;
};

export default Recipe;
