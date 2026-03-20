# OVERVIEW
React-based SPA for recipe database management. Production: `https://eats.dashery.xyz`.
Communicates with backend API via JSON over REST. Supports URL routing for deep linking
to recipes (e.g., `/123/chicken-soup`) and admin label management (`/admin/labels`).


# Structure
All of the react code are in the `src/` directory.

## UI
**Layout:** Header + two-pane layout (List Pane | Recipe Pane). Both panes scroll independently.

**Header:** Login/logout controls, admin-only buttons (New Recipe, ⚙️ Manage Labels).
Mobile: horizontal compact layout. See `docs/features/admin-role-support.md` for auth details.

### List Pane
**Query Form:**
- Search input with 📄 full-text toggle button
- Advanced checkbox reveals label filters (All/Any/None multiselects with AND/OR/NOT logic)
- Sort buttons: 🔤 Alphabetic (default), 📅 Newest, 🔀 Shuffle
- 📂 Group button cycles through label types (Course → other types → none). See `docs/specs/cycling-group-button.md`

**Recipe List:** Scrolls independently. Shows filtered/sorted recipes. Label icons are clickable
(adds to advanced filter). Recipes with `New=true` display bullet (•) prefix. Mobile tooltips on
tap-and-hold. See `docs/specs/SPEC-clickable-tag-icons.md`

### Recipe Pane
Displays selected recipe with 6 sections: (1) Title with "(New!)" indicator, (2) Action buttons
(close, edit, delete - admin-only), (3) Timing info, (4) Body (ingredients + instructions),
(5) Tags with "+ add label" (admin-only), (6) Notes with flag/edit/delete controls (admin-only).

**New Recipe Form:** Title, ActiveTime, TotalTime, Body fields. Toggle for "tried/untried" status.
See `docs/specs/SPEC-tag-workflow.md` for tagging details.

### Label Manager (Admin Only)
Admin-only interface at `/admin/labels`. Full-page layout with search, grouped display,
inline editing, usage counts, delete confirmation, and recipe association panel for
linking/unlinking. Component: `LabelManager.js`. See `docs/specs/label-manager.md` for
full details.

## API
Functions in `api.js` interact with backend (URL: `REACT_APP_API_HOST` env var).

**Auth:** JWT-based. Login returns token with `is_admin` claim. Token stored in localStorage,
included in `x-access-token` header. Routes: public (`/recipes/`, `/labels/`), authenticated
(`/priv/*`), admin (`/admin/*`). See `docs/features/admin-role-support.md`.

**Data Loading:** Unauthenticated users see titles/labels only. Authenticated users get full
bodies upfront, notes loaded on-demand.

**Data Formatting:** Labels title-cased via `Util.formatLabelsForDisplay()` (presentation layer).

**Error Responses:** See `docs/API_ERROR_RESPONSES.md` for complete error reference.

### URL Routing
Client-side routing via History API. Patterns: `/{id}/{slug}` for recipes, `/admin/labels` for
label manager. Uses `pushState`/`replaceState` for navigation, `popstate` listener for back/forward.
Deep linking supported (auth-aware). Implementation in `Util.js` (parsing) and `App.js` (routing methods).
See `docs/specs/direct-links-to-recipes.md`.


## Libraries
This project uses:
 - "react" (v19)
 - "react-dom" (v19)
 - "react-widgets" (for multiselect dropdowns)
 - "react-scripts" (Create React App build tooling)
 - "jwt-decode" (for decoding JWTs to extract admin flag)

## Components
**App.js:** Top-level component (bootstrapped by `index.js`). Manages state (recipes, labels, filters,
auth, routing), handles actions, renders child components. Key state: `targetRecipe`, `recipeJustEdited`,
`expandedGroups`, `login.isAdmin`. Lifecycle: `componentDidMount` adds `popstate` listener,
`componentDidUpdate` handles routing/note loading, `componentWillUnmount` cleans up.

**LoginComponent:** (`LoginComponent.js`) Login/logout UI with icons (👤/👋/⚙️).

**QueryForm:** (`QueryForm.js`) Search input, full-text toggle, advanced checkbox, sort/group buttons.

**AdvancedQuery:** (`AdvancedQuery.js`) All/Any/None label multiselects using `react-widgets`.
Grouped by Type. See `docs/specs/SPEC-multiselect-grouping.md`.

**GroupedResultList:** (`GroupedResultList.js`) Applies filters (`Util.applyFilters`), conditionally
renders by `groupBy` prop. Renders `ResultList` for each group or ungrouped.

**ResultList:** (`ResultList.js`) Sorts/renders recipe list. Shows "•" for new recipes, label icons
(clickable), tooltips. See `docs/specs/SPEC-clickable-tag-icons.md`.

**Recipe:** (`Recipe.js`) Displays recipe with RecipeActions, TagList, NoteList child components.
Receives `isAdmin` prop for conditional rendering.

**NewRecipeForm:** (`Recipe.js`) Form with toggle for tried/untried status. See
`docs/superpowers/specs/2026-03-12-checkbox-to-toggle.md`.

**Alert:** (`Alert.js`) Error display with auto-dismiss contexts. Parsing via `Util.parseApiError()`,
`Util.formatErrorMessage()`. See `docs/API_ERROR_RESPONSES.md` for error types.

**NoteList:** (`Notes.js`) List of notes with add/edit/flag/delete controls (admin-only). Auto-focus
textarea. See `docs/specs/auto-focus-note-textarea.md`.

**TagList:** (`Tags.js`) Shows recipe's labels with add/unlink controls (admin-only). Combobox with
autocomplete, auto-submit, keyboard workflow. See `docs/specs/SPEC-tag-workflow.md`.

**Terminology:** "Label" = reusable categorization object. "Tag" = recipe-label association.

**LabelManager:** (`LabelManager.js`) Admin-only full-page interface. See `docs/specs/label-manager.md`
for state, methods, and features.


## Helpers
`Util.js` utility functions:

**Filtering/Sorting:** `applyFilters()`, `sortRecipes()`, `selectRecipe()`, `getGroupingLabels()`,
`filterRecipesByLabel()`

**Label Formatting:** `formatLabelsForDisplay()` (title-case for display), `sortLabelsForMultiselect()`
(grouped/sorted for dropdowns), `getAvailableTypes()` (extracts unique Types)

**Form:** `transformNewField()` (toggle → API `New` field)

**URL Routing:** `generateSlug()`, `parseUrl()`, `buildRecipeUrl()`

**Error Handling:** `parseApiError()`, `formatErrorMessage()` (status codes → human-readable)

## Data Models
**Recipe:** `{ID, Title, Body, Time, ActiveTime, New, Labels[], Notes[]}`

**Label:** `{ID, Label, Type?, Icon?}` - Stored lowercase in DB, title-cased for display.
"Tag" = recipe-label association.

**Note:** `{ID, RecipeId, Created, Note, Flagged}`

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
 5. Write any spec or implementation documents to the same location as other
    similar documents that already exist.


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
