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
            handleFlagClick={this.handleFlagClick}
            handleLabelLinkClick={this.handleLabelLinkClick}
            handleLabelUnlinkClick={this.handleLabelUnlinkClick}
            handleNoteDeleteClick={this.handleNoteDeleteClick}
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

  handleFlagClick = async (event) => {
    const noteTag = event.target.parentElement;
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
      //FIXME apparently these catches aren't actually catching the error properly?
      console.error(e);
      this.setState({ error: "error flagging note" });
    }
  };

  handleLabelLinkClick = async (event) => {
    //TODO
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
      //FIXME apparently these catches aren't actually catching the error properly?
      console.error(e);
      this.setState({ error: "error unlinking label from recipe" });
    }
  };

  handleNoteDeleteClick = async (event) => {
    //TODO
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
      //FIXME apparently these catches aren't actually catching the error properly?
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
      //FIXME apparently these catches aren't actually catching the error properly?
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
      //FIXME apparently these catches aren't actually catching the error properly?
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
      //FIXME apparently these catches aren't actually catching the error properly?
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
