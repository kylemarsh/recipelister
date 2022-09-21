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
        showLabelEditor={props.showLabelEditor}
        handlers={props.labelHandlers}
      />
      <span className="note-list-title">Notes</span>
      <NoteList
        notes={recipe.Notes}
        showNoteEditor={props.showNoteEditor}
        showAddNote={props.showAddNote}
        handlers={props.noteHandlers}
      />
    </div>
  );
};

export default Recipe;
