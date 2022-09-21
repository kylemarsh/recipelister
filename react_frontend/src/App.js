import React, { Component } from "react";
import "./main.css";
import LoginComponent from "./LoginComponent";
import QueryForm from "./QueryForm";
import ResultList from "./ResultList";
import Recipe from "./Recipe";
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
          <Recipe
            recipes={this.state.allRecipes}
            availableLabels={this.state.allLabels}
            targetRecipeId={this.state.targetRecipe}
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
        </div>
        <div className="footer">
          <hr />
          <LoginComponent
            loggedIn={loggedIn}
            username={this.state.login.username}
            handleClick={loggedIn ? this.doLogout : this.doLogin}
          />
        </div>
      </div>
    );
  }

  handleFilterChange = (event) => {
    const newfilters = {
      ...this.state.filters,
      [event.target.name]: event.target.value,
    };
    this.setState({ filters: newfilters });
  };

  handleResultClick = (event) => {
    this.setState({ targetRecipe: event.target.id });
    this.loadNotes(event);
  };

  handleLabelLinkClick = (event) => {
    const addLabelTag = event.target;
    const recipe = addLabelTag.closest(".recipe-container");
    const form = recipe.querySelector(".link-tag-form");
    form.reset();

    addLabelTag.classList.add("hidden");
    form.classList.remove("hidden");
    form.querySelector("[name=label]").focus();
  };

  // TODO: Bind this to <esc> keypress inside the form
  handleLabelLinkCancel = (event) => {
    event.preventDefault();
    const form = event.target.closest("form");
    const recipe = event.target.closest(".recipe-container");
    const linkLabelTrigger = recipe.querySelector(".link-tag-trigger");

    linkLabelTrigger.classList.remove("hidden");
    form.classList.add("hidden");
  };

  // TODO: <tab> keypres inside the form?
  handleLabelLinkSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const labelName = formData.get("label").toLowerCase();
    const recipeTag = form.closest(".recipe-container");
    const recipeId = recipeTag.dataset.recipeId;
    const addTagButton = recipeTag.querySelector(".link-tag-trigger");
    var labelData = this.state.allLabels.find((x) => x.Label === labelName);
    var labelIsNew = false;

    const config = {
      auth: this.state.login,
      host: "http://localhost:8080/",
    };

    try {
      if (!labelData) {
        // Create the label before we can link it
        labelData = await Api.createLabel(labelName, config);
        labelIsNew = true;
      }
      await Api.linkLabel(recipeId, labelData.ID, config);
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
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: "error editing note" });
    }

    form.classList.add("hidden");
    addTagButton.classList.remove("hidden");
  };

  handleLabelUnlinkClick = async (event) => {
    const labelTag = event.target.parentElement;
    const labelId = labelTag.dataset.tagId;
    const recipeTag = labelTag.closest(".recipe-container");
    const recipeId = recipeTag.dataset.recipeId;

    const config = {
      auth: this.state.login,
      host: "http://localhost:8080/",
    };
    try {
      await Api.unlinkLabel(recipeId, labelId, config);
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

  //FIXME is it more react-y to have a component for the form and render that
  //based on application state instead of fiddling with `display:none` stuff?
  handleNoteAddClick = (event) => {
    const addNoteTag = event.target;
    const noteList = addNoteTag.closest(".add-note-container");
    const form = noteList.querySelector(".add-note-form");
    form.reset();

    addNoteTag.classList.add("hidden");
    form.classList.remove("hidden");
    form.querySelector("textarea").focus();
  };

  handleNoteAddCancel = (event) => {
    event.preventDefault();
    const form = event.target.closest("form");
    const noteList = form.closest(".add-note-container");
    const addNoteTrigger = noteList.querySelector(".note-add-trigger");

    form.classList.add("hidden");
    addNoteTrigger.classList.remove("hidden");
  };

  handleNoteAddSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const recipeTag = form.closest(".recipe-container");
    const recipeId = recipeTag.dataset.recipeId;
    const addNoteTrigger = recipeTag.querySelector(".note-add-trigger");

    const config = {
      auth: this.state.login,
      host: "http://localhost:8080/",
    };

    try {
      const hasText = !!formData.get("text");
      if (hasText) {
        const newNote = await Api.createNote(recipeId, formData, config);
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
    form.classList.add("hidden");
    addNoteTrigger.classList.remove("hidden");
  };

  handleNoteFlagClick = async (event) => {
    const noteTag = event.target.closest("li");
    const noteData = noteTag.dataset;

    const config = {
      auth: this.state.login,
      host: "http://localhost:8080/",
    };

    try {
      const newFlag = !noteData.flagged;
      await Api.toggleNote(noteData.noteId, newFlag, config);
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
    const noteTag = event.target.closest("li");
    const contentTag = noteTag.querySelector(".note-content");
    const contentForm = noteTag.querySelector(".note-edit-form");
    contentTag.classList.add("hidden");
    contentForm.classList.remove("hidden");
    contentForm.querySelector("textarea").focus();
  };
  handleNoteEditCancel = (event) => {
    event.preventDefault();
    const noteTag = event.target.closest("li");
    const contentTag = noteTag.querySelector(".note-content");
    const contentForm = noteTag.querySelector(".note-edit-form");
    contentTag.classList.remove("hidden");
    contentForm.classList.add("hidden");
  };

  handleNoteEditSubmit = async (event) => {
    event.preventDefault();
    const noteTag = event.target.closest("li");
    const noteId = noteTag.dataset.noteId;
    const contentTag = noteTag.querySelector(".note-content");
    const contentForm = noteTag.querySelector(".note-edit-form");
    const formData = new FormData(contentForm);

    const config = {
      auth: this.state.login,
      host: "http://localhost:8080/",
    };

    try {
      await Api.editNote(noteId, formData, config);
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
    contentTag.classList.remove("hidden");
    contentForm.classList.add("hidden");
  };

  handleNoteDeleteClick = async (event) => {
    const noteTag = event.target.closest("li");
    const noteId = noteTag.dataset.noteId;

    const config = {
      auth: this.state.login,
      host: "http://localhost:8080/",
    };
    try {
      await Api.deleteNote(noteId, config);
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

  doLogin = async (event) => {
    event.preventDefault();

    var username = event.target.form.username.value;
    // TODO set host from environment or something?
    try {
      const token = await Api.login(event.target.form, {
        host: "http://localhost:8080/",
      });

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
    const config = {
      auth: this.state.login,
      host: "http://localhost:8080/",
    };

    try {
      const recipes = await Api.fetchRecipes(config);
      this.setState({
        allRecipes: recipes,
        results: recipes,
      });
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
    const config = { host: "http://localhost:8080/" };

    try {
      const labels = await Api.fetchLabels(config);
      this.setState({ allLabels: labels });
    } catch (e) {
      console.error(e);
      this.setState({ error: "error fetching label list" });
    }
  };

  loadNotes = async (event) => {
    const recipeId = event.target.id;
    const config = {
      auth: this.state.login,
      host: "http://localhost:8080/",
    };

    try {
      const notes = await Api.fetchNotes(recipeId, config);
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

  componentDidMount() {
    this.getRecipes();
    this.getLabels();
  }

  componentDidUpdate() {
    if (this.state.reloadRecipeList) {
      this.getRecipes();
      this.setState({
        ...this.state,
        reloadRecipeList: false,
      });
    }
  }
}

export default App;
