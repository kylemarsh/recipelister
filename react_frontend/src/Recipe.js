import React from "react";
import NoteList from "./Notes";
import TagList from "./Tags";
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
        handleLabelLinkClick={props.handleLabelLinkClick}
        handleLabelLinkSubmit={props.handleLabelLinkSubmit}
        handleLabelLinkCancel={props.handleLabelLinkCancel}
      />
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

export default Recipe;
