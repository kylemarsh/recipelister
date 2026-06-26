# Spec: Undo Delete Recipe

**Status**: Draft
**Date**: 2026-03-21

## Overview
Add the ability to undo recipe deletion by showing a notification with an "Undo" button after deleting a recipe. This requires replacing the current error-only Alert system with a unified notification system that supports both error messages and action-driven notifications.

## Motivation
- Accidental deletion is unrecoverable without database access
- Backend already supports soft-delete/restore (DELETE = soft-delete, PUT /admin/recipe/{id}/restore = un-delete)
- Common pattern in modern web apps (Gmail, GitHub, etc.)
- Improves user confidence when managing recipes

## Current State

### Alert System
**Component**: `Alert.js` (13 lines)
- Single alert instance for errors only
- Props: `{type, message, handleClose}`
- Types defined in CSS: `error`, `success`, `warning`, `primary`, `secondary`, `info`
- Only `error` type currently used

**State Management** (App.js):
- `error`: string message
- `errorContext`: string identifier for which operation failed
- Auto-dismisses errors on successful subsequent operations

### Delete Flow
**Handler**: `handleRecipeDelete` (App.js:258-274)
1. Calls `Api.deleteRecipe(recipeId, auth)` (soft-delete)
2. On success: removes recipe from state, clears targetRecipe, clears URL
3. On error: shows error alert with context "deleteRecipe"

**API**: `DELETE /admin/recipe/{id}` (returns 204 on success)
- Soft-deletes recipe (sets `deleted` flag)
- Recipe remains in database, can be restored via `PUT /admin/recipe/{id}/restore`

## Proposed Changes

### 1. Unified Notification System

Replace Alert component with new Notification component that supports:
- Multiple notification types (error, success, info, etc.)
- Optional action buttons (e.g., "Undo")
- Replaces existing error-only alert system

**New Component**: `Notification.js` (replaces `Alert.js`)
```jsx
// Props:
{
  type: "error" | "success" | "info" | "warning",
  message: string | JSX,
  handleClose: function,
  action?: { label: string, handler: function }
}
```

**CSS Updates** (`Alert.css` → `Notification.css`):
- Maintain existing color schemes
- Add button styling for action buttons
- Position action button inline with close button

### 2. State Management Changes

**App.js state changes**:

Replace:
```javascript
error: string | null,
errorContext: string | null
```

With:
```javascript
notification: {
  type: "error" | "success" | "info" | "warning",
  message: string,
  context: string | null,  // e.g., "deleteRecipe", "addRecipe" - for auto-dismiss on success
  action: { label: string, handler: function } | null
} | null,
deletedRecipeId: number | null
```

**Auto-dismiss behavior**: When an action succeeds (e.g., successfully adding a recipe), check if `this.state.notification?.context` matches the operation context (e.g., "addRecipe"). If it matches, clear the notification. This preserves the existing error auto-dismiss functionality.

### 3. Delete/Undo Flow

**Delete Flow** (modified `handleRecipeDelete`):
1. Call `Api.deleteRecipe(recipeId, auth)` (soft-delete)
2. On success:
   - Remove recipe from `allRecipes`
   - Clear `targetRecipe`
   - Clear URL
   - Show notification: `{type: "info", message: "Recipe deleted", context: null, action: {label: "Undo", handler: handleUndoDelete}}`
   - Store `deletedRecipeId` for restore API call
3. On error: show notification: `{type: "error", message: errorMessage, context: "deleteRecipe", action: null}`

**Undo Flow** (new `handleUndoDelete`):
1. Call `Api.restoreRecipe(deletedRecipeId, auth)` → returns 204 No Content
2. On 204 response:
   - Call `Api.getRecipe(deletedRecipeId, auth)` to fetch full recipe details
   - Add restored recipe to `allRecipes`
   - Clear notification
   - Clear `deletedRecipeId`
   - Optionally: set `targetRecipe` to restored recipe ID to re-open it
3. On error:
   - Show notification: `{type: "error", message: "Could not restore recipe", context: "undoDelete", action: null}`
   - Clear `deletedRecipeId`

**New API function** (`api.js`):
```javascript
async function restoreRecipe(recipeId, auth) {
  const resource = `${API_HOST}admin/recipe/${recipeId}/restore`;
  const requestInit = {
    method: "PUT",
    headers: { "x-access-token": auth.token },
  };
  return await doAction(resource, requestInit);
}
```

### 4. Notification Lifecycle

**Show notification when**:
- Recipe deleted successfully

**Clear notification when**:
- User clicks close button
- User clicks "Undo" button (after undo completes)
- User deletes another recipe (replace with new notification)
- Label manager opens (`handleShowLabelManager`)

**Persist notification across**:
- Recipe navigation (selecting different recipe)
- Filter changes
- Sort changes

**Do NOT auto-dismiss** - notification persists until user acts or triggers clearing condition

### 5. Edge Cases

**Second delete before undo**:
- Replace existing notification with new one
- Previous `deletedRecipeId` is abandoned (can't undo)
- Only most recent delete can be undone

**Undo API fails**:
- Show error notification: "Could not restore recipe"
- Clear `deletedRecipeId`
- Recipe remains soft-deleted in database

**User navigates away**:
- Notification persists (user can still undo after browsing other recipes)
- Notification only clears on label manager open or close button

**Label manager opens**:
- Clear notification (assumption: user has moved on to different task)

## Implementation Plan

### Phase 1: Notification Component
1. Rename `Alert.js` → `Notification.js`, `Alert.css` → `Notification.css`
2. Add action button rendering and styling
3. Update component to accept `action` prop
4. Update imports in `App.js`

### Phase 2: State Management Migration
1. Replace `error` and `errorContext` state with `notification` state
2. Add `deletedRecipeId` to App state
3. Create `handleNotificationClose` method
4. Update `handleError` to set notification instead of error
5. Update all error auto-dismiss checks:
   - Change `if (this.state.errorContext === "X")` to `if (this.state.notification?.context === "X")`
   - Change `updates.error = null; updates.errorContext = null;` to `updates.notification = null;`
6. Update render to show notification instead of error alert

### Phase 3: Delete/Undo Flow
1. Add `restoreRecipe` to `api.js`
2. Modify `handleRecipeDelete` to set notification with undo action
3. Create `handleUndoDelete` method
4. Update `handleShowLabelManager` to clear notification

### Phase 4: Testing
1. Test existing error flows still work (login failure, API errors, etc.)
2. Verify error auto-dismiss still works on successful actions
3. Delete recipe, verify notification appears with Undo button
4. Click Undo, verify recipe restored and reappears in list
5. Delete recipe A, delete recipe B, verify only B can be undone
6. Delete recipe, open label manager, verify notification clears
7. Delete recipe, navigate to different recipe, verify notification persists
8. Undo with API failure, verify error notification shown

## Component Structure After Changes

```
<App>
  <Header>
    <LoginComponent />
  </Header>
  <hr />
  {notification && <Notification {...notification} handleClose={handleNotificationClose} />}
  {showLabelManager ? (
    <LabelManager />
  ) : (
    <main>
      <ListPane />
      <RecipePane />
    </main>
  )}
</App>
```

## Breaking Changes

**Internal API Changes**:
- `error` and `errorContext` state properties removed, replaced with unified `notification` object
- All error handling code must be updated to use new notification structure
- Components that receive error-related props will need updates

**User-Facing Changes**:
- None - notification behavior and appearance remains the same for errors
- New: undo button appears after deleting recipes

## Files to Modify

**Renamed**:
- `src/Alert.js` → `src/Notification.js`
- `src/Alert.css` → `src/Notification.css`

**Modified**:
- `src/App.js` (state structure, all error handlers, delete/undo handlers, render, label manager handler)
- `src/api.js` (add restoreRecipe function)
- `CLAUDE.md` (update Alert → Notification in component documentation)

**Tests**:
- `src/App.test.js` - Update imports from Alert → Notification
- `src/App.test.js` - Update all test assertions that check error state
- Add tests for undo flow
- Add tests for notification clearing behavior
- Add tests for notification context auto-dismiss

## Open Questions
1. Should undo re-open the restored recipe, or just add it back to the list?
2. Icon for info-type notification (currently using blue color from CSS)?

## Success Criteria
- All existing error alerts successfully migrated to new notification system
- Error auto-dismiss behavior preserved (errors clear on successful retry)
- User can undo most recent recipe deletion
- Notification with undo action persists until user acts or opens label manager
- Only one undo available at a time (second delete replaces first)
- Failed undo shows clear error notification
- No regressions in existing error handling or user workflows
