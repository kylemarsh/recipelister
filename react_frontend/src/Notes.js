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
        <AddNoteForm
          handleAddClick={props.handlers.AddClick}
          handleAddSubmit={props.handlers.AddSubmit}
          handleAddCancel={props.handlers.AddCancel}
        />
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
  return (
    <form className="note-edit-form">
      <textarea name="text" defaultValue={props.note.Note} />
      <button className="edit-submit-button" onClick={props.handleSubmit}>
        Save
      </button>
      <button className="edit-cancel-button" onClick={props.handleCancel}>
        Cancel
      </button>
    </form>
  );
};

const AddNoteForm = (props) => {
  return (
    <div className="add-note-container">
      <span className="note-add-trigger" onClick={props.handleAddClick}>
        + Add Note
      </span>
      <form className="add-note-form hidden" onSubmit={props.handleAddSubmit}>
        <textarea name="text" />
        <button className="textarea-button submit">
          {String.fromCharCode(0x2713)}
        </button>
        <button
          className="textarea-button submit"
          onClick={props.handleAddCancel}
        >
          {String.fromCharCode(0x2717)}
        </button>
      </form>
    </div>
  );
};

export default NoteList;
