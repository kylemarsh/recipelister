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

function sortRecipes(recipes, sortBy, shuffleKeys = {}) {
  if (sortBy === "alphabetic") {
    return [...recipes].sort((a, b) =>
      a.Title.toLowerCase().localeCompare(b.Title.toLowerCase())
    );
  } else if (sortBy === "newest") {
    return [...recipes].sort((a, b) => b.ID - a.ID);
  } else if (sortBy === "shuffle") {
    // Use stable shuffle keys for consistent random order
    return [...recipes].sort((a, b) => {
      const keyA = shuffleKeys[a.ID] || 0;
      const keyB = shuffleKeys[b.ID] || 0;
      return keyA - keyB;
    });
  }
  return recipes;
}

function selectRecipe(targetId, recipeList) {
  return recipeList.find((recipe) => {
    return recipe.ID === parseInt(targetId);
  });
}

function getGroupingLabels(allLabels, groupBy) {
  if (!groupBy) return [];

  return allLabels
    .filter(label => label.Type === groupBy)
    .map(label => label.Label);
}

function filterRecipesByLabel(recipes, labelName) {
  return recipes.filter((recipe) => {
    if (!recipe.Labels || !recipe.Labels.length) {
      return false;
    }
    return recipe.Labels.some((label) => label.Label.toLowerCase() === labelName.toLowerCase());
  });
}

function transformNewField(formData) {
  // Invert checkbox logic for backend expectations
  // Checkbox checked (toggle ON, "tried") → omit field
  // Checkbox unchecked (toggle OFF, "new") → send new=1
  if (formData.has('new')) {
    // Checkbox is checked (user tried it), omit the field
    formData.delete('new');
  } else {
    // Checkbox is unchecked (recipe is new), send new=1
    formData.set('new', '1');
  }
}

function getAvailableTypes(allLabels) {
  // Extract unique Type values from labels, filtering out undefined/null
  const types = allLabels
    .map(label => label.Type)
    .filter(type => type !== undefined && type !== null);

  // Return unique types, with "Course" first if it exists
  const uniqueTypes = [...new Set(types)];
  const courseIndex = uniqueTypes.indexOf('Course');

  if (courseIndex > 0) {
    // Move "Course" to the front
    uniqueTypes.splice(courseIndex, 1);
    uniqueTypes.unshift('Course');
  }

  return uniqueTypes;
}

function titleCase(str) {
  // Capitalizes first letter after whitespace; replaces all whitespace with single spaces
  if (!str) return str;
  return str
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatLabelsForDisplay(labels) {
  // Title-case Label and Type fields for display
  return labels.map(label => ({
    ...label,
    Label: titleCase(label.Label),
    Type: label.Type ? titleCase(label.Type) : label.Type
  }));
}

function sortLabelsForMultiselect(labels) {
  // Separate labels with and without Type
  const withType = labels.filter(label => label.Type);
  const withoutType = labels.filter(label => !label.Type);

  // Group labels with Type, preserving original order
  const typeOrder = [];
  const grouped = {};

  withType.forEach(label => {
    const type = label.Type;
    if (!grouped[type]) {
      grouped[type] = [];
      typeOrder.push(type);
    }
    grouped[type].push(label);
  });

  // Sort labels alphabetically within each Type, then flatten
  const sortedWithType = typeOrder.flatMap(type =>
    grouped[type].sort((a, b) => a.Label.localeCompare(b.Label))
  );

  // Add labels without Type at the end, sorted alphabetically, with Type set to "Other"
  const sortedWithoutType = withoutType
    .sort((a, b) => a.Label.localeCompare(b.Label))
    .map(label => ({ ...label, Type: 'Other' }));

  return [...sortedWithType, ...sortedWithoutType];
}

function generateSlug(title) {
  if (!title) return '';

  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars except word chars, spaces, and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
}

function parseUrl(pathname) {
  // Extract recipe ID from pathname like "/123/slug" or "/123"
  if (!pathname || pathname === '/') return null;

  const parts = pathname.split('/').filter(p => p); // Remove empty parts
  if (parts.length === 0) return null;

  const id = parseInt(parts[0], 10);
  return isNaN(id) ? null : id;
}

function buildRecipeUrl(recipeId, recipeTitle) {
  const slug = generateSlug(recipeTitle);
  return slug ? `/${recipeId}/${slug}` : `/${recipeId}`;
}

export { selectRecipe, applyFilters, sortRecipes, getGroupingLabels, filterRecipesByLabel, transformNewField, getAvailableTypes, formatLabelsForDisplay, sortLabelsForMultiselect, generateSlug, parseUrl, buildRecipeUrl };
