function applyFilters(recipes, filters) {
  var results = recipes;
  if (filters.fragments !== "") {
    //TODO: make it like slackmoji search, where it can skip characters?
    results = results.filter(
      (recipe) =>
        recipe.Title.toLowerCase().includes(filters.fragments.toLowerCase()) ||
        (filters.fullText &&
          recipe.Body.toLowerCase().includes(filters.fragments.toLowerCase()))
    );
  }
  if (filters.tagsAll && filters.tagsAll.length) {
    const filterIds = filters.tagsAll.flatMap((x) => x.ID);
    results = results.filter((recipe) => {
      if (!recipe.Labels || !recipe.Labels.length) {
        return false;
      }
      const labelIds = recipe.Labels.flatMap((x) => x.ID);
      return includesAll(labelIds, filterIds);
    });
  }
  if (filters.tagsAny && filters.tagsAny.length) {
    const filterIds = filters.tagsAny.flatMap((x) => x.ID);
    results = results.filter((recipe) => {
      if (!recipe.Labels || !recipe.Labels.length) {
        return false;
      }
      const labelIds = recipe.Labels.flatMap((x) => x.ID);
      return includesAny(labelIds, filterIds);
    });
  }
  if (filters.tagsNone && filters.tagsNone.length) {
    const filterIds = filters.tagsNone.flatMap((x) => x.ID);
    results = results.filter((recipe) => {
      if (!recipe.Labels || !recipe.Labels.length) {
        return true;
      }
      const labelIds = recipe.Labels.flatMap((x) => x.ID);
      return includesNone(labelIds, filterIds);
    });
  }
  return results;
}

function includesAny(recipeLabelIds, filterLabelIds) {
  const x = recipeLabelIds.flatMap((i) => filterLabelIds.includes(i));
  return x.reduce((a, b) => a || b);
}

function includesNone(recipeLabelIds, filterLabelIds) {
  const x = recipeLabelIds.flatMap((i) => !filterLabelIds.includes(i));
  return x.reduce((a, b) => a && b);
}

function includesAll(recipeLabelIds, filterLabelIds) {
  const x = filterLabelIds.flatMap((i) => recipeLabelIds.includes(i));
  return x.reduce((a, b) => a && b);
}

function selectRecipe(targetId, recipeList) {
  return recipeList.find((recipe) => {
    return recipe.ID === parseInt(targetId);
  });
}

export { selectRecipe, applyFilters };
