import React, { Component } from "react";
import "./main.css";
import LoginComponent from "./LoginComponent";
import QueryForm from "./QueryForm";
import ResultList from "./ResultList";
import { Recipe, NewRecipeForm } from "./Recipe";
import * as Util from "./Util";
import * as Api from "./api";

class App extends Component {
  constructor(props) {
    super(props);

    const loggedInAs = localStorage.getItem("username");
    const savedJwt = localStorage.getItem("token");

    this.state = {
      allRecipes: [],
      allLabels: [],
      filters: { fragments: "", fullText: false },
      login: { valid: !!loggedInAs, username: loggedInAs, token: savedJwt },
      error: null,
      targetRecipe: undefined,
      showRecipeEditor: false,
      showLabelEditor: false,
      showNoteEditor: false,
      showAddNote: false,
    };
  }
  render() {
    const loggedIn = this.state.login.valid;
    return (
      <div className="medium-container">
        <h1>Liz's Recipe Database</h1>
        <div className="content-container">
          <div className="search-pane">
            <QueryForm
              fragments={this.state.filters.fragments}
              handleChange={this.handleFilterChange}
            />
            <ResultList
              items={this.state.allRecipes}
              filters={this.state.filters}
              handleClick={this.handleResultClick}
            />
          </div>
          {this.state.showRecipeEditor ? (
            <NewRecipeForm
              recipeId={this.state.targetRecipe}
              recipes={this.state.allRecipes}
              handleSubmit={this.handleNewRecipeSubmit}
              handleCancel={this.handleNewRecipeCancel}
            />
          ) : this.state.targetRecipe ? (
            <Recipe
              loggedIn={loggedIn}
              recipes={this.state.allRecipes}
              availableLabels={this.state.allLabels}
              targetRecipeId={this.state.targetRecipe}
              showLabelEditor={this.state.showLabelEditor}
              showNoteEditor={this.state.showNoteEditor}
              showAddNote={this.state.showAddNote}
              handleEditClick={this.triggerEditRecipe}
              noteHandlers={{
                FlagClick: this.handleNoteFlagClick,
                EditClick: this.handleNoteEditClick,
                EditCancel: this.handleNoteEditCancel,
                EditSubmit: this.handleNoteEditSubmit,
                DeleteClick: this.handleNoteDeleteClick,
                AddClick: this.handleNoteAddClick,
                AddCancel: this.handleNoteAddCancel,
                AddSubmit: this.handleNoteAddSubmit,
              }}
              labelHandlers={{
                LinkClick: this.handleLabelLinkClick,
                LinkSubmit: this.handleLabelLinkSubmit,
                LinkCancel: this.handleLabelLinkCancel,
                UnlinkClick: this.handleLabelUnlinkClick,
              }}
            />
          ) : (
            ""
          )}
        </div>
        <div className="footer">
          <hr />
          <LoginComponent
            loggedIn={loggedIn}
            username={this.state.login.username}
            handleClick={loggedIn ? this.doLogout : this.doLogin}
          />
          {loggedIn ? (
            <button onClick={this.triggerAddRecipe}>New Recipe</button>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }

  /******************
   * RECIPE ACTIONS *
   ******************/
  triggerAddRecipe = (event) => {
    event.preventDefault();
    this.setState({ showRecipeEditor: true, targetRecipe: undefined });
  };

  handleNewRecipeCancel = (event) => {
    event.preventDefault();
    this.setState({ showRecipeEditor: false });
  };

  handleNewRecipeSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const targetId = this.state.targetRecipe;
    var recipe;
    try {
      if (targetId) {
        await Api.updateRecipe(targetId, formData, this.state.login);
      } else {
        recipe = await Api.createRecipe(formData, this.state.login);
      }
      const newTarget = recipe ? recipe.ID : targetId;
      this.setState({
        reloadRecipeList: true,
        showRecipeEditor: false,
        targetRecipe: newTarget,
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: "error adding recipe" });
    }
  };

  triggerEditRecipe = (event) => {
    this.setState({ showRecipeEditor: true });
  };

  /*****************
   * LABEL ACTIONS *
   *****************/
  handleLabelLinkClick = (event) => this.setState({ showLabelEditor: true });

  // TODO: reset this state flag to `false` whenever we move away from the form?
  //	* <esc> keypress inside the form
  //	* form (whole thing, not any individual component) losing focus)
  handleLabelLinkCancel = (event) => {
    event.preventDefault();
    this.setState({ showLabelEditor: false });
  };

  // TODO: bind to <tab> keypress inside the form?
  handleLabelLinkSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const labelName = formData.get("label").toLowerCase();
    const recipeTag = form.closest(".recipe-container");
    const recipeId = recipeTag.dataset.recipeId;
    var labelData = this.state.allLabels.find((x) => x.Label === labelName);
    var labelIsNew = false;

    try {
      if (!labelData) {
        // Create the label before we can link it
        labelData = await Api.createLabel(labelName, this.state.login);
        labelIsNew = true;
      }
      await Api.linkLabel(recipeId, labelData.ID, this.state.login);
      const recipe = Util.selectRecipe(
        this.state.targetRecipe,
        this.state.allRecipes
      );
      var labelEntry;
      if (recipe.Labels) {
        labelEntry = recipe.Labels.find((x) => x.ID === parseInt(labelData.ID));
        if (!labelEntry) {
          recipe.Labels.push(labelData);
        }
      } else {
        recipe.Labels = [labelData];
      }
      const allLabels = this.state.allLabels;
      if (labelIsNew) {
        allLabels.push(labelData);
      }
      this.setState({
        allLabels: allLabels,
        allRecipes: this.state.allRecipes,
        showLabelEditor: false,
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: "error editing note", showLabelEditor: false });
    }
  };

  handleLabelUnlinkClick = async (event) => {
    const labelTag = event.target.parentElement;
    const labelId = labelTag.dataset.tagId;
    const recipeTag = labelTag.closest(".recipe-container");
    const recipeId = recipeTag.dataset.recipeId;

    try {
      await Api.unlinkLabel(recipeId, labelId, this.state.login);
      const recipe = Util.selectRecipe(
        this.state.targetRecipe,
        this.state.allRecipes
      );
      const newTags = recipe.Labels.filter((x) => x.ID !== parseInt(labelId));
      recipe.Labels = newTags;
      this.setState({ allRecipes: this.state.allRecipes });
    } catch (e) {
      console.error(e);
      this.setState({ error: "error unlinking label from recipe" });
    }
  };

  /*****************
   * NOTES ACTIONS *
   *****************/
  handleNoteAddClick = (event) => {
    //FIXME how do we focus to textarea inside the newly-rendered component?
    this.setState({ showAddNote: true });
  };

  handleNoteAddCancel = (event) => {
    event.preventDefault();
    this.setState({ showAddNote: false });
  };

  handleNoteAddSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const recipeTag = form.closest(".recipe-container");
    const recipeId = recipeTag.dataset.recipeId;

    try {
      const hasText = !!formData.get("text");
      if (hasText) {
        const newNote = await Api.createNote(
          recipeId,
          formData,
          this.state.login
        );
        const recipe = Util.selectRecipe(
          this.state.targetRecipe,
          this.state.allRecipes
        );
        if (recipe.Notes) {
          recipe.Notes.push(newNote);
        } else {
          recipe.Notes = [newNote];
        }
        this.setState({ allRecipes: this.state.allRecipes });
      }
    } catch (e) {
      console.error(e);
      this.setState({ error: "error editing note" });
    }
    this.setState({ showAddNote: false });
  };

  handleNoteFlagClick = async (event) => {
    const noteTag = event.target.closest("li");
    const noteData = noteTag.dataset;

    try {
      const newFlag = !noteData.flagged;
      await Api.toggleNote(noteData.noteId, newFlag, this.state.login);
      const recipe = Util.selectRecipe(
        this.state.targetRecipe,
        this.state.allRecipes
      );
      const note = recipe.Notes.find((n) => n.ID === parseInt(noteData.noteId));
      note.Flagged = newFlag;
      this.setState({ allRecipes: this.state.allRecipes });
    } catch (e) {
      console.error(e);
      this.setState({ error: "error flagging note" });
    }
  };

  handleNoteEditClick = (event) => {
    this.setState({ showNoteEditor: parseInt(event.target.dataset.noteId) });
  };
  handleNoteEditCancel = (event) => {
    event.preventDefault();
    this.setState({ showNoteEditor: false });
  };

  handleNoteEditSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const noteTag = event.target.closest("li");
    const noteId = noteTag.dataset.noteId;

    try {
      await Api.editNote(noteId, formData, this.state.login);
      const recipe = Util.selectRecipe(
        this.state.targetRecipe,
        this.state.allRecipes
      );
      var noteData = recipe.Notes.find((x) => x.ID === parseInt(noteId));
      noteData.Note = formData.get("text");
      this.setState({ allRecipes: this.state.allRecipes });
    } catch (e) {
      console.error(e);
      this.setState({ error: "error editing note" });
    }
    this.setState({ showNoteEditor: false });
  };

  handleNoteDeleteClick = async (event) => {
    const noteTag = event.target.closest("li");
    const noteId = noteTag.dataset.noteId;
    try {
      await Api.deleteNote(noteId, this.state.login);
      const recipe = Util.selectRecipe(
        this.state.targetRecipe,
        this.state.allRecipes
      );
      const newNotes = recipe.Notes.filter((x) => x.ID !== parseInt(noteId));
      recipe.Notes = newNotes;
      this.setState({ allRecipes: this.state.allRecipes });
    } catch (e) {
      console.error(e);
      this.setState({ error: "error deleting note" });
    }
  };

  /*******************
   * OTHER FUNCTIONS *
   *******************/
  handleFilterChange = (event) => {
    const newfilters = {
      ...this.state.filters,
      [event.target.name]: event.target.value,
    };
    this.setState({ filters: newfilters });
  };

  handleResultClick = (event) => {
    this.setState({
      showRecipeEditor: false,
      targetRecipe: parseInt(event.target.id),
    });
    if (this.state.login.valid) {
      this.loadNotes(event);
    }
  };

  doLogin = async (event) => {
    event.preventDefault();

    var username = event.target.form.username.value;
    try {
      const token = await Api.login(event.target.form);

      this.setState({
        login: { valid: true, username: username, token: token },
        reloadRecipeList: true,
      });
      localStorage.setItem("username", username);
      localStorage.setItem("token", token);
    } catch (e) {
      // TODO: make UI react to invalid auth
      console.error(e.name);
      console.error(e.message);
      this.setState({ error: "error logging in" });
    }
  };

  doLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem("username", "");
    localStorage.removeItem("token", "");
    this.setState({
      login: { valid: false, username: null, token: null },
      reloadRecipeList: true,
    });
  };

  getRecipes = async (event) => {
    try {
      const recipes = await Api.fetchRecipes(this.state.login);
      this.setState({ allRecipes: recipes });
    } catch (e) {
      // TODO: handle expired/invalid auth token -- figure out exactly what
      // that error looks like
      //if(e.message == "bad token") {
      //  console.error("invalid authentication; logging out")
      //  this.doLogout() //fixme can I do this without an event?
      //  this.getRecipes(event); // try again to just get the titles/tags
      //  this.setState({ error: "login expired" });
      //}
      console.error(e);
      this.setState({ error: "error fetching recipe list" });
    }
  };

  getLabels = async (event) => {
    try {
      const labels = await Api.fetchLabels();
      this.setState({ allLabels: labels });
    } catch (e) {
      console.error(e);
      this.setState({ error: "error fetching label list" });
    }
  };

  loadNotes = async (event) => {
    const recipeId = event.target.id;
    try {
      const notes = await Api.fetchNotes(recipeId, this.state.login);
      const recipes = this.state.allRecipes;
      const recipe = Util.selectRecipe(recipeId, recipes);
      recipe.Notes = notes;
      this.setState({ allRecipes: recipes });
    } catch (e) {
      console.error(e.name);
      console.error(e.message);
      this.setState({ error: `could not fetch notes for recipe ${recipeId}` });
    }
  };

  /*********************
   * LIFECYCLE METHODS *
   *********************/
  componentDidMount() {
    this.getRecipes();
    this.getLabels();
  }

  componentDidUpdate() {
    if (this.state.reloadRecipeList) {
      this.getRecipes();
      this.setState({ reloadRecipeList: false });
    }
  }
}

export default App;
