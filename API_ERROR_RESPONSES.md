# API Error Response Reference

This document lists all error responses that the gorecipes API can return, organized by route.

## Error Response Format

All errors follow the same format:
- HTTP status code in the response header
- Plain text error message in the response body

## Middleware Errors

### Authentication Middleware (applies to all /priv/* and /admin/* routes)

#### Missing Authentication Token
- **Routes:** All `/priv/*` and `/admin/*` routes
- **Status Code:** 401 Unauthorized
- **Message:** `missing auth token`
- **Meaning:** The request did not include an `x-access-token` header

#### Expired Token
- **Routes:** All `/priv/*` and `/admin/*` routes
- **Status Code:** 401 Unauthorized
- **Message:** `auth token expired; please log in again`
- **Meaning:** The JWT token has expired and the user needs to log in again

#### Invalid Token
- **Routes:** All `/priv/*` and `/admin/*` routes
- **Status Code:** 400 Bad Request
- **Message:** `invalid auth token`
- **Meaning:** The JWT token is malformed or has an invalid signature

### Admin Middleware (applies to all /admin/* routes)

#### Insufficient Privileges
- **Routes:** All `/admin/*` routes
- **Status Code:** 403 Forbidden
- **Message:** `admin access required`
- **Meaning:** User is authenticated but does not have administrator privileges

### Debug Middleware (applies to all /debug/* routes)

#### Debug Mode Disabled
- **Routes:** All `/debug/*` routes
- **Status Code:** 403 Forbidden
- **Message:** `token validation only available for debugging`
- **Meaning:** Debug routes are only accessible when the server is running in debug mode

---

## Public Routes

### POST /login/

#### Invalid Credentials
- **Status Code:** 403 Forbidden
- **Message:** `login invalid`
- **Meaning:** Username not found or password incorrect

#### Token Generation Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `could not sign token`
- **Meaning:** Server failed to generate JWT token after successful authentication

### GET /recipes/

#### Database Error
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem loading recipes`
- **Meaning:** Database query failed when loading active recipes

### GET /labels/

#### Database Error
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem loading labels`
- **Meaning:** Database query failed when loading all labels

### GET /recipe/{id}/labels/

#### Database Error
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem retrieving labels for recipe`
- **Meaning:** Database query failed when loading labels for the specified recipe

---

## Authenticated Routes (/priv/*)

### GET /priv/recipes/

#### Database Error
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem loading recipes`
- **Meaning:** Database query failed when loading recipes with full details

### GET /priv/recipe/{id}/

#### Invalid Recipe ID Format
- **Status Code:** 400 Bad Request
- **Message:** `recipe ID must be an integer`
- **Meaning:** The recipe ID in the URL is not a valid integer

#### Recipe Not Found
- **Status Code:** 404 Not Found
- **Message:** `No recipe with id={id} exists`
- **Meaning:** No recipe exists with the specified ID

#### Database Error
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem loading recipe`
- **Meaning:** Database query failed when loading the recipe

### GET /priv/recipe/{id}/notes/

#### Invalid Recipe ID Format
- **Status Code:** 400 Bad Request
- **Message:** `recipe ID must be an integer`
- **Meaning:** The recipe ID in the URL is not a valid integer

#### No Notes Found
- **Status Code:** 404 Not Found
- **Message:** `No notes for recipe with id={id} exists`
- **Meaning:** The recipe exists but has no notes (or recipe doesn't exist)

#### Database Error
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem loading notes`
- **Meaning:** Database query failed when loading notes for the recipe

---

## Admin Routes (/admin/*)

### POST /admin/recipe/

#### Missing Title
- **Status Code:** 400 Bad Request
- **Message:** `title is required`
- **Meaning:** The request did not include a title parameter

#### Invalid Active Time
- **Status Code:** 400 Bad Request
- **Message:** `activeTime must be an integer`
- **Meaning:** The activeTime parameter is not a valid integer

#### Invalid Total Time
- **Status Code:** 400 Bad Request
- **Message:** `totalTime must be an integer`
- **Meaning:** The totalTime parameter is not a valid integer

#### Creation Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `could not create recipe`
- **Meaning:** Database insertion failed

### PUT /admin/recipe/{id}

#### Invalid Recipe ID Format
- **Status Code:** 400 Bad Request
- **Message:** `recipe ID must be an integer`
- **Meaning:** The recipe ID in the URL is not a valid integer

#### Recipe Not Found
- **Status Code:** 404 Not Found
- **Message:** `recipe does not exist`
- **Meaning:** No recipe exists with the specified ID

#### Missing Title
- **Status Code:** 400 Bad Request
- **Message:** `title is required`
- **Meaning:** The request did not include a title parameter

#### Invalid Active Time
- **Status Code:** 400 Bad Request
- **Message:** `activeTime must be an integer`
- **Meaning:** The activeTime parameter is not a valid integer

#### Invalid Total Time
- **Status Code:** 400 Bad Request
- **Message:** `totalTime must be an integer`
- **Meaning:** The totalTime parameter is not a valid integer

#### Database Error (Lookup)
- **Status Code:** 500 Internal Server Error
- **Message:** `problem loading recipe`
- **Meaning:** Database query failed when verifying recipe exists

#### Update Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `could not update recipe`
- **Meaning:** Database update operation failed

### DELETE /admin/recipe/{id}/

#### Invalid Recipe ID Format
- **Status Code:** 400 Bad Request
- **Message:** `recipe ID must be an integer`
- **Meaning:** The recipe ID in the URL is not a valid integer

#### Database Error (Lookup)
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem loading recipe`
- **Meaning:** Database query failed when checking if recipe exists

#### Soft Delete Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `could not soft-delete recipe`
- **Meaning:** Database update to set deleted flag failed

### DELETE /admin/recipe/{id}/hard

#### Invalid Recipe ID Format
- **Status Code:** 400 Bad Request
- **Message:** `recipe ID must be an integer`
- **Meaning:** The recipe ID in the URL is not a valid integer

#### Database Error (Lookup)
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem loading recipe`
- **Meaning:** Database query failed when checking if recipe exists

#### Recipe Deletion Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem deleting recipe`
- **Meaning:** Database deletion of recipe record failed

#### Label Link Deletion Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem deleting recipe-label links`
- **Meaning:** Database deletion of recipe-label junction records failed

#### Note Deletion Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem deleting notes`
- **Meaning:** Database deletion of associated notes failed

### PUT /admin/recipe/{id}/restore

#### Invalid Recipe ID Format
- **Status Code:** 400 Bad Request
- **Message:** `recipe ID must be an integer`
- **Meaning:** The recipe ID in the URL is not a valid integer

#### Restore Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `could not un-delete recipe`
- **Meaning:** Database update to clear deleted flag failed

### PUT /admin/recipe/{id}/mark_cooked

#### Invalid Recipe ID Format
- **Status Code:** 400 Bad Request
- **Message:** `recipe ID must be an integer`
- **Meaning:** The recipe ID in the URL is not a valid integer

#### Recipe Not Found
- **Status Code:** 404 Not Found
- **Message:** `recipe does not exist`
- **Meaning:** No recipe exists with the specified ID

#### Database Error (Lookup)
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem loading recipe`
- **Meaning:** Database query failed when verifying recipe exists

#### Update Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `problem setting recipe new flag`
- **Meaning:** Database update to clear new flag failed

### PUT /admin/recipe/{id}/mark_new

#### Invalid Recipe ID Format
- **Status Code:** 400 Bad Request
- **Message:** `recipe ID must be an integer`
- **Meaning:** The recipe ID in the URL is not a valid integer

#### Recipe Not Found
- **Status Code:** 404 Not Found
- **Message:** `recipe does not exist`
- **Meaning:** No recipe exists with the specified ID

#### Database Error (Lookup)
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem loading recipe`
- **Meaning:** Database query failed when verifying recipe exists

#### Update Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `problem setting recipe new flag`
- **Meaning:** Database update to set new flag failed

### PUT /admin/recipe/{recipe_id}/label/{label_id}

#### Invalid Recipe ID Format
- **Status Code:** 400 Bad Request
- **Message:** `recipe ID must be an integer`
- **Meaning:** The recipe_id in the URL is not a valid integer

#### Invalid Label ID Format
- **Status Code:** 400 Bad Request
- **Message:** `label ID must be an integer`
- **Meaning:** The label_id in the URL is not a valid integer

#### Recipe Not Found
- **Status Code:** 404 Not Found
- **Message:** `No recipe with id={id} exists`
- **Meaning:** No recipe exists with the specified recipe_id

#### Label Not Found
- **Status Code:** 404 Not Found
- **Message:** `No label with id={id} exists`
- **Meaning:** No label exists with the specified label_id

#### Database Error (Recipe Lookup)
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem loading recipe`
- **Meaning:** Database query failed when verifying recipe exists

#### Database Error (Label Lookup)
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem loading label`
- **Meaning:** Database query failed when verifying label exists

#### Database Error (Link Check)
- **Status Code:** 500 Internal Server Error
- **Message:** `problem checking recipe-label link`
- **Meaning:** Database query failed when checking if link already exists

#### Link Creation Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `problem linking recipe to label`
- **Meaning:** Database insertion of recipe-label junction record failed

### DELETE /admin/recipe/{recipe_id}/label/{label_id}

#### Invalid Recipe ID Format
- **Status Code:** 400 Bad Request
- **Message:** `recipe ID must be an integer`
- **Meaning:** The recipe_id in the URL is not a valid integer

#### Invalid Label ID Format
- **Status Code:** 400 Bad Request
- **Message:** `label ID must be an integer`
- **Meaning:** The label_id in the URL is not a valid integer

#### Link Deletion Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `problem deleting recipe-label link`
- **Meaning:** Database deletion of recipe-label junction record failed

### PUT /admin/label/{label_name}

#### Database Error (Check)
- **Status Code:** 500 Internal Server Error
- **Message:** `problem checking label`
- **Meaning:** Database query failed when checking if label already exists

#### Creation Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `problem creating label`
- **Meaning:** Database insertion of new label failed

### PUT /admin/label/id/{label_id}

#### Invalid Label ID Format
- **Status Code:** 400 Bad Request
- **Message:** `label ID must be an integer`
- **Meaning:** The label_id in the URL is not a valid integer

#### Invalid Form Data
- **Status Code:** 400 Bad Request
- **Message:** `invalid form data`
- **Meaning:** The request form data could not be parsed

#### Label Not Found
- **Status Code:** 404 Not Found
- **Message:** `label does not exist`
- **Meaning:** No label exists with the specified label_id

#### Icon Validation Failed
- **Status Code:** 400 Bad Request
- **Message:** `icon must be exactly 1 character, got {n}: icon validation failed`
- **Meaning:** The icon parameter contains more than one grapheme cluster (emoji/character)

#### Type Validation Failed
- **Status Code:** 400 Bad Request
- **Message:** `type must be 20 characters or less, got {n}: type validation failed`
- **Meaning:** The type parameter exceeds 20 characters

#### Label Name Conflict
- **Status Code:** 409 Conflict
- **Message:** `label name already exists: {name}: label name conflict`
- **Meaning:** Another label with the same name already exists

#### Database Error (Lookup)
- **Status Code:** 500 Internal Server Error
- **Message:** `problem loading label`
- **Meaning:** Database query failed when fetching existing label

#### Update Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `problem updating label`
- **Meaning:** Database update operation failed

### POST /admin/recipe/{id}/note/

#### Invalid Recipe ID Format
- **Status Code:** 400 Bad Request
- **Message:** `recipe ID must be an integer`
- **Meaning:** The recipe ID in the URL is not a valid integer

#### Recipe Not Found
- **Status Code:** 404 Not Found
- **Message:** `recipe does not exist`
- **Meaning:** No recipe exists with the specified ID

#### Database Error (Recipe Lookup)
- **Status Code:** 500 Internal Server Error
- **Message:** `Problem loading recipe`
- **Meaning:** Database query failed when verifying recipe exists

#### Creation Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `problem creating note`
- **Meaning:** Database insertion of note failed

### DELETE /admin/note/{id}

#### Invalid Note ID Format
- **Status Code:** 400 Bad Request
- **Message:** `note ID must be an integer`
- **Meaning:** The note ID in the URL is not a valid integer

#### Deletion Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `problem deleting note`
- **Meaning:** Database deletion of note failed

### PUT /admin/note/{id}

#### Invalid Note ID Format
- **Status Code:** 400 Bad Request
- **Message:** `note ID must be an integer`
- **Meaning:** The note ID in the URL is not a valid integer

#### Note Not Found
- **Status Code:** 404 Not Found
- **Message:** `note does not exist`
- **Meaning:** No note exists with the specified ID

#### Update Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `problem updating note`
- **Meaning:** Database update of note text failed

### PUT /admin/note/{id}/flag

#### Invalid Note ID Format
- **Status Code:** 400 Bad Request
- **Message:** `note ID must be an integer`
- **Meaning:** The note ID in the URL is not a valid integer

#### Note Not Found
- **Status Code:** 404 Not Found
- **Message:** `note does not exist`
- **Meaning:** No note exists with the specified ID

#### Flag Update Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `problem flagging note`
- **Meaning:** Database update to set flagged flag failed

### PUT /admin/note/{id}/unflag

#### Invalid Note ID Format
- **Status Code:** 400 Bad Request
- **Message:** `note ID must be an integer`
- **Meaning:** The note ID in the URL is not a valid integer

#### Note Not Found
- **Status Code:** 404 Not Found
- **Message:** `note does not exist`
- **Meaning:** No note exists with the specified ID

#### Flag Update Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `problem flagging note`
- **Meaning:** Database update to clear flagged flag failed

---

## Debug Routes (/debug/*)

### GET /debug/checkToken/

#### Invalid Token
- **Status Code:** 400 Bad Request
- **Message:** `invalid auth token`
- **Meaning:** The JWT token in x-access-token header is invalid

### POST /debug/hashPassword/

#### Hashing Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `problem hashing password`
- **Meaning:** The bcrypt password hashing operation failed

### GET /debug/getToken/

#### Token Generation Failed
- **Status Code:** 500 Internal Server Error
- **Message:** `could not sign token`
- **Meaning:** JWT token generation failed
