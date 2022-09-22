const API_HOST = process.env.REACT_APP_API_HOST;

async function login(form) {
  var formData = new FormData(form);
  var requestInit = {
    method: "POST",
    body: formData,
  };
  const endpoint = "login/";
  const response = await doFetch(API_HOST + endpoint, requestInit);
  return response.token;
}

/***********
 * RECIPES *
 ***********/
async function fetchRecipes(auth) {
  const endpoint = auth.valid ? "priv/recipes/" : "recipes/";
  const requestInit = auth.valid
    ? { headers: { "x-access-token": auth.token } }
    : {};
  return await doFetch(API_HOST + endpoint, requestInit);
}

async function createRecipe(formData, auth) {
  const resource = `${API_HOST}priv/recipe/`;
  const requestInit = {
    method: "POST",
    headers: { "x-access-token": auth.token },
    body: formData,
  };
  return await doFetch(resource, requestInit);
}

async function updateRecipe(recipeId, formData, auth) {
  const resource = `${API_HOST}priv/recipe/${recipeId}`;
  const requestInit = {
    method: "PUT",
    headers: { "x-access-token": auth.token },
    body: formData,
  };
  return await doAction(resource, requestInit);
}

async function deleteRecipe(recipeId, auth) {
  const resource = `${API_HOST}priv/recipe/${recipeId}`;
  const requestInit = {
    method: "DELETE",
    headers: { "x-access-token": auth.token },
  };
  return await doAction(resource, requestInit);
}

/**********
 * LABELS *
 **********/
async function fetchLabels() {
  return await doFetch(API_HOST + "labels/");
}

async function createLabel(labelName, auth) {
  const resource = `${API_HOST}priv/label/${labelName}`;
  const requestInit = {
    method: "PUT",
    headers: { "x-access-token": auth.token },
  };
  return await doFetch(resource, requestInit);
}

async function linkLabel(recipeId, labelId, auth) {
  const resource = `${API_HOST}priv/recipe/${recipeId}/label/${labelId}`;
  const requestInit = {
    method: "PUT",
    headers: { "x-access-token": auth.token },
  };
  await doAction(resource, requestInit);
}

async function unlinkLabel(recipeId, labelId, auth) {
  const resource = `${API_HOST}priv/recipe/${recipeId}/label/${labelId}`;
  const requestInit = {
    method: "DELETE",
    headers: { "x-access-token": auth.token },
  };
  await doAction(resource, requestInit);
}

/*********
 * NOTES *
 *********/
async function fetchNotes(recipeId, auth) {
  const resource = `${API_HOST}priv/recipe/${recipeId}/notes/`;
  const requestInit = { headers: { "x-access-token": auth.token } };
  return await doFetch(resource, requestInit);
}

async function createNote(recipeId, formData, auth) {
  const resource = `${API_HOST}priv/recipe/${recipeId}/note/`;
  const requestInit = {
    method: "POST",
    headers: { "x-access-token": auth.token },
    body: formData,
  };
  return await doFetch(resource, requestInit);
}

async function toggleNote(noteId, flag, auth) {
  const flagstring = flag ? "flag" : "unflag";
  const resource = `${API_HOST}priv/note/${noteId}/${flagstring}`;
  const requestInit = {
    method: "PUT",
    headers: { "x-access-token": auth.token },
  };
  await doAction(resource, requestInit);
}

async function editNote(noteId, formData, auth) {
  const resource = `${API_HOST}priv/note/${noteId}`;
  const requestInit = {
    method: "PUT",
    headers: { "x-access-token": auth.token },
    body: formData,
  };
  await doAction(resource, requestInit);
}

async function deleteNote(noteId, auth) {
  const resource = `${API_HOST}priv/note/${noteId}`;
  const requestInit = {
    method: "DELETE",
    headers: { "x-access-token": auth.token },
  };
  await doAction(resource, requestInit);
}

/***********
 * Helpers *
 ***********/
async function doFetch(resource, requestInit) {
  const response = await fetch(resource, requestInit);
  if (!response.ok) {
    const error = await response.text();
    throw Error(error);
  }
  return await response.json();
}

async function doAction(resource, requestInit) {
  const response = await fetch(resource, requestInit);
  if (!response.ok) {
    throw Error(response.status);
  }
}

export {
  login,
  fetchRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  fetchLabels,
  createLabel,
  linkLabel,
  unlinkLabel,
  fetchNotes,
  createNote,
  toggleNote,
  editNote,
  deleteNote,
};
