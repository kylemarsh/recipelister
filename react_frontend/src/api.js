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
  const requestInit = { headers: { "x-access-token": config.auth.token } };
  doPut(resource, requestInit);
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

async function doPut(resource, requestInit) {
  requestInit.method = "PUT";
  const response = await fetch(resource, requestInit);
  if (!response.ok) {
    throw Error(response.status);
  }
}
export { login, fetchRecipes, fetchNotes, toggleNote };
