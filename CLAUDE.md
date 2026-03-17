# OVERVIEW
Recipelister's react_frontend is a single-page web application to provide
access to a database of recipes. It's written in react and the production
deployment is hosted at `https://eats.dashery.xyz`. Communication with the
database is with an API layer using JSON over REST.

The application supports direct links to individual recipes via URL routing
(e.g., `/123/chicken-soup`). URLs update dynamically as users navigate without
page reloads, and the browser back/forward buttons work within the app.


# Structure
All of the react code are in the `src/` directory.

## UI
The application shows a header at the top of the page. When not logged in, there
is a login form with username and password fields and a "Log In" button. When
logged in, the login form is replaced with a "Log Out" button, and a "New Recipe"
button appears which opens a form to add a recipe to the database.

Below the buttons  is a horizontal rule, and below that the screen splits into
two panes; the right is the Recipe Pane and it is empty until a recipe is
selected. On the left is the List Pane containing a query form and the list
of recipes that match the query.

### List Pane
The top of the list pane is the Query Form, containing a search box that
performs a search against recipe titles and a checkbox to enable advanced
searching. When checked, additional form fields appear giving advanced search
options:
 - "Search full recipe text": checkbox; changes search behavior to search full
   text of recipes instead of just the titles
 - "All": multiselect drop-down that lets the user select labels. Labels in
   this box are combined with "AND" logic so recipes must match all labels
   selected in order to appear in search.
 - "Any": multiselect drop-down that lets the user select labels. Labels in
   this box are combined with "OR" logic so recipes must match at least one of
   the labels selected in order to appear in search.
 - "None": multiselect drop-down that lets the user select labels. Labels in
   this box are inverted and combined with "OR" logic so recipes cannot match
   any labels selected in order to appear in search. The search form operates
   as a filter on the recipe list in the List Pane (below) and applies as the
   user types/clicks; the user does not need to click a submit button.

Below the advanced search options are three sort buttons that control the order
of the recipe list:
 - 🔤 (Alphabetic): Sorts recipes A-Z by title (default)
 - 📅 (Newest): Sorts recipes by ID descending (most recently added first)
 - 🔀 (Shuffle): Randomizes the recipe list with a stable shuffle that persists
   across filter changes until another sort option is selected

The active sort option is visually indicated with a blue border and background.

To the right of the sort buttons (separated by a vertical divider on desktop, or
above the sort buttons on mobile) is a group button:
 - 📂 (Group): Clicking cycles through available label types for grouping.
   When active, displays the current grouping type (e.g., "📂 Course", "📂
   Protein"). Click progression starts at "Course" (default), cycles through
   all other available label types (determined dynamically from the data), and
   ends at no grouping before cycling back to "Course". Groups recipes by
   labels matching the selected Type field with collapsible group headers
   showing recipe counts. Grouping is enabled by default to "Course" with all
   groups collapsed except "Main". Recipes tagged with multiple labels of the
   grouping type appear in each relevant group. Recipes without any labels of
   the grouping type appear in an "Other" group. The selected sort mode applies
   within each group. Group expand/collapse state persists across filter
   changes.

   The grouping dynamically uses label Type values from the API, so new label
   types automatically become available in the cycle without code changes.

Below the query form is another horizontal rule and below that the list of all
recipes matching the current search (when nothing is searched, the list
contains all recipes in the database).

This UI should be reasonable to view on both desktop and mobile. When viewed on
desktop the query form and list pane should be visible alongside the selected
recipe. On Mobile the selected recipe should fill the page.

### Recipe Pane
On the right side of the page is the Recipe Pane, where the selected recipe is
displayed. Recipes are structured in 6 parts:

 1. Title -- this is a header at the top of the pane. If the recipe has not been
    cooked yet (recipe.New is true), the title is followed by "(New!)" to indicate
    this is an untried recipe
 2. Action Buttons -- buttons to close the recipe pane, edit the recipe, and
    delete the recipe
 3. Timing -- two lines indicating how long the recipe takes to cook. Active
    time is how long the cook needs to be working on it; total time is the
    amount of time the recipe needs from start to finish, including cooking or
    resting time when the cook can be focusing on other things.
 4. Recipe Body -- a free-form text section containing the ingredients and
    instructions for the recipe. Some are plain text, some are markdown. By
    convention a recipe starts with a list of ingredients, one per line. After
    the ingredients is usually a blank line, and then the recipe instructions,
    usually one step per line. Sometimes there are multiple parts (a dish and
    its sauce, for instance) and these are usually separated by blank lines and
    header lines.
 5. Tags -- Recipes can be tagged with labels for easier searching. All of the
    labels a recipe is tagged with appear here, along with a button that reads
    "+ add label" to tag the recipe with an additional label. When clicked, a
    text box appears where the user can enter a label name. When submitted, the
    recipe is tagged with that label. If the label doesn't exist yet, it is
    created first.
 6. Notes -- Similar to tags, recipes can have notes. Notes can be added with
    "+ Add Note" button and once added they appear in a list. Each note shows
    the date it was added, buttons to flag, edit, and delete the note, and the
    body of the note itself. Flagging a note causes it to be displayed with a
    different background color (the intention is that some notes may be things
    that should be incorporated into the main body of the recipe eventually,
    and they can be marked as flagged once that's done).

The new recipe form also appears in the Recipe Pane, and has fields for:
 - Title
 - Active Time
 - Total Time
 - Recipe Body

It does not have the ability to add notes or labels to the recipe before it's
created. At the bottom of the form are "Add" and "Cancel" buttons. The recipe
is added to the database once the user clicks "Add".

## API
The react application gets data and interacts with the database via the
database's API, implemented in `api.js`. This file provides functions that the
application can call to make requests to the database's API, grouped roughly
by model -- there are functions that operate on recipes, labels, and notes,
as well as some helpers.

The API server URL is configured via the `REACT_APP_API_HOST` environment
variable.

The API server returns data in response bodies in JSON format when there is data
to be returned.

### Data Loading Behavior
Recipe data loading differs based on authentication status:
 - **Unauthenticated users**: Can view recipe titles and labels only. Recipe
   bodies are not loaded or displayed.
 - **Authenticated users**: Can view full recipe data. Recipe bodies are loaded
   with the initial recipe list. Notes are loaded on-demand when a user clicks
   on a recipe (see `App.js:398-401`).

### Data Formatting
Label data is formatted for display after fetching from the API:
 - `Label` and `Type` fields are title-cased using `Util.formatLabelsForDisplay()`
 - Formatting is applied in `App.getLabels()` for the label list and
   `App.getRecipes()` for labels attached to recipes
 - When new labels are created via the UI, they are formatted before being added
   to state
 - This formatting is a presentation concern handled in the application layer,
   not the API layer. The API returns normalized (lowercase) data suitable for
   any client; the web app transforms it for display.

### Auth
Authentication is handled by the `doLogin` and `doLogout` functions in
`App.js`. The log in method calls `Api.login` which POSTs a request to
`$api_host/login/` including the username and password in the request body.
Upon successful login the response body contains a JWT in the `token` field.
The JWT contains an `is_admin` claim indicating whether the user has admin
privileges. The JWT and username are stored in local storage.

On page load and successful login, the JWT is decoded using `jwt-decode` to
extract the `is_admin` claim, which is stored in application state as
`login.isAdmin`. This flag controls UI visibility of admin-only controls (edit,
delete, add note, add label, etc.).

API routes are organized by privilege level:
- **Public routes** (no auth): `/recipes/`, `/labels/`
- **Authenticated routes** (`/priv/*`): Read-only access requiring valid JWT
  (e.g., full recipe bodies, notes)
- **Admin routes** (`/admin/*`): Mutation operations requiring admin privilege
  (all POST, PUT, DELETE operations)

When making authenticated requests, the api function includes the JWT as the
value for the `x-access-token` header.

### URL Routing
The application implements client-side URL routing using the browser History
API to enable direct links to recipes while maintaining SPA behavior (no page
reloads).

**URL Format:**
- Pattern: `/{recipe-id}/{slug}` where slug is optional
- Examples: `/123/chicken-soup`, `/123`
- Recipe ID is required; slug is auto-generated from recipe title for readability
- Invalid slugs are auto-corrected using `replaceState` (no history entry)

**Routing Behavior:**
- **Recipe selection**: Updates URL via `pushState` to `/{id}/{slug}`
- **Recipe close**: Clears URL via `pushState` to `/`
- **Recipe deletion**: Clears URL via `pushState` to `/`
- **Recipe edit**: Updates slug via `replaceState` (no history entry)
- **Browser back/forward**: `popstate` event listener routes appropriately
- **Initial page load**: Parses URL and routes to recipe (if valid ID)

**Deep Linking:**
- Unauthenticated users can navigate to recipe URLs
- Recipe displays with title and labels only (existing auth behavior)
- If user logs in while viewing a recipe, notes load automatically
- Invalid recipe IDs show "Recipe not found" error and clear URL

**Implementation:**
- URL parsing/building in `Util.js` (`parseUrl`, `buildRecipeUrl`, `generateSlug`)
- Routing methods in `App.js` (`updateUrl`, `clearUrl`, `validateAndCorrectSlug`,
  `routeToRecipeFromUrl`, `handlePopState`)
- `popstate` event listener added in `componentDidMount`, removed in `componentWillUnmount`
- URL updates integrated into `handleResultClick`, recipe close/delete handlers,
  and recipe edit flow


## Libraries
This project uses:
 - "react" (v19)
 - "react-dom" (v19)
 - "react-widgets" (for multiselect dropdowns)
 - "react-scripts" (Create React App build tooling)
 - "jwt-decode" (for decoding JWTs to extract admin flag)

## Components
The top-level application is in `App.js`, bootstrapped by `index.js` using React
18's `createRoot` API. This Component renders the overall UI and holds state
(query form state, selected recipe, logged in state, URL routing state, which
other Components are visible...).

All of the functions that handle actions (clicks, typing, etc) are defined here
and passed down into components as props.

**App.js State:**
- `targetRecipe`: ID of currently selected recipe (or undefined)
- `recipeJustEdited`: Flag indicating recipe was just edited (triggers URL slug
  update after recipes reload)
- Other state: filters, login, errors, UI visibility flags, etc.

**App.js URL Routing Methods:**
- `updateUrl(recipeId, recipeTitle)`: Updates URL using `pushState`
- `clearUrl()`: Clears URL to `/` using `pushState`
- `validateAndCorrectSlug(recipeId, recipeTitle)`: Auto-corrects slug using
  `replaceState`
- `handlePopState()`: Handles browser back/forward (delegates to
  `routeToRecipeFromUrl`)
- `routeToRecipeFromUrl()`: Routes to recipe from current URL pathname

**App.js Lifecycle Integration:**
- `componentDidMount`: Adds `popstate` listener for browser navigation
- `componentDidUpdate`: Routes from URL after recipes load; updates slug after
  recipe edit; loads notes after login (if viewing recipe)
- `componentWillUnmount`: Removes `popstate` listener

Each component has its own CSS file in the `src/` directory (e.g., `App.css`,
`Recipe.css`, `Tags.css`, etc.) that are imported by `index.js`.

### LoginComponent
Defined in `LoginComponent.js`. This component builds the log in/out button and
the form for logging in. The App renders it inside a div with class `topnav`

### QueryForm Component
Defined in `QueryForm.js`. This component renders the search form. The App
renders it inside a div with class `search-pane` and, when the user has
selected a recipe, adds the `recipe-selected` class. When the "Advanced"
checkbox is ticked, it renders the `AdvancedQuery` component as well. Below
the advanced search options, it renders three sort buttons (Alphabetic, Newest,
Shuffle) that control the recipe list sort order.

### AdvancedQuery Component
Defined in `AdvancedQuery.js`. This component holds the form for advanced
searching/filtering options, including the `Multiselect` Components from the
`react-widgets` library that we use for picking labels.

The label multiselects use `groupBy="Type"` to group labels by their Type field
and display organized dropdowns with group headers. Labels are sorted
alphabetically within each group using `Util.sortLabelsForMultiselect()`. Labels
without a Type value are displayed in an "Other" group at the end of the list.

### GroupedResultList Component
Defined in `GroupedResultList.js`. This component is the primary list display
controller that handles filtering and conditional rendering. The App renders
the List Pane as the GroupedResultList component below a horizontal rule in
the `search-pane` div.

This component applies all search and label filters (via `Util.applyFilters`),
then decides how to render based on the `groupBy` prop:
 - When `groupBy` is "" (empty string): Renders a single `ResultList` component
   with all filtered recipes
 - When `groupBy` contains a label type (e.g., "Course", "Protein", "Cuisine"):
   Groups recipes by labels where Type matches the groupBy value (dynamically
   determined from API data) with collapsible group headers. Each group renders
   its own `ResultList` component. Recipes without labels matching the grouping
   type appear in an "Other" group.

The `groupBy` prop is a string indicating the label Type to group by (e.g.,
"Course", "Protein"), or "" for no grouping. The application starts with
`groupBy="Course"` by default.

Group headers display the group name and recipe count, with expand/collapse
indicators (▼/▶). The expand state is managed in App.js via the
`expandedGroups` state and `handleGroupCollapse` handler. Groups are collapsed
by default (not present in expandedGroups) except for "Main" which is expanded
on initial load.

### ResultList Component
Defined in `ResultList.js`. This is a pure presentation component that sorts
and renders a list of recipes. It receives pre-filtered recipes as props,
applies the selected sort mode (via `Util.sortRecipes`), and renders them as
an unordered list.

Recipes with the `New` field set to true (untried recipes) are displayed with
a bullet point (•) before the title. After the title, label icons are displayed
for any labels that have an `Icon` field. The icons use native browser tooltips
(via the `title` attribute) to show the label name on hover (desktop) or tap
(mobile).

**Clickable Icons**: Label icons are clickable and add the label to the advanced
query "All" filter when clicked. The click handler prevents event bubbling so
clicking an icon doesn't trigger recipe selection. If advanced options are
collapsed, clicking an icon automatically expands them. Icons show a pointer
cursor to indicate they are clickable.

The list styling removes default CSS bullets (list-style-type: none) so the
bullet indicator is controlled explicitly in the component. It does not handle
filtering - that's done by GroupedResultList.

### Recipe Component
Defined in `Recipe.js`. This component renders the currently seleted recipe in
the Recipe Pane (the Recipe Pane is rendered as either the `Recipe` component
or the `NewRecipeForm` component in the `content-container` div just after the
`search-pane` div). This component renders the recipe inside a div with class
`recipe-container`.

The Recipe component receives an `isAdmin` prop from App.js that controls the
visibility of admin-only UI elements. This prop is passed down to child
components (RecipeActions, TagList, NoteList) to conditionally render mutation
controls.

In addition to the details of the recipe, it renders three additional Components:
 - RecipeActions -- defined in `Recipe.js`; renders button controls. The back
   button (←, navy) is always visible. Edit (✎, goldenrod) and delete (🗑)
   buttons are only rendered when `isAdmin` is true. Uses semantic `<button>`
   elements with descriptive aria-labels and keyboard navigation support.
   Visual styling matches sort button design language.
 - TagList -- receives `isAdmin` prop to conditionally render "+ add label"
   button and label unlink (×) buttons
 - NoteList -- rendered inside the `notes-section` div; receives `isAdmin` prop
   to conditionally render "+ Add Note" button and note action buttons (flag,
   edit, delete)

A "recipe" object has the following properties:
 - `ID` (int): the primary identifier for this recipe
 - `Title` (string): the recipe's title, displayed in a search list
 - `Body` (string): the bulk of the recipe as a free text field. This usually includes
   ingredients and instructions both
 - `Time` (int): how long this recipe takes to cook
 - `ActiveTime` (int): how long the cook needs to spend working on this this recipe
   (chopping, stirring, etc.)
 - `New` (boolean): indicates whether the recipe has been cooked yet. When true, the
   recipe has not been cooked and is displayed with visual indicators ("(New!)" in
   the recipe title, bullet point in the recipe list)
 - `Labels` (array): array of `Label` structures this recipe is tagged with
 - `Notes` (array): array of `Note` structures attached to this recipe

### NewRecipeForm Component
Defined in `Recipe.js`. This component renders the form that lets users add a
new recipe to the database. The form includes a toggle control that manages the
`New` field on the recipe.

**Toggle Control:**
- Visual sliding toggle for marking recipes as tried/untried
- Toggle ON ("I've tried it!"): Recipe marked as tried (New: false)
- Toggle OFF ("I haven't tried this yet"): Recipe marked as new (New: true)
- Implemented as styled checkbox with value transformation in form submission
- Maintains accessibility through hidden checkbox element

The form does not currently support adding labels to a recipe on creation, and
throws uninformative errors when the times are left blank or use an unexpected
format (10m instead of 10, for example).

### Alert Component
Defined in `Alert.js`. The app renders this component to display errors --
usually API failures. It wraps the error message in a box that appears with a
red background at the top of the page.

The App component manages error state including auto-dismiss functionality.
Errors are stored with an optional context that identifies what type of error
occurred. When the action that caused the error succeeds, the error is
automatically dismissed if its context matches. This prevents stale errors from
remaining visible after the user has resolved the issue.

Implemented auto-dismiss contexts:
 - `"login"`: Dismissed when user successfully logs in
 - `"addRecipe"`: Dismissed when a recipe is successfully created/updated
 - `"deleteRecipe"`: Dismissed when a recipe is successfully deleted
 - `"addLabel"`: Dismissed when a label is successfully linked to a recipe
 - `"unlinkLabel"`: Dismissed when a label is successfully unlinked from a recipe
 - `"addNote"`: Dismissed when a note is successfully added
 - `"editNote"`: Dismissed when a note is successfully edited
 - `"deleteNote"`: Dismissed when a note is successfully deleted
 - `"flagNote"`: Dismissed when a note is successfully flagged/unflagged
 - `"fetchRecipes"`: Dismissed when recipes are successfully fetched
 - `"fetchLabels"`: Dismissed when labels are successfully fetched
 - `"fetchNotes"`: Dismissed when notes are successfully loaded
 - `"auth"`: Set when 401 errors occur (user logged out)
 - `"routing"`: Set when recipe ID in URL doesn't exist; dismissed when a recipe
   is successfully selected (via click or URL navigation)

Users can also manually dismiss any alert by clicking the × button.

### NoteList Component
Defined in `Notes.js`. This renders an unordered list of `NoteListItem`
Components followed by the `AddNoteTrigger` or `EditNoteForm` Component to
allow a user to add a new note.

The component receives an `isAdmin` prop and only renders the "+ Add Note"
button and note action controls (flag, edit, delete) when `isAdmin` is true.
Non-admin users can view notes but cannot modify them.

A "note" object has the following properties:
 - `ID` (int): the primary identifier for this note
 - `RecipeId` (int): the RecipeId for the recipe this note belongs to
 - `Created` (int): the unix timestamp of the date this note was created (used
   for sorting the notes)
 - `Note` (string): the text body of the note
 - `Flagged` (boolean): marks a note as incorporated into the recipe

### TagList Component
Defined in `Tags.js`. This renders an unordered list of `TagListItem`
components in a div with class `tag-list-container` to show the tags that are
linked to a recipe.

The component receives an `isAdmin` prop and only renders the "+ add label"
button and label unlink (×) buttons when `isAdmin` is true. Non-admin users can
view labels but cannot add or remove them. When adding a label, the component
performs a case-insensitive search against existing labels to prevent
duplicates.

#### Terminology: Labels vs Tags
The application uses two related concepts:
 - **Label**: An object representing a recipe attribute that can be used for
   categorization and filtering. A label has an `ID`, a `Label` (name) field,
   and optionally a `Type` field for grouping. Labels exist independently in the
   database and can be reused across many recipes. Labels are stored in lowercase
   in the database (e.g., "chicken", "gluten free") but formatted to title case
   for display (e.g., "Chicken", "Gluten Free").
 - **Tag**: The association between a recipe and a label. When we say a recipe is
   "tagged with" a label, we mean there is a tag linking that recipe to that
   label. In the backend database, tags are represented by a junction table
   (`recipe_label`) between the `recipe` and `label` tables.

From an end-user perspective, they primarily interact with "tags" (the act of
tagging/untagging recipes), while the underlying data structures are "labels".
The component is named `TagList` because it shows the tags (label associations)
for a specific recipe.

A "label" object (used throughout the code and API) has the following properties:
 - `ID` (int): the primary identifier for this label
 - `Label` (string): the label's name (displayed in title case)
 - `Type` (string, optional): categorizes the label for grouping purposes (e.g.,
   "Course", "Protein", "Cuisine"). Displayed in title case.
 - `Icon` (string, optional): an emoji or character used as a visual icon for
   this label in the recipe list


## Helpers
`Util.js` contains helper functions for querying/filtering, sorting, and URL
routing:

**Recipe Filtering & Sorting:**
 - `applyFilters()`: filters recipes by search text and label selections
 - `sortRecipes()`: sorts recipes by the selected sort mode (alphabetic, newest,
   or shuffle with stable random keys)
 - `selectRecipe()`: finds a recipe by ID from the recipe list
 - `getGroupingLabels(allLabels, groupBy)`: Returns array of label names that
   match the specified type. Filters labels where Type === groupBy.
 - `filterRecipesByLabel()`: filters recipes that have a specific label
   (case-insensitive matching)

**Label Formatting & Display:**
 - `formatLabelsForDisplay(labels)`: Title-cases Label and Type fields for
   display. Applied when labels are loaded from the API. This is a presentation
   concern (not data transport), so it belongs in Util rather than Api. The API
   layer returns raw data that could be used by different clients with different
   formatting needs.
 - `sortLabelsForMultiselect(labels)`: Prepares labels for display in grouped
   multiselect dropdowns. Preserves the original order of Type groups while
   sorting labels alphabetically within each Type. Labels without a Type are
   mapped to `Type: "Other"` and placed at the end of the list, sorted
   alphabetically.
 - `getAvailableTypes(allLabels)`: Extracts unique label Type values from the
   label list, filtering out undefined/null. Returns array with "Course" first
   (when present) to maintain the default grouping type.

**Form Utilities:**
 - `transformNewField()`: transforms the "new recipe" toggle value from the form
   to the correct `New` field value for API submission

**URL Routing:**
 - `generateSlug(title)`: Converts recipe title to URL-safe slug. Lowercases,
   replaces spaces/special chars with hyphens, removes consecutive hyphens, trims
   edges. Example: `"Mom's Chicken Soup"` → `"moms-chicken-soup"`
 - `parseUrl(pathname)`: Extracts recipe ID from URL pathname. Returns integer
   ID or null. Handles formats like `/123/slug`, `/123`, `/123/`
 - `buildRecipeUrl(recipeId, recipeTitle)`: Builds complete recipe URL with ID
   and slug. Returns `/{id}/{slug}` or `/{id}` if title is empty.


# Development
This is a react application bootstrapped with Create React App. To run in
development mode, invoke `npm start`. Run tests with `npm test`. You should
not have to run `npm build`; vercel should handle that automatically on push
to the `main` branch.


# Deploying
Staging: Pushes to the `stage` branch automatically deploy the application to
`https://dashery-eats-git-stage-kylemarsh.vercel.app/`

Production: Pushes to the `main` branch automatically deploy the application
to:
 - https://dashery-eats-d64mxj721-kylemarsh.vercel.app/
 - https://eats.dashery.xyz/

(the dashery.xyz url is a CNAME pointing to the vercel.app url, but the site
only functions from the dashery.xyz URL because the database API will reject
requests originating from other domains).


# Future Work
See TODO.md for a description of bugs to be fixed and features to be added.

# Making Changes
 - ALWAYS create a new branch for the feature of bugfix with a descriptive name
 - NEVER develop directly on the `main` branch
 - NEVER merge feature branches in to `main`
 - NEVER push to the remote repository

##Before making any changes
 1. Explore the repository structure
 2. Identify relevant files
 3. Explain the current implementation
 4. Propose changes. Do not write code until the user signs-off on the plan


##When making changes
 - Prefer to Follow existing patterns in the repository. Do not introduce new
   frameworks or patterns unless asked to do so. If you think a different
   pattern or framework is the best way to accomplish something, ask the user
   whether you should use it or not, explain why this pattern is correct, and
   whether or not existing code should be updated to match
 - Once on the correct feature branch, BEGIN by proposing new or updated tests
   model and contain records that populate any new fields.
 - Run through edge cases
 - Verify imports
 - Check for compilation errors
 - Confirm tests compile and pass

##After making a change
Once the user has accepted changes:
 1. Explore the repository structure again
 2. Identify changes made; DO NOT assume that the changes made are exactly what
    was discussed in the current context. Look at the diff between the feature
    branch and `main`.
 3. Update this document and any other documentation to reflect the new
    structure of the project
 4. Update the TODO.md file to remove the feature request
