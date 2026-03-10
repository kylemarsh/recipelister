import React, { Component } from "react";
import "./main.css";
import LoginComponent from "./LoginComponent";
import QueryForm from "./QueryForm";
import ResultList from "./ResultList";
import Alert from "./Alert";
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
      filters: {
        fragments: "",
        fullText: false,
        showAdvancedOptions: false,
        tagsAll: [],
        tagsAny: [],
        tagsNone: [],
        sortBy: "alphabetic",
      },
      shuffleKeys: {},
      login: { valid: !!loggedInAs, username: loggedInAs, token: savedJwt },
      error: null,
      errorContext: null,
      targetRecipe: undefined,
      showRecipeEditor: false,
      showTaggingForm: false,
      showNoteEditor: false,
      showAddNote: false,
    };
  }
  render() {
    const loggedIn = this.state.login.valid;
    const searchClass = this.state.targetRecipe
      ? "search-pane recipe-selected"
      : "search-pane";
    return (
      <div className="medium-container">
        <h1>Liz's Recipe Database</h1>
        <div className="topnav">
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
        <hr />
        {this.state.error ? (
          <Alert
            type="error"
            message={this.state.error}
            handleClose={this.handleAlertClose}
          />
        ) : (
          ""
        )}
        <div className="content-container">
          <div className={searchClass}>
            <QueryForm
              fragments={this.state.filters.fragments}
              handleChange={this.handleFilterChange}
              handleMultiselectUpdate={this.handleMultiselectUpdate}
              handleSortChange={this.handleSortChange}
              allLabels={this.state.allLabels}
              tagsAll={this.state.filters.tagsAll}
              tagsAny={this.state.filters.tagsAny}
              tagsNone={this.state.filters.tagsNone}
              showAdvancedOptions={this.state.filters.showAdvancedOptions}
              sortBy={this.state.filters.sortBy}
            />
            <hr />
            <ResultList
              items={this.state.allRecipes}
              filters={this.state.filters}
              sortBy={this.state.filters.sortBy}
              shuffleKeys={this.state.shuffleKeys}
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
              showTaggingForm={this.state.showTaggingForm}
              showNoteEditor={this.state.showNoteEditor}
              showAddNote={this.state.showAddNote}
              recipeHandlers={{
                EditClick: () => this.setState({ showRecipeEditor: true }),
                UntargetClick: () => this.setState({ targetRecipe: undefined }),
                DeleteClick: this.handleRecipeDelete,
              }}
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
      // Auto-dismiss addRecipe errors on successful submission
      const updates = {
        reloadRecipeList: true,
        showRecipeEditor: false,
        targetRecipe: newTarget,
      };
      if (this.state.errorContext === "addRecipe") {
        updates.error = null;
        updates.errorContext = null;
      }
      this.setState(updates);
    } catch (e) {
      this.handleError(e, "error adding recipe", "addRecipe");
    }
  };

  handleRecipeDelete = async (event) => {
    const recipeId = this.state.targetRecipe;
    try {
      await Api.deleteRecipe(recipeId, this.state.login);
      const recipes = this.state.allRecipes.filter((x) => x.ID !== recipeId);
      this.setState({ allRecipes: recipes, targetRecipe: undefined });
    } catch (e) {
      this.handleError(e, "could not delete recipe");
    }
  };

  /*****************
   * LABEL ACTIONS *
   *****************/
  handleLabelLinkClick = (event) => this.setState({ showTaggingForm: true });

  // TODO: reset this state flag to `false` whenever we move away from the form?
  //	* <esc> keypress inside the form
  //	* form (whole thing, not any individual component) losing focus)
  handleLabelLinkCancel = (event) => {
    event.preventDefault();
    this.setState({ showTaggingForm: false });
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
        showTaggingForm: false,
      });
    } catch (e) {
      this.handleError(e, "error adding label");
      this.setState({ showTaggingForm: false });
    }
  };

  handleLabelUnlinkClick = async (event) => {
    const labelTag = event.target.parentElement;
    const labelId = labelTag.dataset.labelId;
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
      this.handleError(e, "error unlinking label from recipe");
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
      this.handleError(e, "error adding note");
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
      this.handleError(e, "error flagging note");
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
      this.handleError(e, "error editing note");
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
      this.handleError(e, "error deleting note");
    }
  };

  /*******************
   * OTHER FUNCTIONS *
   *******************/
  handleAlertClose = (event) => {
    this.setState({ error: undefined, errorContext: null });
  };

  handleFilterChange = (event) => {
    const control = event.target;
    const name = control.name;
    const value = control.type === "checkbox" ? control.checked : control.value;
    const newfilters = {
      ...this.state.filters,
      [name]: value,
    };
    this.setState({ filters: newfilters });
  };

  handleMultiselectUpdate = (name, value) => {
    const newfilters = { ...this.state.filters, [name]: value };
    this.setState({ filters: newfilters });
  };

  handleSortChange = (sortBy) => {
    const newfilters = { ...this.state.filters, sortBy };
    if (sortBy === "shuffle") {
      // Generate stable shuffle keys for all recipes
      const shuffleKeys = {};
      this.state.allRecipes.forEach((recipe) => {
        shuffleKeys[recipe.ID] = Math.random();
      });
      this.setState({ filters: newfilters, shuffleKeys });
    } else {
      // Clear shuffle keys when switching to other sort modes
      this.setState({ filters: newfilters, shuffleKeys: {} });
    }
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

      // Auto-dismiss login errors on successful login
      const updates = {
        login: { valid: true, username: username, token: token },
        reloadRecipeList: true,
      };
      if (this.state.errorContext === "login") {
        updates.error = null;
        updates.errorContext = null;
      }
      this.setState(updates);
      localStorage.setItem("username", username);
      localStorage.setItem("token", token);
    } catch (e) {
      this.handleError(e, "error logging in", "login");
    }
  };

  doLogout = (event) => {
    if (event) {
      event.preventDefault();
    }
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
      this.handleError(e, "error fetching recipe list");
    }
  };

  getLabels = async (event) => {
    try {
      const labels = await Api.fetchLabels();
      this.setState({ allLabels: labels });
    } catch (e) {
      this.handleError(e, "error fetching label list");
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
      this.handleError(e, `could not fetch notes for recipe ${recipeId}`);
    }
  };

  handleError = (error, message, context = null) => {
    console.error(error);
    if (error.message.includes("401")) {
      // we only use 401 to indicate missing / expired auth
      this.setState({ error: "You have been logged out. Please log in again", errorContext: "auth" });
      this.doLogout();
    } else {
      this.setState({ error: message, errorContext: context });
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
