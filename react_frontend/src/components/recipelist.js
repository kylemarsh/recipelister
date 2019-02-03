import React, {Component} from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  selectItem
} from "../actions";

class ListPane extends Component {
  render() {
    const items = this.props.items ? this.props.items : [];
    if (!items.length) { return ''; }

    const results = items.map((recipe) => {
      var selectedClass = '';
      if (recipe.id === this.props.selected_item) {
        selectedClass = ' active';
      }
      return (
        <li className={selectedClass} key={recipe.id} onClick={() => this.props.selectItem(recipe.id)}>
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
  }
}

// This is called a "selector", I think.
const filteredRecipeList = (recipes, query) => {
  //TODO actual implementation
  return [recipes[1], recipes[3]];
};

const mapStateToProps = state => {
  return {
    items: filteredRecipeList(state.recipes, state.query),
    selected_item: state.selected_item,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({selectItem}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ListPane);

