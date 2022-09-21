import React from "react";

const NoteList = (props) => {
  var notes;
  if (props.notes && props.notes.length) {
    notes = props.notes.map((note) => {
      return (
        <NoteListItem
          key={note.ID}
          note={note}
          showEditor={props.showNoteEditor}
          handleFlagClick={props.handlers.FlagClick}
          handleDeleteClick={props.handlers.DeleteClick}
          handleEditClick={props.handlers.EditClick}
          handleEditSubmit={props.handlers.EditSubmit}
          handleEditCancel={props.handlers.EditCancel}
        />
      );
    });
  }
  return (
    <ul className="note-list">
      {notes}
      <li>
        {props.showAddNote ? (
          <EditNoteForm
            showEditor={true}
            handleSubmit={props.handlers.AddSubmit}
            handleCancel={props.handlers.AddCancel}
          />
        ) : (
          <AddNoteTrigger handleClick={props.handlers.AddClick} />
        )}
      </li>
    </ul>
  );
};

const NoteListItem = (props) => {
  const note = props.note;
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
    >
      <span className="note-stamp">{stamp}</span>&nbsp;|&nbsp;
      <NoteActions
        noteId={note.ID}
        flagged={note.Flagged}
        showEditor={props.showEditor}
        handleFlagClick={props.handleFlagClick}
        handleEditClick={props.handleEditClick}
        handleEditCancel={props.handleEditCancel}
        handleDeleteClick={props.handleDeleteClick}
      />
      <br />
      <hr />
      {props.showEditor === note.ID ? (
        <EditNoteForm
          note={note}
          handleSubmit={props.handleEditSubmit}
          handleCancel={props.handleEditCancel}
        />
      ) : (
        <span className="note-content">{note.Note}</span>
      )}
    </li>
  );
};

const NoteActions = (props) => {
  const symb = String.fromCharCode(props.flagged ? 0x2605 : 0x2606);
  return (
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
        data-note-id={props.noteId}
        onClick={
          props.showEditor === props.noteId
            ? props.handleEditCancel
            : props.handleEditClick
        }
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
  );
};

const EditNoteForm = (props) => {
  const defaultText = props.note ? props.note.Note : "";
  return (
    <form className="note-edit-form" onSubmit={props.handleSubmit}>
      <textarea name="text" defaultValue={defaultText} />
      <button className="textarea-button submit">
        {String.fromCharCode(0x2713)}
      </button>
      <button className="textarea-button cancel" onClick={props.handleCancel}>
        {String.fromCharCode(0x2717)}
      </button>
    </form>
  );
};

const AddNoteTrigger = (props) => {
  return (
    <span className="note-add-trigger" onClick={props.handleClick}>
      + Add Note
    </span>
  );
};

export default NoteList;
