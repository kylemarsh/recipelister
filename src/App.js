import React, { Component } from "react";
import { jwtDecode } from "jwt-decode";
import "./main.css";
import LoginComponent from "./LoginComponent";
import QueryForm from "./QueryForm";
import GroupedResultList from "./GroupedResultList";
import Alert from "./Alert";
import { Recipe, NewRecipeForm } from "./Recipe";
import * as Util from "./Util";
import * as Api from "./api";

function decodeAdminFlag(token) {
  if (!token) {
    return false;
  }
  try {
    const decoded = jwtDecode(token);
    return decoded.is_admin === true;
  } catch (error) {
    console.error('Failed to decode admin flag:', error);
    return false;
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    const loggedInAs = localStorage.getItem("username");
    const savedJwt = localStorage.getItem("token");
    const isAdmin = decodeAdminFlag(savedJwt);

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
        groupBy: "Course",
      },
      shuffleKeys: {},
			expandedGroups: { Main: true },
      login: { valid: !!loggedInAs, username: loggedInAs, token: savedJwt, isAdmin },
      error: null,
      errorContext: null,
      targetRecipe: undefined,
      showRecipeEditor: false,
      showTaggingForm: false,
      tagFormInputValue: '',
      showNoteEditor: false,
      showAddNote: false,
      recipeJustEdited: false,
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
          {loggedIn && this.state.login.isAdmin ? (
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
              handleGroupToggle={this.handleGroupToggle}
              allLabels={this.state.allLabels}
              tagsAll={this.state.filters.tagsAll}
              tagsAny={this.state.filters.tagsAny}
              tagsNone={this.state.filters.tagsNone}
              showAdvancedOptions={this.state.filters.showAdvancedOptions}
              sortBy={this.state.filters.sortBy}
              groupBy={this.state.filters.groupBy}
            />
            <hr />
            <GroupedResultList
              items={this.state.allRecipes}
              labels={this.state.allLabels}
              filters={this.state.filters}
              groupBy={this.state.filters.groupBy}
              sortBy={this.state.filters.sortBy}
              shuffleKeys={this.state.shuffleKeys}
              expandedGroups={this.state.expandedGroups}
              handleGroupToggle={this.handleGroupCollapse}
              handleClick={this.handleResultClick}
              handleIconClick={this.handleIconClick}
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
              isAdmin={this.state.login.isAdmin}
              recipes={this.state.allRecipes}
              availableLabels={this.state.allLabels}
              targetRecipeId={this.state.targetRecipe}
              showTaggingForm={this.state.showTaggingForm}
              showNoteEditor={this.state.showNoteEditor}
              showAddNote={this.state.showAddNote}
              recipeHandlers={{
                EditClick: () => this.setState({ showRecipeEditor: true }),
                UntargetClick: () => {
                  this.setState({ targetRecipe: undefined });
                  this.clearUrl();
                },
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
                InputChange: this.handleTagInputChange,
                FormBlur: this.handleTagFormBlur,
                FormEscape: this.handleTagFormEscape,
              }}
              tagFormInputValue={this.state.tagFormInputValue}
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
    // Transform new field for backend expectations
    Util.transformNewField(formData);
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
        recipeJustEdited: true, // Flag to update URL after recipes reload
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
      // Auto-dismiss deleteRecipe errors on successful deletion
      const updates = { allRecipes: recipes, targetRecipe: undefined };
      if (this.state.errorContext === "deleteRecipe") {
        updates.error = null;
        updates.errorContext = null;
      }
      this.setState(updates);
      this.clearUrl();
    } catch (e) {
      this.handleError(e, "could not delete recipe", "deleteRecipe");
    }
  };

  /*****************
   * LABEL ACTIONS *
   *****************/
  handleLabelLinkClick = (event) => this.setState({ showTaggingForm: true });

  handleLabelLinkCancel = (event) => {
    event.preventDefault();
    this.setState({ showTaggingForm: false });
  };

  handleTagInputChange = (value) => {
    this.setState({ tagFormInputValue: value });
  };

  handleTagFormBlur = () => {
    this.setState({ showTaggingForm: false });
  };

  handleTagFormEscape = () => {
    this.setState({ showTaggingForm: false });
  };

  handleLabelLinkSubmit = async (event) => {
    event.preventDefault();
    const isTabSubmit = event.fromTabKey;
    const form = event.target;
    const formData = new FormData(form);
    const labelName = formData.get("label").toLowerCase();
    const recipeTag = form.closest(".recipe-container");
    const recipeId = recipeTag.dataset.recipeId;
    var labelData = this.state.allLabels.find((x) => x.Label.toLowerCase() === labelName);
    var labelIsNew = false;

    try {
      if (!labelData) {
        // Create the label before we can link it
        labelData = await Api.createLabel(labelName, this.state.login);
        // Format label for display
        labelData = Util.formatLabelsForDisplay([labelData])[0];
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
      // Auto-dismiss addLabel errors on successful label addition
      const updates = {
        allLabels: allLabels,
        allRecipes: this.state.allRecipes,
        showTaggingForm: isTabSubmit, // Reopen form if submitted via Tab
        tagFormInputValue: '', // Clear input value on submit
      };
      if (this.state.errorContext === "addLabel") {
        updates.error = null;
        updates.errorContext = null;
      }
      this.setState(updates);
    } catch (e) {
      this.handleError(e, "error adding label", "addLabel");
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
      // Auto-dismiss unlinkLabel errors on successful unlinking
      const updates = { allRecipes: this.state.allRecipes };
      if (this.state.errorContext === "unlinkLabel") {
        updates.error = null;
        updates.errorContext = null;
      }
      this.setState(updates);
    } catch (e) {
      this.handleError(e, "error unlinking label from recipe", "unlinkLabel");
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
        // Auto-dismiss addNote errors on successful note addition
        const updates = { allRecipes: this.state.allRecipes };
        if (this.state.errorContext === "addNote") {
          updates.error = null;
          updates.errorContext = null;
        }
        this.setState(updates);
      }
    } catch (e) {
      this.handleError(e, "error adding note", "addNote");
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
      // Auto-dismiss flagNote errors on successful flag toggle
      const updates = { allRecipes: this.state.allRecipes };
      if (this.state.errorContext === "flagNote") {
        updates.error = null;
        updates.errorContext = null;
      }
      this.setState(updates);
    } catch (e) {
      this.handleError(e, "error flagging note", "flagNote");
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
      // Auto-dismiss editNote errors on successful note edit
      const updates = { allRecipes: this.state.allRecipes };
      if (this.state.errorContext === "editNote") {
        updates.error = null;
        updates.errorContext = null;
      }
      this.setState(updates);
    } catch (e) {
      this.handleError(e, "error editing note", "editNote");
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
      // Auto-dismiss deleteNote errors on successful note deletion
      const updates = { allRecipes: this.state.allRecipes };
      if (this.state.errorContext === "deleteNote") {
        updates.error = null;
        updates.errorContext = null;
      }
      this.setState(updates);
    } catch (e) {
      this.handleError(e, "error deleting note", "deleteNote");
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

  handleGroupToggle = () => {
    const availableTypes = Util.getAvailableTypes(this.state.allLabels);
    const currentGroupBy = this.state.filters.groupBy;

    // Cycle through: "" -> first type -> second type -> ... -> ""
    let newGroupBy;
    if (currentGroupBy === "") {
      // Start with first available type (should be "Course" if it exists)
      newGroupBy = availableTypes.length > 0 ? availableTypes[0] : "";
    } else {
      const currentIndex = availableTypes.indexOf(currentGroupBy);
      if (currentIndex >= 0 && currentIndex < availableTypes.length - 1) {
        // Move to next type
        newGroupBy = availableTypes[currentIndex + 1];
      } else {
        // Cycle back to no grouping
        newGroupBy = "";
      }
    }

    const newfilters = { ...this.state.filters, groupBy: newGroupBy };
    this.setState({ filters: newfilters });
  };

  handleGroupCollapse = (groupLabel) => {
    const newExpandedGroups = { ...this.state.expandedGroups };
    newExpandedGroups[groupLabel] = !newExpandedGroups[groupLabel];
    this.setState({ expandedGroups: newExpandedGroups });
  };

  handleResultClick = (event) => {
    const recipeId = parseInt(event.target.id);
    const recipe = Util.selectRecipe(recipeId, this.state.allRecipes);

    // Auto-dismiss routing errors on successful recipe selection
    const updates = {
      showRecipeEditor: false,
      targetRecipe: recipeId,
    };
    if (this.state.errorContext === "routing") {
      updates.error = null;
      updates.errorContext = null;
    }
    this.setState(updates);

    // Update URL with recipe ID and slug
    if (recipe) {
      this.updateUrl(recipeId, recipe.Title);
    }

    if (this.state.login.valid) {
      this.loadNotes(event);
    }
  };

  handleIconClick = (event, label) => {
    event.stopPropagation(); // Prevent recipe selection

    // Check if label is already in tagsAll
    const isAlreadySelected = this.state.filters.tagsAll.some(
      (tag) => tag.ID === label.ID
    );

    if (!isAlreadySelected) {
      const newTagsAll = [...this.state.filters.tagsAll, label];
      const newFilters = {
        ...this.state.filters,
        tagsAll: newTagsAll,
        showAdvancedOptions: true, // Enable advanced options if not already
      };
      this.setState({ filters: newFilters });
    } else {
      // If already selected, enable advanced options so user can see it
      if (!this.state.filters.showAdvancedOptions) {
        const newFilters = {
          ...this.state.filters,
          showAdvancedOptions: true,
        };
        this.setState({ filters: newFilters });
      }
    }
  };

  doLogin = async (event) => {
    event.preventDefault();

    var username = event.target.form.username.value;
    try {
      const token = await Api.login(event.target.form);
      const isAdmin = decodeAdminFlag(token);

      // Auto-dismiss login errors on successful login
      const updates = {
        login: { valid: true, username, token, isAdmin },
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
      login: { valid: false, username: null, token: null, isAdmin: false },
      reloadRecipeList: true,
    });
  };

  getRecipes = async (event) => {
    try {
      const recipes = await Api.fetchRecipes(this.state.login);
      // Format labels within each recipe for display
      const formattedRecipes = recipes.map(recipe => ({
        ...recipe,
        Labels: recipe.Labels ? Util.formatLabelsForDisplay(recipe.Labels) : recipe.Labels
      }));
      // Auto-dismiss fetchRecipes errors on successful fetch
      const updates = { allRecipes: formattedRecipes };
      if (this.state.errorContext === "fetchRecipes") {
        updates.error = null;
        updates.errorContext = null;
      }
      this.setState(updates);
    } catch (e) {
      this.handleError(e, "error fetching recipe list", "fetchRecipes");
    }
  };

  getLabels = async (event) => {
    try {
      const labels = await Api.fetchLabels();
      const formattedLabels = Util.formatLabelsForDisplay(labels);
      // Auto-dismiss fetchLabels errors on successful fetch
      const updates = { allLabels: formattedLabels };
      if (this.state.errorContext === "fetchLabels") {
        updates.error = null;
        updates.errorContext = null;
      }
      this.setState(updates);
    } catch (e) {
      this.handleError(e, "error fetching label list", "fetchLabels");
    }
  };

  loadNotes = async (event) => {
    const recipeId = event.target.id;
    try {
      const notes = await Api.fetchNotes(recipeId, this.state.login);
      const recipes = this.state.allRecipes;
      const recipe = Util.selectRecipe(recipeId, recipes);
      recipe.Notes = notes;
      // Auto-dismiss fetchNotes errors on successful fetch
      const updates = { allRecipes: recipes };
      if (this.state.errorContext === "fetchNotes") {
        updates.error = null;
        updates.errorContext = null;
      }
      this.setState(updates);
    } catch (e) {
      this.handleError(e, `could not fetch notes for recipe ${recipeId}`, "fetchNotes");
    }
  };

  handleError = (error, fallbackMessage, context = null) => {
    console.error(error);

    const parsedError = Util.parseApiError(error);

    // Special handling for 401 (authentication)
    if (parsedError.status === 401) {
      this.setState({
        error: "You have been logged out. Please log in again",
        errorContext: "auth"
      });
      this.doLogout();
      return;
    }

    // Use formatted API error if available, otherwise use fallback
    const displayMessage = parsedError.isApiError
      ? Util.formatErrorMessage(parsedError)
      : `${fallbackMessage}: ${parsedError.message}`;

    this.setState({ error: displayMessage, errorContext: context });
  };

  /******************
   * URL ROUTING *
   ******************/
  updateUrl = (recipeId, recipeTitle) => {
    const url = Util.buildRecipeUrl(recipeId, recipeTitle);
    window.history.pushState(null, '', url);
  };

  clearUrl = () => {
    window.history.pushState(null, '', '/');
  };

  validateAndCorrectSlug = (recipeId, recipeTitle) => {
    const currentPath = window.location.pathname;
    const correctUrl = Util.buildRecipeUrl(recipeId, recipeTitle);

    if (currentPath !== correctUrl) {
      window.history.replaceState(null, '', correctUrl);
    }
  };

  handlePopState = () => {
    this.routeToRecipeFromUrl();
  };

  routeToRecipeFromUrl = () => {
    const recipeId = Util.parseUrl(window.location.pathname);

    if (recipeId) {
      // Validate recipe exists
      const recipe = Util.selectRecipe(recipeId, this.state.allRecipes);
      if (recipe) {
        // Auto-dismiss routing errors on successful navigation
        const updates = { targetRecipe: recipeId };
        if (this.state.errorContext === "routing") {
          updates.error = null;
          updates.errorContext = null;
        }
        this.setState(updates);
        this.validateAndCorrectSlug(recipeId, recipe.Title);
        if (this.state.login.valid) {
          this.loadNotes({ target: { id: recipeId } });
        }
      } else {
        // Recipe doesn't exist, show error and clear URL
        this.setState({
          error: "Recipe not found",
          errorContext: "routing",
          targetRecipe: undefined
        });
        this.clearUrl();
      }
    } else {
      // No recipe in URL, clear targetRecipe
      this.setState({ targetRecipe: undefined });
    }
  };

  /*********************
   * LIFECYCLE METHODS *
   *********************/
  componentDidMount() {
    this.getRecipes();
    this.getLabels();

    // Add popstate listener for browser back/forward buttons
    window.addEventListener('popstate', this.handlePopState);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.reloadRecipeList) {
      this.getRecipes();
      this.setState({ reloadRecipeList: false });
    }

    // Route to recipe from URL after recipes load
    if (prevState.allRecipes.length === 0 && this.state.allRecipes.length > 0) {
      this.routeToRecipeFromUrl();
    }

    // Update URL slug after recipe edit (recipes have been reloaded)
    if (this.state.recipeJustEdited && prevState.allRecipes !== this.state.allRecipes && this.state.targetRecipe) {
      const recipe = Util.selectRecipe(this.state.targetRecipe, this.state.allRecipes);
      if (recipe) {
        this.validateAndCorrectSlug(this.state.targetRecipe, recipe.Title);
      }
      this.setState({ recipeJustEdited: false });
    }

    // Load notes if user logs in while viewing a recipe
    if (!prevState.login.valid && this.state.login.valid && this.state.targetRecipe) {
      this.loadNotes({ target: { id: this.state.targetRecipe } });
    }

    // Clear tag form input when recipe changes
    if (prevState.targetRecipe !== this.state.targetRecipe) {
      this.setState({ tagFormInputValue: '', showTaggingForm: false });
    }
  }

  componentWillUnmount() {
    // Remove popstate listener to prevent memory leaks
    window.removeEventListener('popstate', this.handlePopState);
  }
}

export default App;
