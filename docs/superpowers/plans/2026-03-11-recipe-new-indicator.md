# Recipe "New" Indicator Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visual indicators for untried recipes and allow marking them as cooked via edit form checkbox.

**Architecture:** Leverage existing `recipe.New` boolean field from backend. Add visual indicators in Recipe Pane title and ResultList items. Add checkbox to NewRecipeForm that inverts the boolean (checked = cooked = `New: false`). No new API calls or state management needed.

**Tech Stack:** React 19, existing component structure, CSS modifications

**Spec:** `docs/superpowers/specs/2026-03-11-recipe-new-indicator-design.md`

**Note on Line Numbers:** Line numbers in file references (e.g., `src/Recipe.js:16`) are approximate based on current file structure. If files have changed, locate the referenced code by context (e.g., "the h2 containing recipe.Title").

---

## Chunk 1: Core Implementation

### Task 1: Add "(New!)" Indicator to Recipe Title

**Files:**
- Modify: `src/Recipe.js:16`
- Test: `src/App.test.js`

- [ ] **Step 1: Write failing test for new recipe indicator**

Note: Using ReactDOM.render approach to match existing test framework (React Testing Library not installed).

Add to `src/App.test.js`:

```javascript
import { Recipe } from './Recipe';

describe('Recipe new indicator', () => {
  const mockHandlers = {
    recipeHandlers: { EditClick: jest.fn(), UntargetClick: jest.fn(), DeleteClick: jest.fn() },
    noteHandlers: {},
    labelHandlers: {}
  };

  test('displays "(New!)" for untried recipes', () => {
    const newRecipe = {
      ID: 1,
      Title: 'Test Recipe',
      New: true,
      ActiveTime: 10,
      Time: 30,
      Body: 'Test body',
      Labels: []
    };

    const div = document.createElement("div");
    ReactDOM.render(
      <Recipe
        loggedIn={true}
        recipes={[newRecipe]}
        availableLabels={[]}
        targetRecipeId={1}
        showTaggingForm={false}
        showNoteEditor={false}
        showAddNote={false}
        {...mockHandlers}
      />,
      div
    );

    expect(div.textContent).toContain('Test Recipe (New!)');
    ReactDOM.unmountComponentAtNode(div);
  });

  test('does not display "(New!)" for tried recipes', () => {
    const triedRecipe = {
      ID: 2,
      Title: 'Tried Recipe',
      New: false,
      ActiveTime: 10,
      Time: 30,
      Body: 'Test body',
      Labels: []
    };

    const div = document.createElement("div");
    ReactDOM.render(
      <Recipe
        loggedIn={true}
        recipes={[triedRecipe]}
        availableLabels={[]}
        targetRecipeId={2}
        showTaggingForm={false}
        showNoteEditor={false}
        showAddNote={false}
        {...mockHandlers}
      />,
      div
    );

    expect(div.textContent).toContain('Tried Recipe');
    expect(div.textContent).not.toContain('(New!)');
    ReactDOM.unmountComponentAtNode(div);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern=App.test.js --testNamePattern="Recipe new indicator"`

Expected: FAIL - text not found in document

- [ ] **Step 3: Implement "(New!)" in Recipe title**

Modify `src/Recipe.js` line 15-16:

```javascript
// Before:
<h2>{recipe.Title}</h2>

// After:
<h2>{recipe.Title}{recipe.New ? " (New!)" : ""}</h2>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --testPathPattern=App.test.js --testNamePattern="Recipe new indicator"`

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/Recipe.js src/App.test.js
git commit -m "Add (New!) indicator to recipe title

Display '(New!)' text after recipe title when recipe.New is true.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Add Checkbox to NewRecipeForm

**Files:**
- Modify: `src/Recipe.js:77-78` (insert between totalTime and textarea)
- Test: `src/App.test.js`

- [ ] **Step 1: Write failing test for checkbox rendering**

Add to `src/App.test.js`:

```javascript
import { NewRecipeForm } from './Recipe';

describe('NewRecipeForm checkbox', () => {
  test('renders unchecked checkbox when creating new recipe', () => {
    const mockHandlers = {
      handleSubmit: jest.fn(),
      handleCancel: jest.fn()
    };

    const div = document.createElement("div");
    ReactDOM.render(
      <NewRecipeForm
        recipeId={undefined}
        recipes={[]}
        {...mockHandlers}
      />,
      div
    );

    const checkbox = div.querySelector('input[name="new"]');
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(false);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('renders checked checkbox when editing tried recipe', () => {
    const triedRecipe = {
      ID: 1,
      Title: 'Test',
      New: false,
      ActiveTime: 10,
      Time: 30,
      Body: 'Body'
    };

    const mockHandlers = {
      handleSubmit: jest.fn(),
      handleCancel: jest.fn()
    };

    const div = document.createElement("div");
    ReactDOM.render(
      <NewRecipeForm
        recipeId={1}
        recipes={[triedRecipe]}
        {...mockHandlers}
      />,
      div
    );

    const checkbox = div.querySelector('input[name="new"]');
    expect(checkbox.checked).toBe(true);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('renders unchecked checkbox when editing new recipe', () => {
    const newRecipe = {
      ID: 2,
      Title: 'Test',
      New: true,
      ActiveTime: 10,
      Time: 30,
      Body: 'Body'
    };

    const mockHandlers = {
      handleSubmit: jest.fn(),
      handleCancel: jest.fn()
    };

    const div = document.createElement("div");
    ReactDOM.render(
      <NewRecipeForm
        recipeId={2}
        recipes={[newRecipe]}
        {...mockHandlers}
      />,
      div
    );

    const checkbox = div.querySelector('input[name="new"]');
    expect(checkbox.checked).toBe(false);
    ReactDOM.unmountComponentAtNode(div);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern=App.test.js --testNamePattern="NewRecipeForm checkbox"`

Expected: FAIL - querySelector returns null (checkbox doesn't exist yet)

- [ ] **Step 3: Add checkbox input to NewRecipeForm**

Modify `src/Recipe.js` after line 77 (after totalTime input, before textarea):

```javascript
// After the totalTime input (line 77), add:
<label>
  <input
    name="new"
    type="checkbox"
    defaultChecked={recipe.New === false}
  />
  This recipe has been cooked
</label>
```

Complete context (lines 72-86 after modification):

```javascript
<input
  name="totalTime"
  type="text"
  placeholder="Total time"
  defaultValue={recipe.Time}
/>
<label>
  <input
    name="new"
    type="checkbox"
    defaultChecked={recipe.New === false}
  />
  This recipe has been cooked
</label>
<textarea
  name="body"
  placeholder="Type Recipe Here..."
  defaultValue={recipe.Body}
/>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --testPathPattern=App.test.js --testNamePattern="NewRecipeForm checkbox"`

Expected: PASS (3 tests)

Note: Per design spec, backend API correctly handles HTML checkbox FormData:
- Checked: FormData includes `new: "on"` → backend sets `New: false`
- Unchecked: FormData omits field → backend defaults to `New: true`

- [ ] **Step 5: Add clarifying comment for inverted checkbox logic**

Add comment to `src/Recipe.js` at the checkbox location to explain inverted logic:

```javascript
{/* Inverted: checked = "has been cooked" = New: false */}
<label>
  <input
    name="new"
    type="checkbox"
    defaultChecked={recipe.New === false}
  />
  This recipe has been cooked
</label>
```

- [ ] **Step 6: Run tests to verify checkbox works**

Run: `npm test -- --testPathPattern=App.test.js --testNamePattern="NewRecipeForm checkbox"`

Expected: PASS (3 tests)

- [ ] **Step 7: Commit**

```bash
git add src/Recipe.js src/App.test.js
git commit -m "Add 'has been cooked' checkbox to recipe form

Add checkbox to NewRecipeForm that allows marking recipes as cooked.
Checkbox is checked when recipe.New is false (inverted logic).
Includes clarifying comment explaining the inversion.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Add Bullet Indicator to Recipe List

**Files:**
- Modify: `src/ResultList.js:8-10`
- Test: `src/App.test.js`

- [ ] **Step 1: Write failing test for bullet indicator**

Add to `src/App.test.js`:

```javascript
import ResultList from './ResultList';

describe('ResultList new indicator', () => {
  const mockHandlers = {
    handleClick: jest.fn()
  };

  test('displays bullet point for new recipes', () => {
    const recipes = [
      { ID: 1, Title: 'New Recipe', New: true },
      { ID: 2, Title: 'Old Recipe', New: false }
    ];

    const div = document.createElement("div");
    ReactDOM.render(
      <ResultList
        items={recipes}
        sortBy="alphabetic"
        shuffleKeys={{}}
        {...mockHandlers}
      />,
      div
    );

    expect(div.textContent).toContain('• New Recipe');
    expect(div.textContent).toContain('Old Recipe');
    expect(div.textContent).not.toContain('• Old Recipe');
    ReactDOM.unmountComponentAtNode(div);
  });

  test('does not display bullet when New is undefined', () => {
    const recipes = [
      { ID: 3, Title: 'Recipe Without Field' }
    ];

    const div = document.createElement("div");
    ReactDOM.render(
      <ResultList
        items={recipes}
        sortBy="alphabetic"
        shuffleKeys={{}}
        {...mockHandlers}
      />,
      div
    );

    expect(div.textContent).toContain('Recipe Without Field');
    expect(div.textContent).not.toContain('•');
    ReactDOM.unmountComponentAtNode(div);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern=App.test.js --testNamePattern="ResultList new indicator"`

Expected: FAIL - textContent doesn't contain "• New Recipe"

- [ ] **Step 3: Add bullet point indicator to list items**

Modify `src/ResultList.js` lines 8-9:

```javascript
// Before:
<li key={item.ID} id={item.ID} onClick={props.handleClick}>
  {item.Title}
</li>

// After:
<li key={item.ID} id={item.ID} onClick={props.handleClick}>
  {item.New && "• "}{item.Title}
</li>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --testPathPattern=App.test.js --testNamePattern="ResultList new indicator"`

Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/ResultList.js src/App.test.js
git commit -m "Add bullet point indicator for new recipes in list

Display '• ' before recipe title when recipe.New is true.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Remove Default List Bullets

**Files:**
- Modify: `src/ResultList.css`

- [ ] **Step 1: Check current CSS styling**

Run: `cat src/ResultList.css`

Expected output: Current file contains `.result-list > li { cursor: pointer; }`

Verify: No `.result-list` selector exists (only `.result-list > li`), so we'll add a new rule.

- [ ] **Step 2: Add list-style-type: none to ResultList**

Add new rule to `src/ResultList.css` (file currently only contains `.result-list > li`):

```css
.result-list {
  list-style-type: none;
}
```

This creates a new selector for the list itself, separate from the existing child selector.

- [ ] **Step 3: Visual verification in browser**

Run: `npm start`

Actions:
1. Navigate to http://localhost:3000
2. Log in
3. Create or edit a recipe, leave "This recipe has been cooked" unchecked
4. Save recipe
5. Verify in list: only one bullet point appears (manual •, not CSS)
6. Verify no double bullets

Expected: Single bullet point for new recipes, no CSS bullets

- [ ] **Step 4: Check for layout issues**

Verify:
- List alignment looks correct
- No unexpected spacing changes
- Mobile responsive layout still works
- Grouped lists display correctly

If padding/margin adjustments needed, add to `.result-list` in same commit.

- [ ] **Step 5: Commit**

```bash
git add src/ResultList.css
git commit -m "Remove default list bullets from recipe list

Set list-style-type: none to prevent double bullets when
displaying manual '• ' indicator for new recipes.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Chunk 2: Integration & Documentation

### Task 5: Integration Testing

**Files:**
- Test: Manual testing with running application

- [ ] **Step 1: Start development server**

Run: `npm start`

Expected: Server starts on http://localhost:3000

- [ ] **Step 2: Test creating new recipe**

Actions:
1. Log in
2. Click "New Recipe"
3. Fill in title, times, body
4. Leave "This recipe has been cooked" unchecked
5. Click "Add"

Expected:
- Recipe appears in list with "• " prefix
- Recipe title shows "(New!)" when selected

- [ ] **Step 3: Test marking recipe as cooked**

Actions:
1. Select the new recipe from step 2
2. Click edit (pencil icon)
3. Check "This recipe has been cooked"
4. Save

Expected:
- "• " prefix disappears from list
- "(New!)" disappears from title
- Recipe functions normally otherwise

- [ ] **Step 4: Test editing back to new**

Actions:
1. Edit the recipe from step 3
2. Uncheck "This recipe has been cooked"
3. Save

Expected:
- "• " prefix reappears in list
- "(New!)" reappears in title

- [ ] **Step 5: Test with existing recipes**

Actions:
1. Select several existing recipes
2. Verify they don't show "(New!)" or bullet (assuming `New: false` or undefined)
3. Edit one to mark as new (uncheck the checkbox)
4. Verify indicators appear

Expected: All existing recipes behave correctly

- [ ] **Step 6: Test unauthenticated view**

Actions:
1. Log out
2. View recipe list

Expected:
- Can see bullet points for new recipes (if any)
- Cannot edit recipes
- Checkbox not accessible

- [ ] **Step 7: Test grouped view**

Actions:
1. Log in
2. Enable grouping (📂 button)
3. Verify bullet indicators appear correctly in groups
4. Test with new recipes in different groups

Expected: Indicators work in both grouped and ungrouped views

- [ ] **Step 8: Document test results**

Create summary of integration testing:
- All scenarios pass ✓
- Any issues found and how they were addressed
- Browser/device tested

---

### Task 6: Update Documentation

**Files:**
- Modify: `docs/superpowers/specs/2026-03-11-recipe-new-indicator-design.md`
- Modify: `src/Recipe.js` (add comments if needed)

- [ ] **Step 1: Add implementation notes to spec**

Add section to end of spec document:

```markdown
## Implementation Notes

**Implemented:** [Current Date]

**Changes Made:**
- `src/Recipe.js:16` - Added conditional "(New!)" to recipe title
- `src/Recipe.js:77-84` - Added checkbox to NewRecipeForm
- `src/ResultList.js:9` - Added bullet point prefix for new recipes
- `src/ResultList.css` - Removed default list bullets

**Testing:**
- Added unit tests in `src/App.test.js` for all components
- Integration testing completed successfully
- Verified in grouped and ungrouped views
- Verified authenticated and unauthenticated views

**Known Issues:**
None

**Future Enhancements:**
- Consider adding keyboard shortcut to toggle "new" status
- Consider filter option to show only new recipes
```

- [ ] **Step 2: Commit documentation updates**

```bash
git add docs/superpowers/specs/2026-03-11-recipe-new-indicator-design.md
git commit -m "Document recipe new indicator implementation

Add implementation notes to spec document with file changes,
testing summary, and future enhancement ideas.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Update TODO.md

**Files:**
- Modify: `TODO.md:85-90`

- [ ] **Step 1: Mark feature as complete in TODO.md**

Remove or mark complete the "Indicate 'new' recipes" section:

```markdown
## ✓ Indicate "new" recipes and mark them as tried
~~The Recipe model has a "new" field intended to indicate that a recipe has
been added to the database but not yet tried. We should use this to visually
flag recipes in the List Pane and the Recipe Pane, and provide a button to
"mark as cooked" in the recipe pane (plus a new API call to send that update
to the database).~~

**Implemented:** 2026-03-11
- Visual indicators added to Recipe Pane title and ResultList
- Checkbox added to edit form for marking recipes as cooked
- See: `docs/superpowers/specs/2026-03-11-recipe-new-indicator-design.md`
```

- [ ] **Step 2: Commit TODO update**

```bash
git add TODO.md
git commit -m "Mark 'new recipe indicator' feature as complete

Feature has been implemented and tested.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Final Verification

**Files:**
- All modified files

- [ ] **Step 1: Run full test suite**

Run: `npm test -- --coverage`

Expected: All tests pass, no new warnings

- [ ] **Step 2: Check for compilation errors**

Run: `npm run build`

Expected: Clean build with no errors

- [ ] **Step 3: Review all changes**

Run: `git diff main --stat`

Expected changes:
- `src/Recipe.js` (modified)
- `src/ResultList.js` (modified)
- `src/ResultList.css` (modified)
- `src/App.test.js` (modified)
- `TODO.md` (modified)
- `docs/superpowers/specs/2026-03-11-recipe-new-indicator-design.md` (modified)

- [ ] **Step 4: Review commit history**

Run: `git log --oneline main..HEAD`

Expected: 7 commits following conventional commit format

- [ ] **Step 5: Create summary of work**

Document:
- Feature implemented successfully
- All tests passing
- Ready for code review or merge
- No breaking changes
- Backwards compatible (existing recipes without New field work correctly)

---

## Success Criteria

✅ Recipe titles display "(New!)" when `recipe.New === true`
✅ Recipe list items show "• " prefix when `recipe.New === true`
✅ NewRecipeForm includes "This recipe has been cooked" checkbox
✅ Checkbox state correctly inverts recipe.New boolean
✅ Default CSS list bullets removed from ResultList
✅ All tests pass
✅ No compilation errors
✅ Feature works in grouped and ungrouped views
✅ Feature works for authenticated and unauthenticated users
✅ Documentation updated

---

## Rollback Plan

If issues are discovered:

1. Identify which commit introduced the issue
2. Revert specific commit: `git revert <commit-hash>`
3. Or revert entire feature: `git revert HEAD~7..HEAD`
4. Test that application works without the feature
5. Fix the issue and re-apply commits

No database migrations or API changes required, so rollback is safe and simple.
