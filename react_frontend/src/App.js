import React, { Component } from 'react';
import { connect } from 'react-redux';

import turkey_dinner from './icons/turkey_dinner.svg';
import './App.css';
import ListPane from './components/recipelist.js';


/* FUTURE WORK *
 *************** 
 * Add history movement (array of past states)
 */

//class App extends Component {
  //[>constructor(props) {
    //super(props);
    //this.state = {
      //recipes: $sample_recipes, //TODO replace with API call
      //search_results: [$sample_recipes[1], $sample_recipes[3]],
      //selected_item: 1,
      //query: {title_fragments: ''}, // NB: needs to include initial values for all fields
    //};
  //}*/

  //handleSubmit(e) {
    ////FIXME
    //console.log('preventing form submission');
    ////title_fragments = e.target.
    //e.preventDefault();
  //}

  //handleQueryChange(e) {
    //var q = this.state.query;  //FIXME: how do I prevent mutation?
    //q[e.target.name] = e.target.value;
    //console.log('updating query[' + e.target.name + '] to "' + e.target.value + '"');
    //this.setState({query: q});
  //}

  //handleUpdateSelection(i) {
    //this.setState({selected_item: i});
  //}

  //render() {
    //const recipes = this.state.recipes;
    //const results = this.state.search_results.slice();
    //const selection = this.state.selected_item;
    //const query = this.state.query;

    //return (
      //<div className="App">
        //<QueryPane
          //currentQuery={query}
          //onSubmit={e => this.handleSubmit(e)}
          //onChange={e => this.handleQueryChange(e)}
        ///>
        //<recipeList
          //items={results}
          //selected={selection}
          //onClick={i => this.handleUpdateSelection(i)}
        ///>
        //<DisplayPane recipe={recipes[selection]} />
      //</div>
    //);
  //}
//}

class App extends Component {
  render() {
    return (
      <div className="App">
        <QueryPane />
        <ListPane />
        <DisplayPane />
      </div>
    );
  }
}

// TODO: Move these to appropriate locations?
function Logo(props) {
  return null;
  return (
    <img src={turkey_dinner} className="recipe-logo" alt="Recipelister Dinner Logo" />
  );
}

/*function ListPane(props) {
  const items = props.items ? props.items : [];
  if (!items.length) { return ''; }

  const results = items.map((recipe) => {
    var selectedClass = '';
    if (recipe.id === props.selected) {
      selectedClass = ' active';
    }
    return (
      <li className={selectedClass} key={recipe.id} onClick={() => props.onClick(recipe.id)}>
        <span className='li-title'>{recipe.title}</span>
      </li>
    );
  });
  return (
    <div className='list-pane column'>
      <header className='list-title'>Search Results</header>
      <ol>{results}</ol>
    </div>
  );
}*/

const DisplayPane = connect(
  (state) => {return {recipe: state.recipes[state.selected_item]}},
)((props) => {
  const recipe = props.recipe;
  return (
    <div className='display-pane column'>
      <header className='display-title'>{recipe.title}</header>
      <p className='recipebody'>{recipe.instructions}</p>
    </div>
  );
});

const QueryPane = connect(
  (state) => {return {query: state.query}},
  (dispatch) => {return null},
)((props) => {
  return "";
  return (
    <div className='query-pane column'>
      <header><Logo /></header>
      <form onSubmit={props.onSubmit}>
        <label domfor='title_fragments'>Title Contains:</label>
        <br />
        <input
          id='title_fragments'
          name='title_fragments'
          type='search'
          value={props.currentQuery.title_fragments}
          onChange={props.onChange}
        />
      </form>
    </div>
  );
});

export default App;
