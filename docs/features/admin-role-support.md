# Admin Role Support

**Implemented:** 2026-03-15
**Branch:** feature/admin-role-support
**Status:** Complete

## Overview

Added role-based access control to support admin and non-admin users. Admin users have full edit privileges while non-admin users have read-only access to all recipes, notes, and labels.

## Implementation Details

### Authentication & Authorization

**JWT Decoding:**
- JWTs now include an `is_admin` boolean claim
- Added `jwt-decode` library (v4.0.0) to extract claims from JWT
- `decodeAdminFlag()` helper function safely decodes JWT and extracts admin flag
- Admin flag decoded on page load (from localStorage) and on successful login
- Admin flag stored in application state as `login.isAdmin`

**API Route Organization:**
- **Public routes** (no auth): `/recipes/`, `/labels/`
- **Authenticated routes** (`/priv/*`): Read-only access with valid JWT (full recipe bodies, notes)
- **Admin routes** (`/admin/*`): Mutation operations requiring admin privilege (all POST, PUT, DELETE)

### UI Changes

**Admin-Only Controls Hidden for Non-Admin Users:**
- New Recipe button (top navigation)
- Recipe edit and delete buttons (back button always visible)
- Label add ("+ add label") and unlink (×) buttons
- Note add ("+ Add Note"), flag, edit, and delete buttons

**Implementation Pattern:**
- App.js passes `isAdmin` prop to Recipe component
- Recipe component passes `isAdmin` to child components (RecipeActions, TagList, NoteList)
- Components conditionally render admin controls based on `isAdmin` prop
- Non-admin users retain full read access to recipes, notes, and labels

### Bug Fixes

**Duplicate Labels Issue:**
- Fixed case-sensitive label search when linking existing labels to recipes
- Changed from `x.Label === labelName` to `x.Label.toLowerCase() === labelName`
- Prevented duplicate label entries in `allLabels` and duplicate groups in grouped view

## Files Modified

- `package.json` - Added jwt-decode dependency
- `src/App.js` - JWT decode logic, state management, isAdmin prop passing
- `src/api.js` - Updated mutation endpoints from `/priv/*` to `/admin/*`
- `src/Recipe.js` - Conditional rendering in RecipeActions component
- `src/Tags.js` - Conditional rendering in TagList and TagListItem components
- `src/Notes.js` - Conditional rendering in NoteList and NoteActions components
- `src/App.test.js` - Updated tests to pass isAdmin prop
- `CLAUDE.md` - Documentation of auth flow, API routes, component props
- `TODO.md` - Updated Guest Users section to reflect partial completion

## Testing

All tests passing (48/48):
- JWT decode integration tests
- Constructor admin flag behavior tests
- doLogin/doLogout admin flag handling tests
- RecipeActions button rendering tests
- Existing feature tests continue to pass

## Security Notes

- Client-side `isAdmin` checks are UI convenience only
- Server enforces access control via `/admin/*` route protection
- JWTs contain cryptographically signed claims
- Admin flag never stored separately in localStorage (always derived from JWT)
- Decode errors gracefully default to non-admin (isAdmin=false)

## Future Enhancements

See TODO.md "Guest Users" section for remaining work:
- Revokable tokens for specific recipe viewing
- Per-user recipe access lists
- Admin UI for creating guest users and sharable links
