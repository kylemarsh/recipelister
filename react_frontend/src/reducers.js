import {combineReducers} from 'redux';

var $sample_recipes = {
  1: {
    id: 1,
    title: 'Beef Stew',
    instructions: '1 beef\nspices\n\nStew the beef. Add the spices.',
  },
  2: {
    id: 2,
    title: 'Sandwich',
    instructions: '2 bread\ncheese\na meat\n\nPut the cheese and meat between the bread. Slice. Serve',
  },
  3: {
    id: 3,
    title: 'Lasagna',
    instructions: 'Pasta\nSauce\n\nLayer the stuff. Cook it.',
  },
};

//const selected_item = (state = null, action) => {
const selected_item = (state = 1, action) => {
  switch(action.type) {
    case "SELECT_LIST_ITEM":
      return action.value;
    default:
      return state;
  }
};

const query = (state = '', action) => {
  //TODO
  return state;
};


const recipes = (state = $sample_recipes, action) => {
  // FIXME: figure out where this code goes (read about thunk?)
  switch(action.type) {
    case "FETCH_REICPES":
      return $sample_recipes;
    default:
      return state;
  }
};

export default combineReducers( {
  selected_item,
  query,
  recipes,
});

