# Admin Role Support Design

## Overview

Add support for admin/non-admin user roles in the recipe lister frontend. The API now returns JWTs with an `is_admin` boolean claim. The frontend should decode this claim and hide edit controls (buttons that trigger PUT/POST/DELETE requests) for non-admin users while still allowing them to view full recipe data.

## Requirements

Non-admin authenticated users should:
- ✅ View full recipe bodies (not just titles)
- ✅ View notes (read-only)
- ❌ Create/edit/delete recipes
- ❌ Create/edit/delete/flag notes
- ❌ Link/unlink labels

All mutations remain admin-only. The API enforces permissions server-side; client-side flag is for UI convenience only.

## JWT Decoding and State Management

### Installation
- Add `jwt-decode` package via npm: `npm install jwt-decode`

### Token Decoding Logic
Create a helper function `decodeAdminFlag(token)` in `App.js`:
- Takes a JWT token string as input
- Uses `jwt-decode` library to decode the payload
- Extracts the `is_admin` boolean claim
- Returns the boolean value (defaults to `false` if claim missing or decode fails)
- Handles errors gracefully (invalid/malformed tokens return `false`)
- Logs decode errors to console for debugging but doesn't show user-facing errors

### State Updates

**Login State Structure:**
Extend the `login` state object from:
```javascript
{ valid, username, token }
```
to:
```javascript
{ valid, username, token, isAdmin }
```

**Constructor (page load from localStorage):**
- When loading saved token from localStorage, decode it immediately to extract `isAdmin`
- If token is undefined/null, set `isAdmin` to `false`
- If decode fails, set `isAdmin` to `false`

**doLogin (fresh authentication):**
- After successful login and receiving new token, decode it to extract `isAdmin`
- Store `isAdmin` in login state alongside token

**doLogout:**
- Reset `isAdmin` to `false` when clearing login state

**Storage Strategy:**
- Store `isAdmin` in React state only (not in localStorage)
- Decode from token on each page load
- This prevents stale data if token is edited in localStorage and keeps token as single source of truth

### Error Handling
- If token decode fails (corrupted token, missing claim, malformed JWT): default `isAdmin` to `false`
- Don't show errors to user for decode failures - just treat as non-admin
- Log decode errors to console for debugging: `console.error('Failed to decode admin flag:', error)`

## UI Modifications for Admin-Only Controls

### Component Prop Updates
Pass `isAdmin` prop alongside existing `loggedIn` prop to components that need it:
- `Recipe` component (for recipe actions, tag actions)
- `TagList` component (for add/unlink label controls)
- `NoteList` and child components (for add/edit/delete/flag controls)

### Conditional Rendering Pattern
Use pattern: `{loggedIn && isAdmin ? <AdminControl /> : ""}`

This ensures controls are only shown when BOTH conditions are true:
1. User is authenticated (`loggedIn`)
2. User has admin privileges (`isAdmin`)

### Specific UI Changes

#### App.js (topnav)
**Current:**
```javascript
{loggedIn ? <button onClick={this.triggerAddRecipe}>New Recipe</button> : ""}
```

**Updated:**
```javascript
{loggedIn && isAdmin ? <button onClick={this.triggerAddRecipe}>New Recipe</button> : ""}
```

#### Recipe.js (RecipeActions component)
**What stays visible:**
- Back button (←) - just navigation, no API mutation

**What gets hidden for non-admins:**
- Edit button (✎) - triggers PUT request
- Delete button (🗑) - triggers DELETE request

**Implementation:**
- Pass `isAdmin` prop to `RecipeActions` component
- Conditionally render edit and delete buttons based on `isAdmin`

#### Tags.js (TagList component)
**What stays visible:**
- Tag labels themselves (read-only display)

**What gets hidden for non-admins:**
- "+ add label" trigger - creates/links labels
- Unlink (×) button on each TagListItem - triggers DELETE request

**Implementation:**
- Pass `isAdmin` prop to `TagList` component
- Update conditional: `{loggedIn && isAdmin ? <AddTagTrigger /> : ""}`
- Pass `isAdmin` to `TagListItem` and conditionally render unlink button

#### Notes.js (NoteList/NoteActions components)
**What stays visible:**
- Note content (read-only display)
- Note dates

**What gets hidden for non-admins:**
- "+ Add Note" trigger - creates notes
- Flag buttons (☆/★) - triggers PUT request
- Edit buttons (✎) - triggers PUT request
- Delete buttons (×) - triggers DELETE request

**Implementation:**
- Pass `isAdmin` prop through: `NoteList` → `NoteListItem` → `NoteActions`
- Conditionally render "+ Add Note" trigger based on `isAdmin`
- In `NoteActions`, conditionally render all action buttons based on `isAdmin`

## Testing Considerations

### Manual Testing Scenarios
1. **Admin user login**: Verify all edit controls visible
2. **Non-admin user login**: Verify all edit controls hidden, content still visible (including full recipe bodies and notes)
3. **Page reload as admin**: Verify admin controls persist after refresh
4. **Page reload as non-admin**: Verify controls remain hidden after refresh
5. **Invalid token in localStorage**: Verify graceful degradation (treats as non-admin)
6. **Logout**: Verify admin flag resets to false

### Edge Cases Handled
- **Missing `is_admin` claim in JWT**: Default to `false` (non-admin)
- **Malformed JWT in localStorage**: Decode fails gracefully, treats as non-admin
- **Token without payload**: Decode fails gracefully, treats as non-admin
- **Undefined/null token**: Skip decode, set `isAdmin` to `false`

## What Won't Change

- **API layer** (`api.js`): No changes needed - API already enforces auth on server side
- **Data fetching**: Authenticated non-admins still fetch full recipe bodies and notes (use `priv/` endpoints)
- **Error handling**: 401 errors still trigger logout (unchanged behavior)
- **Visual design**: No new CSS styles needed, just hiding existing elements
- **Server permissions**: API continues to be the source of truth for authorization

## Implementation Notes

- No new API calls required
- No database changes required
- Client-side flag is for UI convenience only; server enforces actual permissions
- If client-side check is bypassed (e.g., via browser console), API will still reject unauthorized requests
- The `is_admin` claim is already present in JWTs from the API - this is purely a frontend change
