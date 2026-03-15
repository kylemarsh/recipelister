# Recipe Action Buttons Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert recipe action controls from span elements to proper button elements with visual styling matching the sort button design language.

**Architecture:** Update RecipeActions component in Recipe.js to use semantic button elements with improved accessibility (aria-labels, keyboard navigation). Add CSS styling in Recipe.css that borrows visual patterns from sort buttons (box-shadow on hover, focus indicators, rounded corners) while maintaining action-specific color coding and compact header sizing.

**Tech Stack:** React 19, Jest, CSS

---

## Chunk 1: Component Structure and Tests

### Task 1: Test Button Element Structure

**Files:**
- Modify: `src/App.test.js` (add new test suite after line 778)

- [ ] **Step 1: Write failing test for button elements**

Add this test suite to `src/App.test.js`:

```javascript
describe('RecipeActions buttons', () => {
  const mockHandlers = {
    recipeHandlers: {
      EditClick: jest.fn(),
      UntargetClick: jest.fn(),
      DeleteClick: jest.fn()
    },
    noteHandlers: {},
    labelHandlers: {}
  };

  test('renders three button elements instead of spans', () => {
    const recipe = {
      ID: 1,
      Title: 'Test Recipe',
      New: false,
      ActiveTime: 10,
      Time: 30,
      Body: 'Test body',
      Labels: []
    };

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <Recipe
          loggedIn={true}
          recipes={[recipe]}
          availableLabels={[]}
          targetRecipeId={1}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          {...mockHandlers}
        />
      );
    });

    const buttons = div.querySelectorAll('.recipe-actions button');
    expect(buttons.length).toBe(3);

    // Verify no spans with role="img" remain
    const roleImgSpans = div.querySelectorAll('.recipe-actions span[role="img"]');
    expect(roleImgSpans.length).toBe(0);

    act(() => {
      root.unmount();
    });
  });

  test('buttons have correct CSS classes', () => {
    const recipe = {
      ID: 1,
      Title: 'Test Recipe',
      New: false,
      ActiveTime: 10,
      Time: 30,
      Body: 'Test body',
      Labels: []
    };

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <Recipe
          loggedIn={true}
          recipes={[recipe]}
          availableLabels={[]}
          targetRecipeId={1}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          {...mockHandlers}
        />
      );
    });

    const untargetBtn = div.querySelector('.recipe-untarget-trigger');
    expect(untargetBtn.tagName).toBe('BUTTON');
    expect(untargetBtn.classList.contains('recipe-action-button')).toBe(true);

    const editBtn = div.querySelector('.recipe-edit-trigger');
    expect(editBtn.tagName).toBe('BUTTON');
    expect(editBtn.classList.contains('recipe-action-button')).toBe(true);

    const deleteBtn = div.querySelector('.recipe-delete-trigger');
    expect(deleteBtn.tagName).toBe('BUTTON');
    expect(deleteBtn.classList.contains('recipe-action-button')).toBe(true);

    act(() => {
      root.unmount();
    });
  });

  test('buttons have descriptive aria-labels', () => {
    const recipe = {
      ID: 1,
      Title: 'Test Recipe',
      New: false,
      ActiveTime: 10,
      Time: 30,
      Body: 'Test body',
      Labels: []
    };

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <Recipe
          loggedIn={true}
          recipes={[recipe]}
          availableLabels={[]}
          targetRecipeId={1}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          {...mockHandlers}
        />
      );
    });

    const untargetBtn = div.querySelector('.recipe-untarget-trigger');
    expect(untargetBtn.getAttribute('aria-label')).toBe('Go back to recipe list');

    const editBtn = div.querySelector('.recipe-edit-trigger');
    expect(editBtn.getAttribute('aria-label')).toBe('Edit recipe');

    const deleteBtn = div.querySelector('.recipe-delete-trigger');
    expect(deleteBtn.getAttribute('aria-label')).toBe('Delete recipe');

    act(() => {
      root.unmount();
    });
  });

  test('buttons have updated icons', () => {
    const recipe = {
      ID: 1,
      Title: 'Test Recipe',
      New: false,
      ActiveTime: 10,
      Time: 30,
      Body: 'Test body',
      Labels: []
    };

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <Recipe
          loggedIn={true}
          recipes={[recipe]}
          availableLabels={[]}
          targetRecipeId={1}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          {...mockHandlers}
        />
      );
    });

    const untargetBtn = div.querySelector('.recipe-untarget-trigger');
    expect(untargetBtn.textContent).toBe('←');

    const editBtn = div.querySelector('.recipe-edit-trigger');
    expect(editBtn.textContent).toBe('✎');

    const deleteBtn = div.querySelector('.recipe-delete-trigger');
    expect(deleteBtn.textContent).toBe('🗑');

    act(() => {
      root.unmount();
    });
  });

  test('buttons trigger correct handlers', () => {
    const handlers = {
      EditClick: jest.fn(),
      UntargetClick: jest.fn(),
      DeleteClick: jest.fn()
    };

    const recipe = {
      ID: 1,
      Title: 'Test Recipe',
      New: false,
      ActiveTime: 10,
      Time: 30,
      Body: 'Test body',
      Labels: []
    };

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <Recipe
          loggedIn={true}
          recipes={[recipe]}
          availableLabels={[]}
          targetRecipeId={1}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          recipeHandlers={handlers}
          noteHandlers={{}}
          labelHandlers={{}}
        />
      );
    });

    const untargetBtn = div.querySelector('.recipe-untarget-trigger');
    const editBtn = div.querySelector('.recipe-edit-trigger');
    const deleteBtn = div.querySelector('.recipe-delete-trigger');

    act(() => {
      untargetBtn.click();
    });
    expect(handlers.UntargetClick).toHaveBeenCalledTimes(1);

    act(() => {
      editBtn.click();
    });
    expect(handlers.EditClick).toHaveBeenCalledTimes(1);

    act(() => {
      deleteBtn.click();
    });
    expect(handlers.DeleteClick).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --testNamePattern="RecipeActions buttons" --verbose`

Expected: All tests FAIL because component still uses span elements, not buttons (tests also check for updated icons and aria-labels, but the primary failure is element type mismatch)

- [ ] **Step 3: Commit test file**

```bash
git add src/App.test.js
git commit -m "test: add tests for recipe action button conversion

Tests verify:
- Elements are buttons, not spans
- Buttons have correct CSS classes
- Buttons have descriptive aria-labels
- Icons are updated (← ✎ 🗑)
- Click handlers work correctly

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 2: Convert Spans to Buttons

**Files:**
- Modify: `src/Recipe.js:106-135`

- [ ] **Step 1: Update RecipeActions component**

Replace the RecipeActions component (lines 106-135) with:

```javascript
const RecipeActions = (props) => {
  return (
    <div className="recipe-actions">
      <button
        className="recipe-action-button recipe-untarget-trigger"
        onClick={props.UntargetClick}
        aria-label="Go back to recipe list"
      >
        ←
      </button>
      <button
        className="recipe-action-button recipe-edit-trigger"
        onClick={props.EditClick}
        aria-label="Edit recipe"
      >
        &#9998;
      </button>
      <button
        className="recipe-action-button recipe-delete-trigger"
        onClick={props.DeleteClick}
        aria-label="Delete recipe"
      >
        🗑
      </button>
    </div>
  );
};
```

- [ ] **Step 2: Run new tests to verify they pass**

Run: `npm test -- --testNamePattern="RecipeActions buttons" --verbose`

Expected: All 5 tests PASS

- [ ] **Step 3: Run full test suite to verify no regressions**

Run: `npm test`

Expected: All tests PASS (including existing Recipe component tests)

- [ ] **Step 4: Commit component changes**

```bash
git add src/Recipe.js
git commit -m "feat: convert recipe action spans to button elements

Changes:
- Replace span elements with button elements
- Add .recipe-action-button base class
- Update aria-labels to describe actions, not icons
- Update icons: ← (back), keep ✎ (edit), 🗑 (delete)
- Remove obsolete role='img' attribute

Improves accessibility through semantic HTML and keyboard
navigation.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Chunk 2: Styling

### Task 3: Add Button Styling

**Files:**
- Modify: `src/Recipe.css:13-31`

- [ ] **Step 1: Add .recipe-action-button base class**

Add after line 11 in `src/Recipe.css`:

```css
/* Recipe action button base styling */
.recipe-action-button {
  padding: 0.4rem 0.8rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: bold;
  margin-inline: 0.3rem;
}

.recipe-action-button:hover {
  box-shadow: inset 0 0 0 2px currentColor;
  background-color: rgba(0, 0, 0, 0.05);
}

.recipe-action-button:focus {
  outline: 2px solid #4a90e2;
  outline-offset: 2px;
}

.recipe-action-button:active {
  transform: translateY(1px);
}
```

- [ ] **Step 2: Update .recipe-actions container**

Current content (lines 13-21):
```css
.recipe-actions {
	position: relative;
	top: -1rem;
}
.recipe-actions > span {
	cursor: pointer;
	font-weight: bold;
	margin-inline: 0.3rem;
}
```

Replace with:
```css
.recipe-actions {
  position: relative;
  top: -1rem;
}
```

Note: Removing `.recipe-actions > span` selector because buttons now get their margin-inline, cursor, and font-weight from the .recipe-action-button base class added in Step 1.

- [ ] **Step 3: Verify color-specific classes**

Verify these color-specific classes remain unchanged in Recipe.css (they use class selectors, not element selectors, so they apply to both spans and buttons):

```css
.recipe-untarget-trigger {
  color: navy;
}
.recipe-edit-trigger {
  color: goldenrod;
}
.recipe-delete-trigger {
  color: maroon;
}
```

These classes use class selectors (not element selectors), so they apply equally to spans or buttons. No changes needed.

- [ ] **Step 4: Manual visual verification**

Start dev server and verify:

Run: `npm start`

In browser:
1. Navigate to a recipe
2. Verify buttons appear with rounded corners (4px border-radius)
3. Hover back button (←) - should see 2px navy box-shadow inset and light gray background
4. Hover edit button (✎) - should see 2px goldenrod box-shadow inset and light gray background
5. Hover delete button (🗑) - should see 2px maroon box-shadow inset and light gray background
6. Click each button to verify handlers still work (back returns to list, edit opens form, delete removes recipe)
7. Tab through buttons - should see blue focus outline (2px solid #4a90e2) with 2px offset
8. Verify default colors: navy (back), goldenrod (edit), maroon (delete)

- [ ] **Step 5: Commit CSS changes**

```bash
git add src/Recipe.css
git commit -m "style: add button styling for recipe actions

Adds .recipe-action-button base class with:
- Compact sizing (0.4rem padding, 1.1rem font)
- Rounded corners (4px border-radius)
- Transparent background with hover effects
- Box-shadow on hover using currentColor
- Focus indicators for accessibility
- Smooth transitions

Consolidates margin-inline, cursor, and font-weight from old
.recipe-actions > span selector into new base class.

Preserves color-coding (navy/goldenrod/maroon) for quick
action recognition. Visual language inspired by sort buttons
but scaled for recipe header context.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Chunk 3: Verification

### Task 4: Comprehensive Testing

**Files:**
- Test: All modified files

- [ ] **Step 1: Run full test suite**

Run: `npm test -- --coverage`

Expected: All tests PASS, no reduction in coverage

- [ ] **Step 2: Manual accessibility testing**

1. Start dev server: `npm start`
2. Open browser to recipe list
3. Select a recipe
4. Test keyboard navigation:
   - Press Tab repeatedly - should cycle through action buttons
   - Each button should show visible focus outline
   - Press Enter or Space on focused button - should trigger action
5. Test with screen reader (if available):
   - Action buttons should announce as "button"
   - aria-labels should be read: "Go back to recipe list", "Edit recipe", "Delete recipe"

- [ ] **Step 3: Visual regression check**

Compare with design spec requirements:
- ✓ Buttons have rounded corners (4px)
- ✓ Hover shows box-shadow in action color
- ✓ Hover shows subtle background (rgba(0,0,0,0.05))
- ✓ Focus shows blue outline (#4a90e2)
- ✓ Colors preserved (navy, goldenrod, maroon)
- ✓ Icons updated (←, ✎, 🗑)
- ✓ Layout remains compact

- [ ] **Step 4: Cross-browser check**

Test in at least 2 browsers:
- Verify emoji rendering (🗑 wastebasket)
- Verify button interactions
- Verify focus indicators

- [ ] **Step 5: Update CLAUDE.md RecipeActions documentation**

At line 249-250 in CLAUDE.md, replace:
```markdown
 - RecipeActions -- defined in `Recipe.js`; holds the buttons for
   editing/deleting a recipe and deselecting the recipe
```

With:
```markdown
 - RecipeActions -- defined in `Recipe.js`; renders three button controls:
   back (←, navy), edit (✎, goldenrod), delete (🗑, maroon). Uses semantic
   `<button>` elements with descriptive aria-labels and keyboard navigation
   support. Visual styling matches sort button design language.
```

- [ ] **Step 6: Commit documentation update**

```bash
git add CLAUDE.md
git commit -m "docs: expand RecipeActions documentation

Update RecipeActions description to reflect button implementation
details including icons, colors, and accessibility features.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Completion Checklist

- [ ] All tests pass
- [ ] Buttons render as `<button>` elements
- [ ] Buttons have correct classes and aria-labels
- [ ] Icons updated (←, ✎, 🗑)
- [ ] CSS styling applied (hover, focus, active states)
- [ ] Keyboard navigation works
- [ ] Visual appearance matches spec
- [ ] Documentation updated

## Notes

- Tests follow existing pattern in `src/App.test.js` using Jest and React Testing Library
- CSS borrows visual patterns from `.sort-buttons` in `QueryForm.css` but adapted for recipe header context
- Wastebasket emoji (🗑) may render as square on very old systems, but this is acceptable as the aria-label provides text alternative
- No changes needed to handler functions - onClick props work identically on buttons as they did on spans
