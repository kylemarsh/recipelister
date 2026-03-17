# Direct Links to Recipes - Feature Spec

## Desired Outcome

Add URL routing to the single-page application so users can:
- Share direct links to specific recipes
- Use browser back/forward buttons to navigate between recipes
- Bookmark recipes for later access
- Deep link to recipes (including when logged out)

The application should remain a true SPA - no page reloads when navigating between recipes.

## Current State

The application has no URL routing. The entire app operates at the root URL (`/`), and selecting recipes only updates component state. This means:
- No way to share a link to a specific recipe
- Browser back/forward buttons navigate away from the site entirely
- No bookmarking individual recipes
- URL bar doesn't reflect application state

## Implementation Decisions

### URL Format
- Pattern: `/{recipe-id}/{slug}` where slug is optional for routing purposes
- Examples:
  - `/123/moms-chicken-soup` (full URL with slug)
  - `/123` (valid, works identically to full URL)
- Recipe ID is the only required routing parameter
- Slug is generated for SEO/readability but not used for routing logic

### Slug Generation Rules
- Algorithm: lowercase, replace spaces/special chars with hyphens, remove consecutive hyphens, trim edges
- Example: `"Mom's Chicken Soup"` → `"moms-chicken-soup"`
- Utility function: `Util.generateSlug(title)`

### Slug Validation/Correction
- Incorrect slugs are auto-corrected without adding history entry
- Example: navigating to `/123/wrong-slug` automatically updates URL to `/123/moms-chicken-soup`
- Uses `history.replaceState()` to avoid polluting browser history
- Correction only happens after recipes load and ID is validated

### URL Update Behavior
- **Recipe selected from list**: `history.pushState()` to `/{id}/{slug}`
  - Adds history entry so back button works
- **Recipe closed (← button)**: `history.pushState()` to `/`
  - Adds history entry for clean navigation
  - Uses `/` explicitly (not empty string)
- **Slug correction**: `history.replaceState()` to `/{id}/{correct-slug}`
  - No history entry, just fixes the URL

### Initial Page Load Routing
1. Parse `window.location.pathname` on component mount
2. Extract recipe ID from URL pattern (if present)
3. Wait for recipes to load via existing `getRecipes()` call
4. Once recipes loaded, validate ID exists in recipe list
5. If valid: set `targetRecipe` state, validate/correct slug, load notes (if logged in)
6. If invalid: show error alert, clear invalid URL to `/`
7. If no ID in URL: normal app startup (no recipe selected)

### Browser Back/Forward Navigation
- Add `popstate` event listener in `componentDidMount`
- On popstate event: parse current URL, update `targetRecipe` state
- Remove listener in `componentWillUnmount` (prevent memory leaks)
- Back/forward navigation triggers same routing logic as initial load

### Deep Linking While Logged Out
- Unauthenticated users can navigate to recipe URLs
- Recipe displays with title and labels only (existing behavior)
- Recipe body is not loaded (consistent with current auth model)
- If user logs in after page loads:
  - `componentDidUpdate` detects login state change
  - Recipes reload (fetches bodies via existing logic)
  - If `targetRecipe` is set, trigger `loadNotes()` for that recipe

### Error Handling
- **Recipe ID doesn't exist**: Show error alert ("Recipe not found" with context
  "routing"), clear URL to `/`
- **Routing error auto-dismiss**: Error is automatically dismissed when user
  successfully navigates to a recipe (via click or URL)
- **Invalid URL format**: Ignore, treat as no recipe selected
- **Network errors**: Handled by existing error handling (no special routing logic)

### Out of Scope
- Query parameters for filter state (e.g., `?search=chicken&tags=dinner`)
  - Add separate TODO item for this feature
- Editing URL format or requiring slugs
- Server-side routing (this is client-side only)

## Technical Implementation

### New Functions

**Util.js**
- `generateSlug(title)`: Generate URL-safe slug from recipe title
  - Input: `"Mom's Chicken Soup"`
  - Output: `"moms-chicken-soup"`

**App.js**
- `parseUrl()`: Extract recipe ID from `window.location.pathname`
  - Returns: recipe ID (number) or null
- `updateUrl(recipeId, recipeTitle)`: Generate slug and push new URL
  - Calls `Util.generateSlug(recipeTitle)`
  - Uses `history.pushState(null, '', path)`
- `clearUrl()`: Push root URL
  - Uses `history.pushState(null, '', '/')`
- `validateAndCorrectSlug(recipeId, recipeTitle)`: Check slug matches, replace if wrong
  - Compares current URL slug with generated slug
  - Uses `history.replaceState()` if correction needed
- `handlePopState(event)`: Handle browser back/forward navigation
  - Parse URL, update `targetRecipe` state
  - Load notes if logged in and recipe selected
- `routeToRecipeFromUrl()`: Initial routing logic for page load
  - Parse URL, validate ID, set targetRecipe, correct slug
  - Show error if ID doesn't exist

### Modified Functions

**App.js**
- `handleResultClick`: Add call to `updateUrl(recipeId, recipeTitle)` after setting targetRecipe
- `recipeHandlers.UntargetClick`: Add call to `clearUrl()` after clearing targetRecipe
- `componentDidMount`:
  - Add `popstate` event listener
  - Call `routeToRecipeFromUrl()` after recipes/labels load (or defer until `componentDidUpdate`)
- `componentDidUpdate`:
  - After recipes load: if URL has recipe ID and `targetRecipe` not set, call `routeToRecipeFromUrl()`
  - After login completes: if `targetRecipe` is set, call `loadNotes(targetRecipe)`
- `componentWillUnmount`: Remove `popstate` listener

### Flow Diagrams

**Initial Page Load (with recipe ID in URL)**
```
1. App mounts
2. componentDidMount calls getRecipes() and getLabels()
3. componentDidMount adds popstate listener
4. Recipes load → componentDidUpdate fires
5. componentDidUpdate sees recipes loaded, calls routeToRecipeFromUrl()
6. routeToRecipeFromUrl parses URL (/123/slug)
7. Validate ID 123 exists in allRecipes
8. If valid: setState({ targetRecipe: 123 }), validateAndCorrectSlug()
9. If logged in: loadNotes(123)
10. If invalid: show error, clearUrl()
```

**User Clicks Recipe from List**
```
1. handleResultClick fires
2. setState({ targetRecipe: recipeId })
3. updateUrl(recipeId, recipeTitle)
4. history.pushState to /123/moms-chicken-soup
5. If logged in: loadNotes(recipeId)
```

**User Clicks Back Button**
```
1. Browser navigates back in history
2. popstate event fires
3. handlePopState parses current URL
4. setState({ targetRecipe: idFromUrl or undefined })
5. If logged in and recipe selected: loadNotes(recipeId)
```

**User Closes Recipe (← button)**
```
1. recipeHandlers.UntargetClick fires
2. setState({ targetRecipe: undefined })
3. clearUrl()
4. history.pushState to /
```

**Deep Link While Logged Out, Then Login**
```
1. User navigates to /123/slug (not logged in)
2. Initial routing sets targetRecipe: 123
3. Recipe displays with title/labels only
4. User logs in
5. componentDidUpdate detects login change
6. Reloads recipes (now with bodies)
7. Sees targetRecipe is set, calls loadNotes(123)
8. Notes load, full recipe displays
```

## Edge Cases

1. **URL has `/123` but recipe 123 doesn't exist**
   - Show error alert, clear URL to `/`

2. **Slug is wrong (`/123/incorrect-slug`)**
   - After recipes load, correct to `/123/correct-slug` via `replaceState`

3. **User edits recipe title**
   - Slug should update to match new title
   - Use `replaceState` to avoid adding history entry

4. **Network error during initial recipe load**
   - Existing error handling applies
   - Routing deferred until recipes load successfully

5. **User deletes currently-selected recipe**
   - Existing logic clears `targetRecipe`
   - Need to add: also call `clearUrl()`

6. **Multiple rapid back/forward clicks**
   - Each popstate event updates state
   - React batching handles rapid updates
   - Should be fine, but test carefully

## Testing Checklist

- [ ] Direct link to existing recipe loads correctly
- [ ] Direct link with wrong slug auto-corrects
- [ ] Direct link with no slug works (just ID)
- [ ] Direct link to non-existent recipe shows error
- [ ] Clicking recipe from list updates URL
- [ ] Back button navigates to previous recipe
- [ ] Back button from first recipe returns to list view (/)
- [ ] Forward button works after going back
- [ ] Closing recipe (← button) clears URL to /
- [ ] Deep link while logged out shows title/labels
- [ ] Logging in after deep link loads body/notes
- [ ] Editing recipe title updates slug in URL
- [ ] Deleting currently-selected recipe clears URL
- [ ] Browser bookmark works
- [ ] Sharing URL works (test in different browser/incognito)

## TODO.md Updates

After implementation, add to TODO.md:
```markdown
## Query Parameters for Filter State
Preserve filter/search state in URL query parameters (e.g.,
?search=chicken&tags=dinner&sort=newest) so direct links can include
search context. Should work alongside recipe routing.
```

Remove from TODO.md:
```markdown
## Direct Links to Recipes
(entire section lines 40-53)
```
