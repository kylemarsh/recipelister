function applyFilters(recipes, filters) {
  var results = recipes;
  if (filters.fragments !== "") {
    //FIXME: make it like slackmoji search, where it can skip characters
    results = results.filter(
      (recipe) =>
        recipe.Title.toLowerCase().includes(filters.fragments.toLowerCase()) ||
        (filters.fullText &&
          recipe.Body.toLowerCase().includes(filters.fragments.toLowerCase()))
    );
  }
  //TODO other filters
  return results;
}

function selectRecipe(targetId, recipeList) {
  return recipeList.find((recipe) => {
    return recipe.ID === parseInt(targetId);
  });
}

export { selectRecipe, applyFilters };
