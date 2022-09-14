import React, { Component } from "react";
import "./main.css";
import LoginComponent from "./LoginComponent";
import QueryForm from "./QueryForm";
import ResultList from "./ResultList";
import Recipe from "./Recipe";

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
        <QueryForm
          fragments={this.state.filters.fragments}
          handleChange={this.handleFilterChange}
        />
        <hr />
        <ResultList
          items={this.state.results}
          handleClick={this.handleResultClick}
        />
        <hr />
        <Recipe {...this.state.currentRecipe} />
        <hr />
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
      ...this.state,
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
      ...this.state,
      targetRecipe: event.target.id,
      currentRecipe: this.fetchRecipe(event.target.id, this.state.allRecipes),
    });
  };

  doLogin = (event) => {
    event.preventDefault();

    var username = event.target.form.username.value;
    var formData = new FormData(event.target.form);
    var requestInit = {
      method: "POST",
      body: formData,
    };
    // TODO set host from environment or something?
    const host = "http://localhost:8080/";
    const endpoint = "login/";
    // TODO handle incorrect auth
    fetch(host + endpoint, requestInit)
      .then((res) => res.json())
      .then(
        (resp) => {
          this.setState({
            ...this.state,
            login: { valid: true, username: username, token: resp.token },
            reloadRecipeList: true,
          });
          localStorage.setItem("username", username);
          localStorage.setItem("token", resp.token);
        },
        (error) => {
          alert(error);
          this.setState({
            ...this.state,
            error: error,
          });
        }
      );
  };

  doLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem("username", "");
    localStorage.removeItem("token", "");
    this.setState({
      ...this.state,
      login: { valid: false, username: null, token: null },
      reloadRecipeList: true,
    });
  };

  getRecipes = (event) => {
    const token = this.state.login.token;
    var host = "http://localhost:8080/";
    var endpoint = "recipes/";
    var requestInit = {};
    if (token) {
      requestInit = { headers: { "x-access-token": token } };
      endpoint = "priv/recipes/";
    }
    // TODO: handle expired/invalid auth token
    //   - remove token from state and localStorage
    fetch(host + endpoint, requestInit)
      .then((res) => res.json())
      .then(
        (resp) => {
          this.setState({
            ...this.state,
            allRecipes: resp,
            results: resp,
            currentRecipe: this.fetchRecipe(this.state.targetRecipe, resp),
          });
        },
        (error) => {
          alert(error);
          this.setState({
            ...this.state,
            error: error,
          });
        }
      );
  };

  fetchRecipe = (targetId, recipeList) => {
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

  sampleResults = [
    {
      ID: 23,
      Title: "Chicken Pot Pie",
      tags: ["chicken", "main", "soup/stew"],
      instructions: "1 Chicken\n3 cups water\nSpices",
    },
    {
      ID: 42,
      Title: "Decadent Cake",
      tags: ["dessert", "cake", "baking"],
      instructions:
        "Preheat oven to 350\nEmpty box into bowl\nMix in 3 eggs\nBake for 40 min",
    },
  ];
}

export default App;
