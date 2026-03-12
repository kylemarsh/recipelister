# Label Icons in Recipe List - Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display label icons after recipe titles in the recipe list with native tooltips

**Architecture:** Modify ResultList component to render label icons inline after titles using data from the server's Icon field. Use native browser tooltips via title attribute for hover/tap label name display.

**Tech Stack:** React 19, Jest/React Testing Library, CSS

---

## Chunk 1: Core Implementation

### Task 1: Add Tests for Label Icon Rendering

**Files:**
- Modify: `src/App.test.js:476` (append to end of file)

- [ ] **Step 1: Write test for recipe with label icons**

```javascript
describe('ResultList label icons', () => {
  const mockHandlers = {
    handleClick: jest.fn()
  };

  test('displays icons for labels that have Icon field', () => {
    const recipes = [
      {
        ID: 1,
        Title: 'Chicken Soup',
        Labels: [
          { ID: 1, Label: 'Chicken', Icon: '🐓' },
          { ID: 2, Label: 'SoupStew', Icon: '🍜' }
        ]
      }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          {...mockHandlers}
        />
      );
    });

    expect(div.textContent).toContain('Chicken Soup');
    expect(div.textContent).toContain('🐓');
    expect(div.textContent).toContain('🍜');

    const icons = div.querySelectorAll('.recipe-icon');
    expect(icons.length).toBe(2);
    expect(icons[0].getAttribute('title')).toBe('Chicken');
    expect(icons[1].getAttribute('title')).toBe('SoupStew');

    act(() => {
      root.unmount();
    });
  });

  test('skips labels without Icon field', () => {
    const recipes = [
      {
        ID: 1,
        Title: 'Test Recipe',
        Labels: [
          { ID: 1, Label: 'HasIcon', Icon: '🍕' },
          { ID: 2, Label: 'NoIcon', Icon: null },
          { ID: 3, Label: 'EmptyIcon', Icon: '' }
        ]
      }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          {...mockHandlers}
        />
      );
    });

    expect(div.textContent).toContain('🍕');
    const icons = div.querySelectorAll('.recipe-icon');
    expect(icons.length).toBe(1);
    expect(icons[0].textContent).toBe('🍕');

    act(() => {
      root.unmount();
    });
  });

  test('handles recipes without labels', () => {
    const recipes = [
      { ID: 1, Title: 'No Labels Recipe', Labels: [] },
      { ID: 2, Title: 'Undefined Labels Recipe' }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          {...mockHandlers}
        />
      );
    });

    expect(div.textContent).toContain('No Labels Recipe');
    expect(div.textContent).toContain('Undefined Labels Recipe');
    const icons = div.querySelectorAll('.recipe-icon');
    expect(icons.length).toBe(0);

    act(() => {
      root.unmount();
    });
  });

  test('displays icons after New indicator', () => {
    const recipes = [
      {
        ID: 1,
        Title: 'New Recipe',
        New: true,
        Labels: [
          { ID: 1, Label: 'Test', Icon: '🧪' }
        ]
      }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          {...mockHandlers}
        />
      );
    });

    expect(div.textContent).toContain('• New Recipe');
    expect(div.textContent).toContain('🧪');
    const icons = div.querySelectorAll('.recipe-icon');
    expect(icons.length).toBe(1);

    act(() => {
      root.unmount();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testNamePattern="ResultList label icons" --no-coverage`

Expected: FAIL - querySelectorAll('.recipe-icon') returns empty array, length assertions fail

- [ ] **Step 3: Commit failing tests**

```bash
git add src/App.test.js
git commit -m "test: add failing tests for label icons in recipe list

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 2: Implement Label Icon Rendering

**Files:**
- Modify: `src/ResultList.js:1-17`

- [ ] **Step 1: Update ResultList to render label icons**

Replace the entire file content with:

```javascript
import React from "react";
import * as Util from "./Util";

const ResultList = (props) => {
  const sortedItems = Util.sortRecipes(props.items, props.sortBy, props.shuffleKeys);
  const rows = sortedItems.map((item) => {
    return (
      <li key={item.ID} id={item.ID} onClick={props.handleClick}>
        {item.New && "• "}{item.Title}
        {item.Labels && item.Labels.map(label =>
          label.Icon ? (
            <span
              key={label.ID}
              className="recipe-icon"
              title={label.Label}
            >
              {label.Icon}
            </span>
          ) : null
        )}
      </li>
    );
  });
  return <ul className="result-list">{rows}</ul>;
};

export default ResultList;
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npm test -- --testNamePattern="ResultList label icons" --no-coverage`

Expected: PASS (all 4 tests pass)

- [ ] **Step 3: Run all tests to ensure no regressions**

Run: `npm test -- --watchAll=false --no-coverage`

Expected: All existing tests still pass

- [ ] **Step 4: Commit implementation**

```bash
git add src/ResultList.js
git commit -m "feat: display label icons after recipe titles

Renders icons from label.Icon field inline after recipe title with native
tooltips showing label name on hover/tap.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 3: Add CSS Styling for Icons

**Files:**
- Modify: `src/ResultList.css:1-8`

- [ ] **Step 1: Add recipe-icon styles**

Replace the entire file content with:

```css
.result-list {
  list-style-type: none;
}

.result-list > li {
  cursor: pointer;
}

.recipe-icon {
  margin-left: 0.25em;
  cursor: default;
  display: inline;
}
```

- [ ] **Step 2: Verify styling in browser**

Manual check:
1. Run: `npm start`
2. Navigate to localhost:3000
3. Log in
4. Look at recipe list
5. Verify icons appear with spacing after titles
6. Hover over icons to see label name tooltips
7. On mobile/touch device, tap icons to see tooltips

Expected: Icons visible, properly spaced, tooltips work

- [ ] **Step 3: Commit CSS changes**

```bash
git add src/ResultList.css
git commit -m "style: add spacing and cursor styles for label icons

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 4: Update Documentation

**Files:**
- Modify: `CLAUDE.md` (ResultList section)
- Modify: `TODO.md` (remove completed item)

- [ ] **Step 1: Update CLAUDE.md ResultList section**

Search for the heading `### ResultList Component` in CLAUDE.md and replace the entire section up to (but not including) the next `###` heading (or end of file) with:

```markdown
### ResultList Component
Defined in `ResultList.js`. This is a pure presentation component that sorts
and renders a list of recipes. It receives pre-filtered recipes as props,
applies the selected sort mode (via `Util.sortRecipes`), and renders them as
an unordered list.

Recipes with the `New` field set to true (untried recipes) are displayed with
a bullet point (•) before the title. After the title, label icons are displayed
for any labels that have an `Icon` field. The icons use native browser tooltips
(via the `title` attribute) to show the label name on hover (desktop) or tap
(mobile).

The list styling removes default CSS bullets (list-style-type: none) so the
bullet indicator is controlled explicitly in the component. It does not handle
filtering - that's done by GroupedResultList.
```

- [ ] **Step 2: Remove completed item from TODO.md**

Search for the heading `## Indicate Labels on Recipe List` in TODO.md and delete the entire section from that heading through all its content until the next `##` heading (or end of file)

- [ ] **Step 3: Commit documentation updates**

```bash
git add CLAUDE.md TODO.md
git commit -m "docs: update for label icons feature

Update ResultList documentation to reflect icon rendering and remove completed
TODO item.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Task 5: Final Verification

**Files:**
- N/A (manual testing only)

- [ ] **Step 1: Run full test suite**

Run: `npm test -- --watchAll=false --no-coverage`

Expected: All tests pass

- [ ] **Step 2: Manual browser testing**

Desktop testing - verify:
- Icons appear after recipe titles
- Icons appear for all labels with Icon field
- No icons for labels without Icon field
- Hover shows label name tooltip
- Icons appear after "•" for new recipes
- Icons wrap naturally on narrow windows

Mobile testing - verify (if available):
- Tap icon shows tooltip
- Layout works on mobile viewport
- Icons wrap appropriately

Expected: All behaviors work as specified

- [ ] **Step 3: Verify no console errors**

Check browser console and test output for warnings/errors.

Expected: No errors or warnings

---

## Implementation Notes

**Test Command:** `npm test` (uses react-scripts test with Jest)

**Development Server:** `npm start` (runs on http://localhost:3000)

**Testing Library:** Jest with React Testing Library (createRoot API, act wrapper)

**Edge Cases Handled:**
- Labels array undefined or empty
- Label.Icon is null, empty string, or undefined
- New recipes with icons (bullet + icons)
- Multiple icons per recipe

**Browser Compatibility:**
- Native tooltips work across all modern browsers
- Mobile tooltip behavior varies by OS (iOS, Android)
- Fallback gracefully if Icon field missing

**Future Enhancement Path:**
If native tooltips prove insufficient, the Icon field is already in place and only the rendering logic in ResultList.js would need updating to add custom tooltip component.
