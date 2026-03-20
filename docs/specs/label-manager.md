# Spec: Label Manager Interface

**Status:** ✅ Implemented (2026-03-19)

## Overview
Create an admin-only interface for managing labels (editing, creating, deleting, and viewing/unlinking recipe associations). The interface replaces the List Pane and Recipe Pane when active and is accessible via URL routing.

## Current State
Labels can be:
- Created implicitly when tagging recipes (via `TagRecipeForm`)
- Linked/unlinked from recipes
- Displayed in recipe lists, multiselect filters, and tag lists

What's missing:
- No way to edit label properties (Label, Type, Icon)
- No way to delete labels
- No way to view all recipes tagged with a label
- No bulk management or overview of all labels

**API support exists but is not integrated:**
- `PUT /admin/label/id/{label_id}` with body: `{"label": "...", "type": "...", "icon": "..."}`
  - Fields are optional; omitted fields remain unchanged
- `DELETE /admin/label/id/{label_id}`
  - Automatically unlinks label from all recipes

## Goals
1. Provide a dedicated interface for label management
2. Enable inline editing of label properties (Label, Type, Icon)
3. Support label creation with all fields
4. Support label deletion with confirmation
5. Show recipe associations and allow unlinking
6. Filter/search labels by name
7. Display usage statistics (recipe count per label)
8. URL routing at `/admin/labels`

## Implementation Plan

### Feature 1: Label Manager View & Routing

**Component:** `LabelManager.js` (new file)

**URL routing:**
- Route: `/admin/labels`
- Updates browser URL using History API (like recipe routing)
- On page load, check URL and route to label manager if path matches
- Back button in manager returns to main recipe view and clears URL

**Layout:**
- Replaces both List Pane and Recipe Pane
- Full-width layout with header, search bar, and label table/list
- Back button (← like Recipe pane) to return to main view

**App state additions:**
```javascript
this.state = {
  // existing...
  showLabelManager: false, // Controls visibility
}
```

**App routing methods:**
```javascript
// Navigate to label manager
navigateToLabelManager = () => {
  this.setState({ showLabelManager: true });
  window.history.pushState(null, '', '/admin/labels');
}

// Navigate back to recipe view
navigateFromLabelManager = () => {
  this.setState({ showLabelManager: false });
  window.history.pushState(null, '', '/');
}
```

**URL parsing in `componentDidMount` and `handlePopState`:**
- Check if pathname is `/admin/labels`
- Set `showLabelManager: true` if match
- Otherwise route to recipe or main view

**Conditional rendering in App.js:**
```javascript
{this.state.showLabelManager ? (
  <LabelManager
    allLabels={this.state.labels}
    allRecipes={this.state.recipes}
    handleBack={this.navigateFromLabelManager}
    handleLabelUpdate={this.handleLabelUpdate}
    handleLabelDelete={this.handleLabelDelete}
    handleLabelCreate={this.handleLabelCreate}
    handleUnlinkRecipe={this.handleUnlinkRecipe}
    setAlert={this.setAlert}
  />
) : (
  // existing search-pane and content-container
)}
```

---

### Feature 2: Manage Labels Button (Trigger)

**Component:** `LoginComponent.js`

**Changes:**
- Add "Manage Labels" button next to "New Recipe" button
- Only visible when `isAdmin` is true
- Clicking calls `props.handleManageLabelsClick`

**Button styling:**
- Match existing button styles (New Recipe, Log Out)
- Placed in `topnav` div between "New Recipe" and "Log Out"

**App handler:**
```javascript
handleManageLabelsClick = () => {
  this.navigateToLabelManager();
}
```

**Props to LoginComponent:**
- `handleManageLabelsClick={this.handleManageLabelsClick}`

---

### Feature 3: Label Display & Grouping

**Component:** `LabelManager.js`

**Display structure:**
- Search box at top (filters labels by Label or Type field)
- Labels grouped by Type (like multiselect dropdowns)
- Type groups sorted: "Course" first, then alphabetically, "Other" last
- Labels within groups sorted alphabetically
- Collapsible groups with expand/collapse indicators (▼/▶)

**Label row format (table or styled list):**
- **Label name** (editable inline)
- **Type** (editable inline)
- **Icon** (editable inline)
- **Usage count** (clickable to show recipe panel)
- **Delete button** (🗑)

**Search/filter:**
- Text input filters labels case-insensitively
- Searches both Label and Type fields
- Updates filtered list in real-time
- Empty results show "No labels found"

**State:**
```javascript
this.state = {
  searchQuery: '',
  expandedGroups: new Set(['Course']), // Default Course expanded
  recipePanelLabel: null, // Label ID for which recipe panel is shown
  editingLabel: null, // {labelId, field} for inline editing
}
```

**Helper methods:**
```javascript
// Filter labels by search query
getFilteredLabels = () => {
  const query = this.state.searchQuery.toLowerCase();
  if (!query) return this.props.allLabels;
  return this.props.allLabels.filter(label =>
    label.Label.toLowerCase().includes(query) ||
    (label.Type && label.Type.toLowerCase().includes(query))
  );
}

// Group labels by Type
getGroupedLabels = () => {
  // Similar to GroupedResultList logic
  // Use Util.getAvailableTypes() for type list
  // Group filtered labels by Type
}

// Count recipes for each label
getLabelUsage = (labelId) => {
  return this.props.allRecipes.filter(recipe =>
    recipe.Labels && recipe.Labels.some(l => l.ID === labelId)
  ).length;
}
```

---

### Feature 4: Inline Editing

**Component:** `LabelManager.js`

**Inline edit behavior:**
- Click on Label/Type/Icon text to enter edit mode
- Text converts to input field with current value
- Auto-focus input, select all text
- Submit on Enter or blur
- Cancel on Escape (reverts to original value)
- While editing, other fields are read-only

**State tracking:**
```javascript
this.state = {
  editingLabel: null, // { labelId: 123, field: 'Label' }
  editValue: '', // Current value in edit input
}
```

**Edit handlers:**
```javascript
startEdit = (labelId, field, currentValue) => {
  this.setState({
    editingLabel: { labelId, field },
    editValue: currentValue || '',
  });
}

cancelEdit = () => {
  this.setState({
    editingLabel: null,
    editValue: '',
  });
}

submitEdit = (labelId, field, newValue) => {
  // Validation
  if (field === 'Label' && !newValue.trim()) {
    this.props.setAlert('Label name cannot be empty', 'editLabel');
    return;
  }

  const trimmedValue = newValue.trim();

  // Validate icon length (single grapheme only)
  if (field === 'Icon' && trimmedValue && typeof Intl.Segmenter !== 'undefined') {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(trimmedValue));
    if (segments.length > 1) {
      this.props.setAlert('Icon must be a single character or emoji', 'editLabel');
      return;
    }
  }
  // If Intl.Segmenter not available (older browsers), skip validation

  // Build request body with only changed field
  const body = { [field.toLowerCase()]: trimmedValue };

  this.props.handleLabelUpdate(labelId, body, () => {
    this.cancelEdit();
  });
}
```

**Keyboard handling in input:**
```javascript
handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    this.submitEdit(/* ... */);
  } else if (e.key === 'Escape') {
    this.cancelEdit();
  }
}
```

**App handler:**
```javascript
handleLabelUpdate = (labelId, updates, callback) => {
  Api.updateLabel(labelId, updates)
    .then(() => {
      this.getLabels(); // Reload labels
      this.dismissAlert('editLabel');
      if (callback) callback();
    })
    .catch(error => {
      this.setAlert(error, 'editLabel');
    });
}
```

---

### Feature 5: Label Deletion

**Component:** `LabelManager.js`

**Delete button:**
- 🗑 icon/button in each label row
- Clicking opens confirmation dialog
- Confirmation shows: "Delete '{Label}'? This will unlink it from {count} recipe(s)."
- Confirm/Cancel buttons in dialog

**Confirmation state:**
```javascript
this.state = {
  deleteConfirm: null, // { labelId, labelName, usageCount } or null
}
```

**Delete handlers:**
```javascript
showDeleteConfirm = (labelId, labelName, usageCount) => {
  this.setState({
    deleteConfirm: { labelId, labelName, usageCount },
  });
}

cancelDelete = () => {
  this.setState({ deleteConfirm: null });
}

confirmDelete = () => {
  const { labelId } = this.state.deleteConfirm;
  this.props.handleLabelDelete(labelId, () => {
    this.setState({ deleteConfirm: null });
  });
}
```

**App handler:**
```javascript
handleLabelDelete = (labelId, callback) => {
  Api.deleteLabel(labelId)
    .then(() => {
      this.getLabels(); // Reload labels
      this.getRecipes(); // Reload recipes (tags updated)
      this.dismissAlert('deleteLabel');
      if (callback) callback();
    })
    .catch(error => {
      this.setAlert(error, 'deleteLabel');
    });
}
```

**Confirmation dialog component:**
- Simple modal overlay (can reuse/adapt existing patterns)
- Dark background overlay
- White centered box with message, Confirm (red), Cancel (gray) buttons

---

### Feature 6: Recipe Association Panel

**Component:** `LabelManager.js`

**Trigger:**
- Click on usage count number in label row
- Opens side panel showing recipes tagged with that label

**Panel layout:**
- Desktop: Slides in from right (or appears next to label list as side panel)
- Mobile: Replaces label list entirely, shows back button (←) to return to label list
- Header: "Recipes tagged with '{Label}'" and close button (×) (desktop) or back button (mobile)
- List of recipe titles
- Unlink icon (🔗) next to each recipe
- When clicked, icon changes to broken link (🔓) and title struck through
- Recipe remains in list until panel closes
- Clicking broken link re-links the recipe
- Recipe list scrolls independently from label list (desktop)

**State:**
```javascript
this.state = {
  recipePanelLabel: null, // Label ID
  pendingUnlinks: new Set(), // Recipe IDs marked for unlinking
}
```

**Handlers:**
```javascript
openRecipePanel = (labelId) => {
  this.setState({
    recipePanelLabel: labelId,
    pendingUnlinks: new Set(),
  });
}

closeRecipePanel = () => {
  this.setState({
    recipePanelLabel: null,
    pendingUnlinks: new Set(),
  });
}

toggleUnlink = (recipeId) => {
  const newPendingUnlinks = new Set(this.state.pendingUnlinks);
  if (newPendingUnlinks.has(recipeId)) {
    newPendingUnlinks.delete(recipeId);
  } else {
    newPendingUnlinks.add(recipeId);
  }
  this.setState({ pendingUnlinks: newPendingUnlinks });
}

handleUnlink = (recipeId, labelId) => {
  this.props.handleUnlinkRecipe(recipeId, labelId);
}

handleRelink = (recipeId, labelId) => {
  // Same as linking from recipe view
  this.props.handleLinkRecipe(recipeId, labelId);
}
```

**App handlers:**
```javascript
// handleLabelUnlink already exists in App.js for tag unlinking
// Rename to handleUnlinkRecipe for clarity and reuse

handleUnlinkRecipe = (recipeId, labelId) => {
  Api.unlinkLabel(recipeId, labelId)
    .then(() => {
      this.getRecipes(); // Reload to update Labels arrays
      this.dismissAlert('unlinkLabel');
    })
    .catch(error => {
      this.setAlert(error, 'unlinkLabel');
    });
}

handleLinkRecipe = (recipeId, labelId) => {
  Api.linkLabel(recipeId, labelId)
    .then(() => {
      this.getRecipes(); // Reload to update Labels arrays
      this.dismissAlert('linkLabel');
    })
    .catch(error => {
      this.setAlert(error, 'linkLabel');
    });
}
```

**Recipe list in panel:**
```javascript
getRecipesForLabel = (labelId) => {
  return this.props.allRecipes.filter(recipe =>
    recipe.Labels && recipe.Labels.some(l => l.ID === labelId)
  );
}
```

**Panel rendering:**
- Each recipe shows: Icon (🔗 or 🔓), Title (struck through if unlinked)
- Clicking icon calls `toggleUnlink` and `handleUnlink`/`handleRelink`
- Icons: 🔗 (linked), 🔓 (unlinked/broken link)

---

### Feature 7: Create New Label

**Component:** `LabelManager.js`

**Trigger:**
- "New Label" button at top of label manager (next to search)
- Opens inline form or expands row at top of list

**Form fields:**
- Label name (text input, required)
- Type (text input, optional)
- Icon (text input, optional, limited to single emoji/character)
  - Validate using `Intl.Segmenter` if available (rejects if > 1 grapheme)
  - No validation on older browsers (user responsible for single character)
- Submit button (✓), Cancel button (✗)

**State:**
```javascript
this.state = {
  showNewLabelForm: false,
  newLabel: { label: '', type: '', icon: '' },
}
```

**Handlers:**
```javascript
openNewLabelForm = () => {
  this.setState({
    showNewLabelForm: true,
    newLabel: { label: '', type: '', icon: '' },
  });
}

cancelNewLabel = () => {
  this.setState({
    showNewLabelForm: false,
    newLabel: { label: '', type: '', icon: '' },
  });
}

handleNewLabelChange = (field, value) => {
  this.setState({
    newLabel: { ...this.state.newLabel, [field]: value },
  });
}

submitNewLabel = () => {
  const { label, type, icon } = this.state.newLabel;

  if (!label.trim()) {
    this.props.setAlert('Label name is required', 'addLabel');
    return;
  }

  // Validate icon length (single grapheme/emoji only)
  const trimmedIcon = icon.trim();
  if (trimmedIcon && typeof Intl.Segmenter !== 'undefined') {
    // Use Intl.Segmenter for proper grapheme counting (handles complex emoji like 🇲🇽)
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(trimmedIcon));
    if (segments.length > 1) {
      this.props.setAlert('Icon must be a single character or emoji', 'addLabel');
      return;
    }
  }
  // If Intl.Segmenter not available (older browsers), skip validation

  this.props.handleLabelCreate(
    { label: label.trim(), type: type.trim(), icon: trimmedIcon },
    () => {
      this.cancelNewLabel();
    }
  );
}
```

**App handler:**
```javascript
handleLabelCreate = (labelData, callback) => {
  Api.createLabel(labelData)
    .then(() => {
      // API is idempotent - returns 200 even if label already exists
      // Always refresh labels to ensure UI is in sync with backend
      this.getLabels();
      this.dismissAlert('addLabel');
      if (callback) callback();
    })
    .catch(error => {
      this.setAlert(error, 'addLabel');
    });
}
```

---

### Feature 8: API Integration

**File:** `src/api.js`

**New methods:**
```javascript
// Update label
function updateLabel(labelId, updates) {
  return authenticatedRequest(`/admin/label/id/${labelId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// Delete label
function deleteLabel(labelId) {
  return authenticatedRequest(`/admin/label/id/${labelId}`, {
    method: 'DELETE',
  });
}

// Create label
function createLabel(labelData) {
  return authenticatedRequest('/admin/label/', {
    method: 'POST',
    body: JSON.stringify(labelData),
  });
}

// Note: linkLabel and unlinkLabel already exist
```

**Export additions:**
```javascript
export default {
  // existing...
  updateLabel,
  deleteLabel,
  createLabel,
};
```

---

## Files to Modify

1. **`src/LabelManager.js`** (new file):
   - Main component for label management interface
   - Search/filter, grouping, inline editing
   - Recipe panel, delete confirmation
   - New label form

2. **`src/LabelManager.css`** (new file):
   - Styles for label manager layout
   - Table/list styling
   - Inline edit inputs
   - Recipe panel
   - Delete confirmation dialog
   - Group headers and collapsible sections

3. **`src/App.js`**:
   - Add `showLabelManager` state
   - Add routing methods (`navigateToLabelManager`, `navigateFromLabelManager`)
   - Update `componentDidMount` to check for `/admin/labels` route
   - Update `handlePopState` to handle label manager routing
   - Add handlers: `handleLabelUpdate`, `handleLabelDelete`, `handleLabelCreate`
   - Rename `handleLabelUnlink` to `handleUnlinkRecipe` for clarity
   - Add `handleLinkRecipe` for re-linking
   - Conditional rendering: show LabelManager OR existing panes
   - Pass props to LabelManager component

4. **`src/LoginComponent.js`**:
   - Add "Manage Labels" button
   - Show only when `isAdmin` is true
   - Add `handleManageLabelsClick` prop

5. **`src/api.js`**:
   - Add `updateLabel(labelId, updates)` method
   - Add `deleteLabel(labelId)` method
   - Add `createLabel(labelData)` method
   - Export new methods

6. **`src/Util.js`**:
   - Add any new helper methods if needed (grouping logic can reuse existing)

7. **`src/index.js`**:
   - Import `LabelManager.css`

---

## Edge Cases

1. **Editing while recipe panel open**: Allow editing; panel should update if label name changes
2. **Deleting label with panel open**: Close panel first, then confirm delete
3. **Search filters out all labels**: Show "No labels found" message
4. **Empty label name on edit**: Show error, don't submit
5. **API error on update/delete/create**: Show error alert, don't close form/dialog
6. **Concurrent unlinking in panel**: Track pending unlinks in state, don't remove from view until panel closes
7. **User navigates away (back button) during edit**: Cancel edit, route appropriately
8. **Label with no Type field**: Appears in "Other" group
9. **Label with 0 usage**: Show "0" as clickable (panel shows empty list)
10. **Creating duplicate label name**: API should handle validation, show error
11. **URL routing collision**: `/admin/labels` should take precedence over recipe routing
12. **Non-admin user tries to access `/admin/labels` via URL**: Check `isAdmin` in routing logic, redirect to main view or show error

---

## Testing Checklist

**Feature 1 (View & Routing):**
- [ ] "Manage Labels" button visible for admin users
- [ ] Button hidden for non-admin users
- [ ] Clicking button navigates to `/admin/labels`
- [ ] URL updates in browser
- [ ] Back button returns to main view and clears URL
- [ ] Direct navigation to `/admin/labels` loads manager
- [ ] Browser back/forward buttons work correctly
- [ ] Non-admin cannot access via URL

**Feature 2 (Display & Grouping):**
- [ ] Labels grouped by Type
- [ ] Groups sorted correctly (Course first, Other last)
- [ ] Labels within groups sorted alphabetically
- [ ] Search filters by Label and Type
- [ ] Empty search shows "No labels found"
- [ ] Groups collapsible with indicators
- [ ] Default: Course expanded, others collapsed

**Feature 3 (Inline Editing):**
- [ ] Click Label/Type/Icon enters edit mode
- [ ] Input auto-focuses and selects text
- [ ] Enter submits edit
- [ ] Escape cancels edit
- [ ] Blur submits edit
- [ ] Empty Label name shows error
- [ ] Icon with multiple characters shows error (if Intl.Segmenter available)
- [ ] Icon with single emoji validates correctly
- [ ] Successful edit updates display
- [ ] API error shows alert
- [ ] Only one field editable at a time

**Feature 4 (Label Deletion):**
- [ ] Delete button visible for each label
- [ ] Clicking shows confirmation dialog
- [ ] Dialog shows label name and usage count
- [ ] Confirm deletes label
- [ ] Cancel closes dialog without deleting
- [ ] Successful delete updates label list
- [ ] Recipes reload to reflect unlinked tags
- [ ] API error shows alert

**Feature 5 (Recipe Panel):**
- [ ] Clicking usage count opens panel
- [ ] Panel shows correct recipes
- [ ] Close button (×) closes panel
- [ ] Unlink icon (🔗) toggles to broken (🔓)
- [ ] Title strikes through when unlinked
- [ ] Clicking broken link re-links recipe
- [ ] Panel persists unlink state until closed
- [ ] API success updates recipe data
- [ ] Empty label shows empty panel

**Feature 6 (Create Label):**
- [ ] "New Label" button opens form
- [ ] All fields editable (Label, Type, Icon)
- [ ] Empty Label name shows error
- [ ] Icon with multiple characters shows error (if Intl.Segmenter available)
- [ ] Icon with single emoji (e.g., 🇲🇽) validates correctly
- [ ] Submit creates label
- [ ] Cancel closes form without creating
- [ ] Successful create refreshes label list (handles API idempotency)
- [ ] Duplicate label name handled by API (no error, just refresh)
- [ ] API error shows alert
- [ ] Form clears after successful create

**Feature 7 (API Integration):**
- [ ] `updateLabel` sends PUT request with correct body
- [ ] `deleteLabel` sends DELETE request
- [ ] `createLabel` sends POST request with correct body
- [ ] All methods include auth token
- [ ] Error handling works for all methods

**Feature 8 (Mobile Layout):**
- [ ] Label list displays single-column on mobile
- [ ] Recipe panel replaces label list on mobile
- [ ] Back button (←) returns from recipe panel to label list
- [ ] Desktop shows side-by-side layout
- [ ] Recipe panel scrolls independently from label list (desktop)

---

## Dependencies

- No new dependencies required
- Uses existing:
  - `react` and `react-dom`
  - History API (already used for recipe routing)
  - Existing API layer patterns

---

## Questions Resolved

1. **Icon input validation**: Limit to single emoji/character. Add validation/truncation in form.

2. **Duplicate label names**: Rely on API validation. The API is idempotent for label creation (returns 200 if label already exists), so we must refresh the label list after creation to ensure UI is in sync with backend state.

3. **Recipe panel scroll behavior**: Recipe panel scrolls independently of label list. Label list and recipe panel have separate scroll containers.

4. **Delete confirmation styling**: Modal overlay for prominence on destructive action.

5. **Group collapse persistence**: Reset to defaults on each visit (all groups expanded). No session/URL persistence.

6. **Mobile layout**: Single-column layout. When recipe panel opens, it replaces the label list with a back button to return to label list.

7. **Unlink vs Delete in recipe panel**: Only support unlinking recipes from labels. No recipe deletion from this interface.

---

## Implementation Notes

**Completed:** 2026-03-19

### API Changes
- Added `updateLabel(labelId, updates, auth)` in `api.js`
  - Uses URLSearchParams for `application/x-www-form-urlencoded` format
  - Accepts object with `{ label, type, icon }` fields
  - No return value (uses `doAction` not `doFetch`)
- Added `deleteLabel(labelId, auth)` in `api.js`
  - Returns no value, API handles unlinking from recipes

### Component Structure
- **LabelManager** (`src/LabelManager.js`) - Main component (448 lines)
  - State: `collapsedGroups` (Set), `recipePanelRecipes` (snapshot), `editingLabel`, `deleteConfirm`, `newLabel` form
  - All groups expanded by default (inverse of original spec)
  - Recipe panel snapshots recipes when opened, tracks unlinks by comparing to current state
- **Styling** (`src/LabelManager.css`) - Complete styling for all features

### App Integration
- URL routing at `/admin/labels` with admin-only access
- Non-admin users redirected to main view
- Browser back/forward button support
- "Manage Labels" button in header (admin-only)
- Handlers: `handleLabelUpdate`, `handleLabelDelete`, `handleLabelCreate`, `handleUnlinkRecipe`, `handleLinkRecipe`
- Auto-dismiss error alerts on success

### Key Implementation Decisions
1. **Data format**: Changed from FormData to URLSearchParams to match API expectations
2. **Group expansion**: All groups expanded by default (tracked via `collapsedGroups` Set)
3. **Recipe panel persistence**: Snapshot recipes on open, compare to current state to show unlink status
4. **Icon for unlinked**: Uses ⛓️‍💥 (broken chain) instead of 🔓 (open lock)
5. **Refetch strategy**: After updates, refetch both labels and recipes from API to ensure consistency
6. **Empty type handling**: Labels with `Type: ""` grouped under "Other" (not as separate empty group)

### Bug Fixes During Development
1. **JSON parsing error**: Changed `updateLabel` from `doFetch` to `doAction` (API returns no body)
2. **Recipe panel empty**: Fixed click handler to call `openRecipePanel()` instead of setting state directly
3. **Duplicate "Other" groups**: Filter empty string types when creating named groups
4. **Content-Type mismatch**: Changed from multipart/form-data to urlencoded format

### Testing
- All existing tests passing (84 tests)
- API tests updated to verify urlencoded format
- Manual testing verified all CRUD operations work correctly
