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
      <h2>{recipe.Title}{recipe.New ? " (New!)" : ""}</h2>
      <RecipeActions type="recipe" isAdmin={props.isAdmin} {...props.recipeHandlers} />
      <div className="recipe-timing">
        <div className="active-time">Active Time: {activeTime}</div>
        <div className="total-time">Total Time: {totalTime}</div>
      </div>
      <hr />
      <p className="recipe-body">{recipe.Body}</p>
      <span className="tag-list-title">Tags</span>
      <TagList
        loggedIn={props.loggedIn}
        isAdmin={props.isAdmin}
        tags={recipe.Labels}
        showTaggingForm={props.showTaggingForm}
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
        <div className="toggle-container">
          <input
            id="new-toggle"
            name="new"
            type="checkbox"
            className="toggle-checkbox"
            defaultChecked={recipe.New === false}
          />
          <label htmlFor="new-toggle" className="toggle-label">
            <span className="toggle-track">
              <span className="toggle-circle"></span>
            </span>
            <span className="toggle-text-off">I haven't tried this yet</span>
            <span className="toggle-text-on">I've tried it!</span>
          </label>
        </div>
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

const RecipeActions = (props) => {
  return (
    <div className="recipe-actions">
      <button
        className="recipe-action-button recipe-untarget-trigger"
        onClick={props.UntargetClick}
        aria-label="Go back to recipe list"
      >
        ←
      </button>
      {props.isAdmin ? (
        <button
          className="recipe-action-button recipe-edit-trigger"
          onClick={props.EditClick}
          aria-label="Edit recipe"
        >
          &#9998;
        </button>
      ) : (
        ""
      )}
      {props.isAdmin ? (
        <button
          className="recipe-action-button recipe-delete-trigger"
          onClick={props.DeleteClick}
          aria-label="Delete recipe"
        >
          🗑
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export { Recipe, NewRecipeForm };
