async function login(form, config) {
  var formData = new FormData(form);
  var requestInit = {
    method: "POST",
    body: formData,
  };
  const host = config.host ? config.host : "http://localhost:8080/";
  const endpoint = "login/";
  const response = await doFetch(host + endpoint, requestInit);
  return response.token;
}

async function fetchRecipes(config) {
  const host = config.host ? config.host : "http://localhost:8080/";
  const endpoint = config.auth.valid ? "priv/recipes/" : "recipes/";
  const requestInit = config.auth.valid
    ? { headers: { "x-access-token": config.auth.token } }
    : {};
  return await doFetch(host + endpoint, requestInit);
}
async function fetchLabels(config) {
  const host = config.host ? config.host : "http://localhost:8080/";
  const endpoint = "labels/";
  return await doFetch(host + endpoint);
}

async function fetchNotes(recipeId, config) {
  const host = config.host ? config.host : "http://localhost:8080/";
  const resource = `${host}priv/recipe/${recipeId}/notes/`;
  const requestInit = { headers: { "x-access-token": config.auth.token } };
  return await doFetch(resource, requestInit);
}

async function toggleNote(noteId, flag, config) {
  const flagstring = flag ? "flag" : "unflag";
  const host = config.host ? config.host : "http://localhost:8080/";
  const resource = `${host}priv/note/${noteId}/${flagstring}`;
  const requestInit = {
    method: "PUT",
    headers: { "x-access-token": config.auth.token },
  };
  await doAction(resource, requestInit);
}

async function deleteNote(noteId, config) {
  const host = config.host ? config.host : "http://localhost:8080/";
  const resource = `${host}priv/note/${noteId}`;
  const requestInit = {
    method: "DELETE",
    headers: { "x-access-token": config.auth.token },
  };
  await doAction(resource, requestInit);
}

async function unlinkLabel(recipeId, labelId, config) {
  const host = config.host ? config.host : "http://localhost:8080/";
  const resource = `${host}priv/recipe/${recipeId}/label/${labelId}`;
  const requestInit = {
    method: "DELETE",
    headers: { "x-access-token": config.auth.token },
  };
  await doAction(resource, requestInit);
}

// Helpers
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
  fetchLabels,
  unlinkLabel,
  fetchNotes,
  toggleNote,
  deleteNote,
};
