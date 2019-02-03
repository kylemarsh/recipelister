
export const selectItem = (id) => ({
  type: 'SELECT_LIST_ITEM',
  value: id,
})

export const submitQuery = (e) {
  //FIXME
  console.log('preventing form submission');
  e.preventDefault();
}

export const updateQueryForm = (e) {
  var q = this.state.query;  //FIXME: how do I prevent mutation?
  q[e.target.name] = e.target.value;
  console.log('updating query[' + e.target.name + '] to "' + e.target.value + '"');
  this.setState({query: q});
}
