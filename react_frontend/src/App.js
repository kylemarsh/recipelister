import React, { Component } from "react";
import "./main.css";
import LoginComponent from "./LoginComponent";
import QueryForm from "./QueryForm";
import ResultList from "./ResultList";
import Recipe from "./Recipe";
import * as Util from "./Util";

import { login, fetchRecipes, fetchNotes, toggleNote } from "./api";

class App extends Component {
  constructor(props) {
    super(props);

    const loggedInAs = localStorage.getItem("username");
    const savedJwt = localStorage.getItem("token");

    this.state = {
      allRecipes: [],
      error: null,
      filters: { fragments: "", fullText: false },
      login: { valid: !!loggedInAs, username: loggedInAs, token: savedJwt },
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
            targetRecipeId={this.state.targetRecipe}
            handleFlagClick={this.handleFlagClick}
            handleTagUnlinkClick={this.handleTagUnlinkClick}
            handleNoteUnlinkClick={this.handleNoteUnlinkClick}
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
      await toggleNote(noteData.noteId, newFlag, config);
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

  handleTagUnlinkClick = async (event) => {
    //get tagid and recipe id
    //make call to remove tag/recipe link
    //find tag in current recipe's Tags and delete it
  };

  handleNoteUnlinkClick = async (event) => {};

  doLogin = async (event) => {
    event.preventDefault();

    var username = event.target.form.username.value;
    // TODO set host from environment or something?
    try {
      const token = await login(event.target.form, {
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
      const recipes = await fetchRecipes(config);
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
      console.error(e.name);
      console.error(e.message);
      this.setState({ error: "error fetching recipe list" });
    }
  };

  loadNotes = async (event) => {
    const recipeId = event.target.id;
    const config = {
      auth: this.state.login,
      host: "http://localhost:8080/",
    };

    try {
      const notes = await fetchNotes(recipeId, config);
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
