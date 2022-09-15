import React, { Component } from "react";
import "./main.css";
import LoginComponent from "./LoginComponent";
import QueryForm from "./QueryForm";
import ResultList from "./ResultList";
import Recipe from "./Recipe";

import { login, fetchRecipes, fetchNotes } from "./api";

class App extends Component {
  constructor(props) {
    super(props);

    const loggedInAs = localStorage.getItem("username");
    const savedJwt = localStorage.getItem("token");

    this.state = {
      allRecipes: [],
      results: [],
      currentRecipe: null,
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
              items={this.state.results}
              handleClick={this.handleResultClick}
            />
          </div>
          <Recipe {...this.state.currentRecipe} />
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
    const results = this.applyFilters(newfilters);
    this.setState({
      filters: newfilters,
      results: results,
    });
  };

  applyFilters = (filters) => {
    //TODO other filters
    //FIXME: make it like slackmoji search, where it can skip characters
    var results = this.state.allRecipes;
    if (filters.fragments !== "") {
      results = results.filter(
        (recipe) =>
          recipe.Title.toLowerCase().includes(
            filters.fragments.toLowerCase()
          ) ||
          (filters.fullText &&
            recipe.Body.toLowerCase().includes(filters.fragments.toLowerCase()))
      );
    }
    return results;
  };

  handleResultClick = (event) => {
    this.setState({
      targetRecipe: event.target.id,
      currentRecipe: this.selectRecipe(event.target.id, this.state.allRecipes),
    });
    this.loadNotes(event);
  };

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
        currentRecipe: this.selectRecipe(this.state.targetRecipe, recipes),
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
      var recipe = this.selectRecipe(recipeId, this.state.allRecipes);
      recipe.Notes = notes;
      this.setState({ currentRecipe: recipe });
    } catch (e) {
      console.error(e.name);
      console.error(e.message);
      this.setState({ error: `could not fetch notes for recipe ${recipeId}` });
    }
  };

  selectRecipe = (targetId, recipeList) => {
    return recipeList.find((recipe) => {
      return recipe.ID.toString() === targetId;
    });
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
