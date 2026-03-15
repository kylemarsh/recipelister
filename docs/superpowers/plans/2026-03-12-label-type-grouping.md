# Label Type-Based Grouping Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update grouping to filter by label type dynamically instead of hardcoded names

**Architecture:** Change groupBy state from boolean to string, update getGroupingLabels to filter by Type field, update components to pass labels array

**Tech Stack:** React 19, Jest/React Testing Library

---

## Chunk 1: State Management and Utility Updates

### Task 1: Update State Management in App.js

**Files:**
- Modify: `src/App.js:29` (groupBy initialization)
- Modify: `src/App.js:472-475` (handleGroupToggle method)

- [ ] **Step 1: Change groupBy initial value from boolean to string**

Find line 29 in the constructor:

```javascript
// Current
groupBy: true,

// Change to
groupBy: "course",
```

- [ ] **Step 2: Update handleGroupToggle method**

Find lines 472-475 and replace:

```javascript
// Current
handleGroupToggle = () => {
  const newfilters = { ...this.state.filters, groupBy: !this.state.filters.groupBy };
  this.setState({ filters: newfilters });
};

// Replace with
handleGroupToggle = () => {
  const newGroupBy = this.state.filters.groupBy === "" ? "course" : "";
  const newfilters = { ...this.state.filters, groupBy: newGroupBy };
  this.setState({ filters: newfilters });
};
```

- [ ] **Step 3: Verify compilation**

```bash
npm start
```

Expected: App compiles without errors (grouping still works as boolean checks "" as falsy)

- [ ] **Step 4: Commit state management changes**

```bash
git add src/App.js
git commit -m "Change groupBy from boolean to string

Toggles between 'course' and '' for dynamic type-based grouping.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Update getGroupingLabels Utility

**Files:**
- Modify: `src/Util.js` (getGroupingLabels function)

- [ ] **Step 1: Find getGroupingLabels function**

```bash
grep -n "function getGroupingLabels" src/Util.js
```

Expected: Shows line number where function is defined

- [ ] **Step 2: Replace getGroupingLabels implementation**

```javascript
// Current
function getGroupingLabels() {
  return ['Main', 'Dessert', 'Breakfast', 'Side', 'Appetizer', 'Drink'];
}

// Replace with
function getGroupingLabels(allLabels, groupBy) {
  if (!groupBy) return [];

  return allLabels
    .filter(label => label.Type === groupBy)
    .map(label => label.Label);
}
```

- [ ] **Step 3: Verify compilation**

```bash
npm start
```

Expected: App compiles (JavaScript doesn't enforce parameter counts) but will have runtime errors when grouping is enabled because getGroupingLabels receives undefined for labels/groupBy parameters

- [ ] **Step 4: Commit utility function update**

```bash
git add src/Util.js
git commit -m "Update getGroupingLabels to filter by Type field

Accepts allLabels and groupBy parameters, filters labels where
Type matches groupBy string.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Chunk 2: Component Updates

### Task 3: Update GroupedResultList Component

**Files:**
- Modify: `src/GroupedResultList.js`
- Modify: `src/App.js:90-99` (GroupedResultList props)

- [ ] **Step 1: Add labels prop to GroupedResultList**

Update App.js where GroupedResultList is rendered (around line 90):

```javascript
// Current
<GroupedResultList
  items={this.state.allRecipes}
  filters={this.state.filters}
  groupBy={this.state.filters.groupBy}
  sortBy={this.state.filters.sortBy}
  shuffleKeys={this.state.shuffleKeys}
  expandedGroups={this.state.expandedGroups}
  handleGroupToggle={this.handleGroupCollapse}
  handleClick={this.handleResultClick}
/>

// Add labels prop
<GroupedResultList
  items={this.state.allRecipes}
  labels={this.state.allLabels}
  filters={this.state.filters}
  groupBy={this.state.filters.groupBy}
  sortBy={this.state.filters.sortBy}
  shuffleKeys={this.state.shuffleKeys}
  expandedGroups={this.state.expandedGroups}
  handleGroupToggle={this.handleGroupCollapse}
  handleClick={this.handleResultClick}
/>
```

- [ ] **Step 2: Update getGroupingLabels call in GroupedResultList.js**

Find the line that calls `Util.getGroupingLabels()`:

```bash
grep -n "getGroupingLabels" src/GroupedResultList.js
```

Replace:

```javascript
// Current
const groupingLabels = Util.getGroupingLabels();

// Replace with
const groupingLabels = Util.getGroupingLabels(this.props.labels, this.props.groupBy);
```

- [ ] **Step 3: Verify compilation and runtime**

```bash
npm start
```

Expected: App compiles and runs. Grouping should still work with course labels.

- [ ] **Step 4: Test grouping toggle**

1. Load app in browser
2. Verify groups display (Main, Dessert, Breakfast, Side, Appetizer, Drink)
3. Click group button (📂) - should hide groups
4. Click again - should restore groups
5. Verify recipes appear in correct groups

Expected: Grouping works correctly, filtering by Type="course"

- [ ] **Step 5: Commit GroupedResultList updates**

```bash
git add src/GroupedResultList.js src/App.js
git commit -m "Pass labels to GroupedResultList for type filtering

GroupedResultList now receives labels prop and passes to
getGroupingLabels for dynamic type-based filtering.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Update QueryForm Component

**Files:**
- Modify: `src/QueryForm.js`

- [ ] **Step 1: Find group button active state check**

```bash
grep -n "groupBy" src/QueryForm.js
```

Expected: Shows where groupBy prop is used for button styling

- [ ] **Step 2: Read QueryForm to find exact pattern**

```bash
grep -A2 -B2 "groupBy" src/QueryForm.js
```

Review the output to find the exact condition used for button active state.

- [ ] **Step 3: Update button active state check**

Replace the groupBy check with string comparison:

```javascript
// If current code is:
className={this.props.groupBy ? "active" : ""}

// Replace with:
className={this.props.groupBy !== "" ? "active" : ""}

// Or if it's a separate variable:
const groupActive = this.props.groupBy !== "";
```

- [ ] **Step 4: Verify button visual state**

```bash
npm start
```

Test in browser:
1. Load app - group button should appear active (blue border)
2. Click button - should become inactive
3. Click again - should become active

Expected: Button visual state correctly reflects grouping on/off

- [ ] **Step 5: Commit QueryForm update**

```bash
git add src/QueryForm.js
git commit -m "Update group button active check for string groupBy

Check groupBy !== '' instead of boolean to determine active state.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Chunk 3: Testing and Documentation

### Task 5: Add Tests for Type-Based Grouping

**Files:**
- Modify: `src/App.test.js` (add tests at end)

- [ ] **Step 1: Add test for getGroupingLabels with type filtering**

Verify imports at top of file include Util:

```javascript
import * as Util from './Util';
```

Add test at end of file:

```javascript
describe('getGroupingLabels with type filtering', () => {
  test('filters labels by Type field', () => {
    const labels = [
      { ID: 1, Label: 'main', Type: 'course' },
      { ID: 2, Label: 'dessert', Type: 'course' },
      { ID: 3, Label: 'chicken', Type: 'protein' },
      { ID: 4, Label: 'mexican', Type: 'cuisine' },
    ];

    const courseLabels = Util.getGroupingLabels(labels, 'course');
    expect(courseLabels).toEqual(['main', 'dessert']);

    const proteinLabels = Util.getGroupingLabels(labels, 'protein');
    expect(proteinLabels).toEqual(['chicken']);
  });

  test('returns empty array when groupBy is empty string', () => {
    const labels = [
      { ID: 1, Label: 'main', Type: 'course' },
    ];

    const result = Util.getGroupingLabels(labels, '');
    expect(result).toEqual([]);
  });

  test('returns empty array when no labels match type', () => {
    const labels = [
      { ID: 1, Label: 'main', Type: 'course' },
    ];

    const result = Util.getGroupingLabels(labels, 'nonexistent');
    expect(result).toEqual([]);
  });

  test('handles labels without Type field', () => {
    const labels = [
      { ID: 1, Label: 'main', Type: 'course' },
      { ID: 2, Label: 'noType' }, // missing Type
    ];

    const result = Util.getGroupingLabels(labels, 'course');
    expect(result).toEqual(['main']);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 3: Commit tests**

```bash
git add src/App.test.js
git commit -m "Add tests for type-based label grouping

Tests verify getGroupingLabels filters by Type field correctly.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Manual Integration Testing

**Files:**
- None (manual testing only)

- [ ] **Step 1: Test with backend running**

Prerequisites:
- Backend must be running with labels that have Type field populated
- Frontend connects to backend API

Start app:
```bash
npm start
```

- [ ] **Step 2: Verify grouping displays course labels**

1. Load app in browser
2. Log in
3. Verify groups appear: Main, Dessert, Breakfast, Side, Appetizer, Drink
4. Verify group headers show correct recipe counts
5. Verify recipes appear in correct groups

Expected: All course-type labels appear as groups automatically

- [ ] **Step 3: Test adding new course label**

Via backend (or API tool):
1. Create new label with Type="course" (e.g., "brunch")
2. Tag some recipes with the new label
3. Refresh frontend

Expected: New "brunch" group appears automatically in recipe list

- [ ] **Step 4: Test grouping toggle**

1. Click group button (📂) - groups should disappear
2. All recipes should appear in single ungrouped list
3. Click button again - groups should reappear
4. Group expand/collapse state should be preserved

Expected: Toggle works correctly, state persists

- [ ] **Step 5: Document test results**

Record any issues found during manual testing.

Expected: No issues found, grouping works as designed

---

### Task 7: Update Documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Find and update grouping feature description**

```bash
grep -n "Group.*recipes by" CLAUDE.md
```

Expected: Shows line where Group button is documented

Update the Group button description:

```markdown
- 📂 (Group): Groups recipes by labels with type="course" (Main, Dessert,
  Breakfast, Side, Appetizer, Drink) with collapsible group headers showing
  recipe counts. Grouping is enabled by default with all groups collapsed
  except "Main". Recipes tagged with multiple course labels appear in each
  relevant group. Recipes without any course labels appear in an "Other"
  group. The selected sort mode applies within each group. Group
  expand/collapse state persists across filter changes.

  The grouping dynamically uses labels where Type="course" from the API, so
  new course labels automatically appear as groups without code changes.
```

- [ ] **Step 2: Update state documentation if exists**

Find any documentation of `groupBy` state and update:

```markdown
groupBy: "course" (string) - Type of labels to group by, or "" for no grouping
```

- [ ] **Step 3: Update Util.js description**

Find getGroupingLabels documentation and update:

```markdown
- `getGroupingLabels(allLabels, groupBy)`: Returns array of label names that
  match the specified type. Filters labels where Type === groupBy.
```

- [ ] **Step 4: Commit documentation**

```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md for type-based grouping

Documents dynamic grouping by label Type field.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Implementation Complete

All tasks completed. The label type-based grouping feature is fully implemented with:

- groupBy state changed from boolean to string
- getGroupingLabels filters by Type field dynamically
- Components updated to pass labels array
- Button active state uses string check
- Tests verify type-based filtering
- Documentation updated

**Next Steps:**
1. Verify backend has deployed with Type field populated
2. Test frontend against production API
3. Update TODO.md to mark feature complete
