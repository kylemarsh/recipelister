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
      filters: { fragments: "" },
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
      results = results.filter((recipe) =>
        recipe.Title.toLowerCase().includes(filters.fragments.toLowerCase())
      );
    }
    return results;
  };

  handleResultClick = (event) => {
    this.setState({
      ...this.state,
      currentRecipe: this.state.allRecipes.find((recipe) => {
        return recipe.ID.toString() === event.target.id;
      }),
    });
  };

  doLogin = (event) => {
    const host = "http://localhost:8080/";
    const endpoint = "debug/getToken/";
    // TODO authenticate for real with username/password
    // TODO handle incorrect auth
    // TODO on success, re-fetch recipes.
    fetch(host + endpoint)
      .then((res) => res.json())
      .then(
        (resp) => {
          alert("got token: " + resp.token);
          this.setState({
            ...this.state,
            login: { valid: true, username: "test_user", token: resp.token },
          });
          localStorage.setItem("username", "test_user");
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
    localStorage.removeItem("username", "");
    localStorage.removeItem("token", "");
    this.setState({
      ...this.state,
      login: { valid: false, username: null, token: null },
    });
  };

  componentDidMount() {
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
    //   - re-fetch public recipe list
    // TODO: move this fetch into a helper function that I can pass params to
    fetch(host + endpoint, requestInit)
      .then((res) => res.json())
      .then(
        (resp) => {
          this.setState({
            ...this.state,
            allRecipes: resp,
            results: resp,
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
