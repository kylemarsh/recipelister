# Checkbox-to-Toggle Replacement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace checkbox with visual sliding toggle for recipe tried status, eliminating semantic confusion between field name and label

**Architecture:** CSS-styled checkbox approach - keep underlying `<input type="checkbox">` for accessibility and form behavior, style it to look like a sliding toggle, add FormData transformation in submit handler to match backend expectations (toggle ON = omit field, toggle OFF = send `new=1`)

**Tech Stack:** React 19, CSS3 (transitions, flexbox), native FormData API

---

## Chunk 1: Component and Styling

### File Structure

**Files to Modify:**
- `src/Recipe.js:78-86` - Replace checkbox markup with toggle structure
- `src/Recipe.css` - Create new file with toggle styles (or add to existing if file exists)
- `src/index.js` or `src/Recipe.js` - Import Recipe.css

**Files to Create:**
- None (may create `src/Recipe.css` if it doesn't exist)

**Architecture:**
- Toggle component: Checkbox hidden via CSS, visual toggle built with label + spans
- CSS handles all visual state (track color, circle position, text visibility)
- Component remains stateless - relies on `defaultChecked` prop
- No React state management added

---

### Task 1: Create Recipe.css with Toggle Styles

**Files:**
- Create: `src/Recipe.css` (or modify if exists)

- [ ] **Step 1: Check if Recipe.css exists**

Run: `ls -la src/Recipe.css`

Expected: File may or may not exist. If it exists, read it with `cat src/Recipe.css` to check for existing content before modifying.

- [ ] **Step 2: Create/modify Recipe.css with toggle styles**

If file doesn't exist, create it. If it exists, append these styles:

```css
/* Toggle container layout */
.toggle-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 0;
}

/* Hide the real checkbox */
.toggle-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* Toggle track (the pill) */
.toggle-track {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #ccc;
  border-radius: 12px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.toggle-checkbox:checked + .toggle-label .toggle-track {
  background-color: #4CAF50;
}

/* Toggle circle (the slider) */
.toggle-circle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-checkbox:checked + .toggle-label .toggle-circle {
  /* Slide right: track 50px - circle 20px - padding 2*2px = 26px */
  transform: translateX(26px);
}

/* Text labels (conditional display) */
.toggle-text-off,
.toggle-text-on {
  font-size: 14px;
}

.toggle-text-off {
  color: #666;
}

.toggle-text-on {
  color: #4CAF50;
  display: none;
}

.toggle-checkbox:checked + .toggle-label .toggle-text-off {
  display: none;
}

.toggle-checkbox:checked + .toggle-label .toggle-text-on {
  display: inline;
}
```

- [ ] **Step 3: Import Recipe.css**

Check if `src/Recipe.js` already imports Recipe.css. If not, add at the top:

```javascript
import "./Recipe.css";
```

Alternative: Check if `src/index.js` imports it. If neither imports it, add to Recipe.js.

- [ ] **Step 4: Verify CSS file**

Run: `cat src/Recipe.css | head -20`

Expected: See the toggle styles with proper formatting

- [ ] **Step 5: Commit**

```bash
git add src/Recipe.css src/Recipe.js
git commit -m "Add CSS styles for recipe tried toggle

Create toggle switch styles with sliding animation.
Replaces checkbox visual appearance while maintaining accessibility.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Update Recipe.js Toggle Markup

**Files:**
- Modify: `src/Recipe.js:78-86`

- [ ] **Step 1: Read current markup**

Run: `cat src/Recipe.js | sed -n '78,86p'`

Expected: See current checkbox markup (verify these are the correct lines - if the output doesn't match below, use grep to find the correct location):
```jsx
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

If lines 78-86 don't show this markup, find it with: `grep -n "This recipe has been cooked" src/Recipe.js`

- [ ] **Step 2: Replace checkbox with toggle markup**

Replace lines 78-86 in `src/Recipe.js` with:

```jsx
<div className="toggle-container">
  <input
    id="new-toggle"
    name="new"
    type="checkbox"
    className="toggle-checkbox"
    defaultChecked={recipe.New === false}
  />
  <label htmlFor="new-toggle" className="toggle-label">
    <span className="toggle-track">
      <span className="toggle-circle"></span>
    </span>
    <span className="toggle-text-off">I haven't tried this yet</span>
    <span className="toggle-text-on">I've tried it!</span>
  </label>
</div>
```

- [ ] **Step 3: Verify markup change**

Run: `cat src/Recipe.js | sed -n '78,93p'`

Expected: See the new toggle structure with toggle-container div, hidden checkbox, and visual elements

- [ ] **Step 4: Check for compilation errors**

Run: `npm run build`

Expected: Build succeeds (may have existing warnings, but no new errors)

- [ ] **Step 5: Commit**

```bash
git add src/Recipe.js
git commit -m "Replace checkbox with toggle markup in NewRecipeForm

Update markup to use toggle structure with visual elements.
Maintains checkbox semantics for accessibility and form behavior.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Chunk 2: Form Logic and Tests

### Task 3: Add FormData Transformation Logic

**Files:**
- Modify: `src/App.js:160-180`

- [ ] **Step 1: Read current handleNewRecipeSubmit**

Run: `cat src/App.js | sed -n '160,180p'`

Expected: See current implementation that creates FormData and passes to API

- [ ] **Step 2: Add FormData transformation logic**

Find the insertion point: `grep -n "const formData = new FormData" src/App.js`

After the line showing `const formData = new FormData(form);`, insert this transformation block (before the `const targetId` line):

```javascript
// Invert checkbox logic for backend expectations
// Checkbox checked (toggle ON, "tried") → omit field
// Checkbox unchecked (toggle OFF, "new") → send new=1
if (formData.has('new')) {
  // Checkbox is checked (user tried it), omit the field
  formData.delete('new');
} else {
  // Checkbox is unchecked (recipe is new), send new=1
  formData.set('new', '1');
}
```

- [ ] **Step 3: Verify the change**

Run: `grep -A 20 "handleNewRecipeSubmit" src/App.js | head -30`

Expected: See the FormData transformation logic added after `const formData = new FormData(form);` and before `const targetId`. The transformation should include the comment and if/else block for inverting checkbox logic.

- [ ] **Step 4: Verify Recipe.css is imported**

Check that Recipe.css import exists from Task 1:

Run: `grep -n "Recipe.css" src/Recipe.js src/index.js`

Expected: Should see import statement in one of these files

- [ ] **Step 5: Check for compilation errors**

Run: `npm run build`

Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/App.js
git commit -m "Add FormData transformation for toggle semantics

Transform toggle state to match backend expectations:
- Toggle ON (tried) → omit 'new' field
- Toggle OFF (new) → send new=1

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Update Existing Component Tests

**Files:**
- Modify: `src/App.test.js:96-209`

- [ ] **Step 1: Update checkbox tests to verify toggle structure**

Modify the "NewRecipeForm checkbox" test suite to check for toggle elements instead of just checkbox.

First, find the test location: `grep -n "renders unchecked checkbox when creating new recipe" src/App.test.js`

Update the first test (should be around line 102) to add toggle structure verification:

```javascript
test('renders unchecked checkbox when creating new recipe', () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  act(() => {
    root.render(
      <NewRecipeForm
        recipeId={undefined}
        recipes={[]}
        handleSubmit={jest.fn()}
        handleCancel={jest.fn()}
      />
    );
  });

  // Verify toggle structure exists
  const toggleContainer = div.querySelector('.toggle-container');
  expect(toggleContainer).toBeTruthy();

  const track = div.querySelector('.toggle-track');
  expect(track).toBeTruthy();

  const circle = div.querySelector('.toggle-circle');
  expect(circle).toBeTruthy();

  // Verify checkbox state
  const checkbox = div.querySelector('.toggle-checkbox');
  expect(checkbox).toBeTruthy();
  expect(checkbox.checked).toBe(false);

  // Verify text label
  expect(div.textContent).toContain("I haven't tried this yet");
  expect(div.textContent).not.toContain("I've tried it!");

  act(() => {
    root.unmount();
  });
});
```

- [ ] **Step 2: Update second test (tried recipe)**

Find the test location: `grep -n "renders checked checkbox when editing tried recipe" src/App.test.js`

Update this test to verify toggle shows ON state:

```javascript
test('renders checked checkbox when editing tried recipe', () => {
  const triedRecipe = {
    ID: 1,
    Title: 'Test',
    New: false,
    ActiveTime: 10,
    Time: 30,
    Body: 'Body'
  };

  const div = document.createElement("div");
  const root = createRoot(div);
  act(() => {
    root.render(
      <NewRecipeForm
        recipeId={1}
        recipes={[triedRecipe]}
        handleSubmit={jest.fn()}
        handleCancel={jest.fn()}
      />
    );
  });

  // Verify toggle structure
  const toggleContainer = div.querySelector('.toggle-container');
  expect(toggleContainer).toBeTruthy();

  // Verify checkbox state
  const checkbox = div.querySelector('.toggle-checkbox');
  expect(checkbox.checked).toBe(true);

  // Verify text label shows ON state
  expect(div.textContent).toContain("I've tried it!");
  expect(div.textContent).not.toContain("I haven't tried this yet");

  act(() => {
    root.unmount();
  });
});
```

- [ ] **Step 3: Update third test (editing new recipe)**

Find the test location: `grep -n "renders unchecked checkbox when editing new recipe" src/App.test.js`

Update this test to verify toggle OFF state and text label:

```javascript
test('renders unchecked checkbox when editing new recipe', () => {
  const newRecipe = {
    ID: 2,
    Title: 'Test',
    New: true,
    ActiveTime: 10,
    Time: 30,
    Body: 'Body'
  };

  const div = document.createElement("div");
  const root = createRoot(div);
  act(() => {
    root.render(
      <NewRecipeForm
        recipeId={2}
        recipes={[newRecipe]}
        handleSubmit={jest.fn()}
        handleCancel={jest.fn()}
      />
    );
  });

  // Verify checkbox state
  const checkbox = div.querySelector('.toggle-checkbox');
  expect(checkbox.checked).toBe(false);

  // Verify text label shows OFF state
  expect(div.textContent).toContain("I haven't tried this yet");

  act(() => {
    root.unmount();
  });
});
```

- [ ] **Step 4: Update fourth test (undefined field)**

Find the test location: `grep -n "renders unchecked checkbox when New field is undefined" src/App.test.js`

Update this test to verify OFF state for undefined field:

```javascript
test('renders unchecked checkbox when New field is undefined', () => {
  const recipeWithoutNewField = {
    ID: 3,
    Title: 'Old Recipe',
    ActiveTime: 10,
    Time: 30,
    Body: 'Body'
  };

  const div = document.createElement("div");
  const root = createRoot(div);
  act(() => {
    root.render(
      <NewRecipeForm
        recipeId={3}
        recipes={[recipeWithoutNewField]}
        handleSubmit={jest.fn()}
        handleCancel={jest.fn()}
      />
    );
  });

  // Verify checkbox state
  const checkbox = div.querySelector('.toggle-checkbox');
  expect(checkbox.checked).toBe(false);

  // Verify text label
  expect(div.textContent).toContain("I haven't tried this yet");

  act(() => {
    root.unmount();
  });
});
```

- [ ] **Step 5: Run updated tests**

Run: `npm test -- --testPathPattern=App.test.js --watchAll=false`

Expected: All tests pass, including the 4 updated NewRecipeForm tests

- [ ] **Step 6: Commit**

```bash
git add src/App.test.js
git commit -m "Update toggle component tests

Verify toggle structure, visual elements, and text labels.
All existing checkbox behavior tests still pass.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5: Add Form Submission Tests

**Files:**
- Modify: `src/App.test.js` (add new test suite after existing tests)

- [ ] **Step 1: Write form submission tests**

Find where to insert: `grep -n "describe.*NewRecipeForm checkbox" src/App.test.js`

Add new test suite after the closing `});` of the "NewRecipeForm checkbox" suite (should be around line 209):

```javascript
describe('Toggle form submission', () => {
  test('checked toggle omits new field from FormData', () => {
    // Simulate FormData with checked checkbox
    const formData = new FormData();
    formData.set('title', 'Test Recipe');
    formData.set('new', 'on');

    // Apply transformation logic
    if (formData.has('new')) {
      formData.delete('new');
    } else {
      formData.set('new', '1');
    }

    // Verify field is omitted
    expect(formData.has('new')).toBe(false);
    expect(formData.get('title')).toBe('Test Recipe');
  });

  test('unchecked toggle sends new=1 in FormData', () => {
    // Simulate FormData with unchecked checkbox
    const formData = new FormData();
    formData.set('title', 'Test Recipe');
    // 'new' field not present (unchecked)

    // Apply transformation logic
    if (formData.has('new')) {
      formData.delete('new');
    } else {
      formData.set('new', '1');
    }

    // Verify new=1 is added
    expect(formData.get('new')).toBe('1');
    expect(formData.get('title')).toBe('Test Recipe');
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=App.test.js --testNamePattern="Toggle form submission" --watchAll=false`

Expected: Both new tests pass (2/2)

- [ ] **Step 3: Run full test suite**

Run: `npm test -- --watchAll=false`

Expected: All tests pass. Total count should be 2 more than before Task 5 (adds 2 form submission tests)

- [ ] **Step 4: Commit**

```bash
git add src/App.test.js
git commit -m "Add form submission tests for toggle logic

Verify FormData transformation:
- Checked toggle omits 'new' field
- Unchecked toggle sends new=1

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Chunk 3: Documentation and Verification

### Task 6: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md:227-243`

- [ ] **Step 1: Read current NewRecipeForm documentation**

Run: `cat CLAUDE.md | sed -n '220,250p'`

Expected: See section describing NewRecipeForm component including checkbox information

- [ ] **Step 2: Update documentation to describe toggle**

Find the checkbox documentation: `grep -n "checkbox" CLAUDE.md`

In the NewRecipeForm section, locate the current checkbox documentation (should reference "This recipe has been cooked" checkbox with inverted logic). Replace that content with the toggle documentation below:

```markdown
**Toggle Control:**
- Visual sliding toggle for marking recipes as tried/untried
- Toggle ON ("I've tried it!"): Recipe marked as tried (New: false)
- Toggle OFF ("I haven't tried this yet"): Recipe marked as new (New: true)
- Implemented as styled checkbox with value transformation in form submission
- Maintains accessibility through hidden checkbox element
```

Keep any existing paragraph about form limitations (should mention not supporting labels on creation).

- [ ] **Step 3: Verify documentation update**

Run: `cat CLAUDE.md | sed -n '227,250p'`

Expected: See updated toggle documentation

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md for toggle control

Document toggle functionality in NewRecipeForm section.
Explains visual states and implementation approach.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Final Verification

**Files:**
- All modified files

- [ ] **Step 1: Run full test suite**

Run: `npm test -- --coverage --watchAll=false`

Expected: All tests pass, no new errors (should show 2 more tests than baseline due to Task 5)

- [ ] **Step 2: Check for compilation errors**

Run: `npm run build`

Expected: Clean build (may have pre-existing warnings from node_modules, but no new errors)

- [ ] **Step 3: Review all changes**

Run: `git diff main --stat`

Expected changes:
- `src/Recipe.js` (modified - toggle markup)
- `src/Recipe.css` (created or modified - toggle styles)
- `src/App.js` (modified - FormData transformation)
- `src/App.test.js` (modified - updated and new tests)
- `CLAUDE.md` (modified - documentation)

- [ ] **Step 4: Review commit history**

Run: `git log --oneline main..HEAD`

Expected: 6 commits (CSS styles, markup, form logic, component tests, submission tests, documentation)

- [ ] **Step 5: Verify implementation complete**

Confirm all of the following:
- Feature implemented successfully
- All tests passing
- Toggle replaces checkbox with clear visual semantics
- FormData transformation matches backend expectations
- No breaking changes
- Ready for manual testing in browser

This is a mental checklist - no document needed.

---

## Manual Testing Checklist

Once code is deployed to staging or dev environment, verify in browser:

- [ ] Toggle switches smoothly with CSS transition
- [ ] Clicking toggle track flips state
- [ ] Clicking label text flips state
- [ ] Creating new recipe: toggle defaults to OFF ("I haven't tried this yet")
- [ ] Editing tried recipe (New: false): toggle shows ON ("I've tried it!")
- [ ] Editing new recipe (New: true): toggle shows OFF ("I haven't tried this yet")
- [ ] Submitting form with toggle ON: recipe marked as tried, "(New!)" disappears from title, bullet disappears from list
- [ ] Submitting form with toggle OFF: recipe marked as new, "(New!)" appears in title, bullet appears in list
- [ ] Works on mobile responsive view
- [ ] Keyboard navigation works (tab to toggle, space to toggle)

---

## Success Criteria

- ✅ Toggle visually replaces checkbox
- ✅ Toggle shows correct state based on recipe.New
- ✅ Clicking toggle or label switches state
- ✅ Form submits correct value to backend
- ✅ Creating new recipe works (defaults to untried)
- ✅ Editing recipes works (shows current state)
- ✅ All tests pass (adds 2 new tests)
- ✅ Visual indicators (title, list bullet) still work correctly
- ✅ No console errors or warnings
- ✅ Smooth CSS transitions on state change
- ✅ Documentation updated

---

## Rollback Plan

If issues are discovered:

1. Identify which commit introduced the issue
2. Revert specific commit: `git revert <commit-hash>`
3. Or revert entire feature: `git revert HEAD~6..HEAD`
4. Test that application works with checkbox
5. Fix the issue and re-apply commits

No database migrations or API changes required, so rollback is safe and simple.
