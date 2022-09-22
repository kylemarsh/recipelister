import React from "react";
import NoteList from "./Notes";
import TagList from "./Tags";
import * as Util from "./Util";

const Recipe = (props) => {
  const recipe = Util.selectRecipe(props.targetRecipeId, props.recipes);
  if (!recipe) {
    return <div className="recipe-container"></div>;
  }
  const activeTime = recipe.ActiveTime ? `${recipe.ActiveTime}m` : "-";
  const totalTime = recipe.Time ? `${recipe.Time}m` : "-";
  //FIXME style the edit trigger
  return (
    <div className="recipe-container" data-recipe-id={recipe.ID}>
      <h2>{recipe.Title}</h2>
      <span
        className="recipe-edit-trigger"
        role="img"
        aria-label="edit-icon"
        onClick={props.handleEditClick}
      >
        &#9998;
      </span>
      <span className="recipe-timing">
        <div className="active-time">Active Time: {activeTime}</div>
        <div className="total-time">Total Time: {totalTime}</div>
      </span>
      <hr />
      <p className="recipe-body">{recipe.Body}</p>
      <span className="tag-list-title">Tags</span>
      <TagList
        loggedIn={props.loggedIn}
        tags={recipe.Labels}
        showLabelEditor={props.showLabelEditor}
        handlers={props.labelHandlers}
      />
      {props.loggedIn ? (
        <div className="notes-section">
          <span className="note-list-title">Notes</span>
          <NoteList
            notes={recipe.Notes}
            showNoteEditor={props.showNoteEditor}
            showAddNote={props.showAddNote}
            handlers={props.noteHandlers}
          />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

const NewRecipeForm = (props) => {
  const recipe = props.recipeId
    ? Util.selectRecipe(props.recipeId, props.recipes)
    : {};
  //TODO: Add in labels
  //TODO: label boxes when prefilled?
  //TODO: Use better widgets (react-widgets?)
  //	* number picker for times
  //	* multiselect for labels
  return (
    <div className="recipe-editor">
      <form className="recipe-editor-form" onSubmit={props.handleSubmit}>
        <input
          name="title"
          type="text"
          placeholder="Title"
          defaultValue={recipe.Title}
        />
        <input
          name="activeTime"
          type="text"
          placeholder="Active time"
          defaultValue={recipe.ActiveTime}
        />
        <input
          name="totalTime"
          type="text"
          placeholder="Total time"
          defaultValue={recipe.Time}
        />
        <textarea
          name="body"
          placeholder="Type Recipe Here..."
          defaultValue={recipe.Body}
        />
        <button>Add</button>
        <button onClick={props.handleCancel}>Cancel</button>
      </form>
    </div>
  );
};

export { Recipe, NewRecipeForm };
