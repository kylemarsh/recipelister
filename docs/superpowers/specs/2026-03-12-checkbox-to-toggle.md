# Recipe "New" Toggle - Checkbox to Visual Toggle Replacement

**Date:** 2026-03-12
**Feature:** Replace checkbox with visual toggle for recipe "tried" status

## Problem Statement

The current checkbox implementation has semantic confusion between the field name (`new`) and the label text ("This recipe has been cooked"). The checkbox is named "new" but labeled to indicate the recipe has been tried, causing an inversion that makes the form logic confusing.

**Current behavior:**
- Field name: `new`
- Label: "This recipe has been cooked"
- Checked → sends `new=on` → backend interprets as `New: false` (tried)
- Unchecked → omits field → backend defaults to `New: true` (new)

This semantic mismatch makes the code harder to understand and maintain.

## Solution Overview

Replace the checkbox with a visual sliding toggle switch that clearly communicates the recipe's tried/untried status with intuitive labels.

**New behavior:**
- Toggle ON: "I've tried it!" → omit `new` field → backend sets `New: false`
- Toggle OFF: "I haven't tried this yet" → send `new=1` → backend sets `New: true`

## Visual Design

### Toggle Appearance

**Track (pill shape):**
- Dimensions: 50px wide × 24px tall
- Border radius: 12px (fully rounded)
- Background colors:
  - OFF state: #ccc (gray)
  - ON state: #4CAF50 (green)
- Smooth transition: 0.3s

**Circle (slider):**
- Dimensions: 20px diameter
- Background: white
- Position: 2px padding from edges
- Box shadow: 0 2px 4px rgba(0,0,0,0.2)
- Transition: transform 0.3s
- OFF position: left (2px from left edge)
- ON position: right (translateX(26px))

**Text Labels:**
- Font size: 14px
- Position: Next to toggle (12px gap)
- OFF state: "I haven't tried this yet" (color: #666)
- ON state: "I've tried it!" (color: #4CAF50)
- Only one label visible at a time

### Interaction

- Click toggle track or label to flip state
- Smooth CSS transition when switching
- Cursor: pointer on hover
- Maintains checkbox accessibility (real checkbox hidden)

## Implementation

### Component Changes (Recipe.js)

**Current markup (lines 78-86):**
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

**New markup:**
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

**Key points:**
- Real checkbox remains but is visually hidden
- `defaultChecked` logic unchanged (checked when `recipe.New === false`)
- Label wraps visual toggle elements
- Both text labels included, CSS shows/hides based on state
- Component remains stateless

### CSS Implementation (Recipe.css)

**File location:** Create `src/Recipe.css` or add to existing file

**Hide the checkbox:**
```css
.toggle-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
```

**Container layout:**
```css
.toggle-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 0;
}
```

**Toggle track:**
```css
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
```

**Toggle circle:**
```css
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
  transform: translateX(26px);
}
```

**Text labels (conditional display):**
```css
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

### Form Logic Changes (App.js)

**Location:** `handleNewRecipeSubmit` function (lines 160-180)

**Current implementation:**
```javascript
handleNewRecipeSubmit = async (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const targetId = this.state.targetRecipe;
  // ... rest of logic
```

**New implementation:**
```javascript
handleNewRecipeSubmit = async (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

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

  const targetId = this.state.targetRecipe;
  // ... rest of existing logic remains unchanged
```

**Why this works:**
- HTML checkbox behavior: checked → includes field in FormData, unchecked → omits field
- Our inversion: if field present (checked), delete it; if absent (unchecked), add `new=1`
- Backend receives exactly what it expects:
  - No `new` field → `New: false` (tried)
  - `new=1` → `New: true` (new/untried)

### CSS Import

**Location:** `src/index.js` or `src/Recipe.js`

Ensure Recipe.css is imported:
```javascript
import './Recipe.css';
```

## Backend Expectations

**No changes required to backend API.**

The backend already expects:
- Field omitted or empty string → `New: false` (recipe has been tried)
- `new=1` → `New: true` (recipe is new/untried)

The frontend transformation in `handleNewRecipeSubmit` ensures these expectations are met.

## Testing

### Component Tests (App.test.js)

**Update existing checkbox tests** (lines 96-209):

1. Test toggle renders with correct structure:
```javascript
const toggleContainer = div.querySelector('.toggle-container');
expect(toggleContainer).toBeTruthy();

const track = div.querySelector('.toggle-track');
expect(track).toBeTruthy();

const circle = div.querySelector('.toggle-circle');
expect(circle).toBeTruthy();
```

2. Test text labels appear based on state:
```javascript
// When new recipe (unchecked)
expect(div.textContent).toContain("I haven't tried this yet");
expect(div.textContent).not.toContain("I've tried it!");

// When tried recipe (checked)
expect(div.textContent).toContain("I've tried it!");
expect(div.textContent).not.toContain("I haven't tried this yet");
```

3. Test checkbox state matches recipe.New:
```javascript
const checkbox = div.querySelector('.toggle-checkbox');
expect(checkbox.checked).toBe(recipe.New === false);
```

### Form Submission Tests (new tests)

Add tests to verify FormData transformation:

```javascript
describe('Toggle form submission', () => {
  test('checked toggle omits new field', () => {
    const formData = new FormData();
    formData.set('new', 'on');

    // Apply transformation logic
    if (formData.has('new')) {
      formData.delete('new');
    } else {
      formData.set('new', '1');
    }

    expect(formData.has('new')).toBe(false);
  });

  test('unchecked toggle sends new=1', () => {
    const formData = new FormData();
    // Field not present (unchecked)

    // Apply transformation logic
    if (formData.has('new')) {
      formData.delete('new');
    } else {
      formData.set('new', '1');
    }

    expect(formData.get('new')).toBe('1');
  });
});
```

### Integration Tests

**Existing integration tests should continue to pass** with selector updates:
- Update selectors from `input[name="new"]` to `.toggle-checkbox`
- Verify visual indicators still work correctly
- Verify recipe list and title indicators unchanged

### Manual Testing Checklist

- [ ] Toggle switches smoothly with CSS transition
- [ ] Clicking toggle track flips state
- [ ] Clicking label text flips state
- [ ] Creating new recipe: toggle defaults to OFF ("I haven't tried this yet")
- [ ] Editing tried recipe (New: false): toggle shows ON ("I've tried it!")
- [ ] Editing new recipe (New: true): toggle shows OFF ("I haven't tried this yet")
- [ ] Form submission sends correct value to backend
- [ ] After saving, recipe indicators update correctly (title, list bullet)
- [ ] Works on mobile responsive view
- [ ] Keyboard navigation works (tab to toggle, space to toggle)

## Accessibility

**Maintained from checkbox implementation:**
- Real checkbox remains (just hidden visually)
- Label properly associated with input via `htmlFor`
- Keyboard navigation works (tab to focus, space to toggle)
- Screen readers announce checkbox state

**Considerations:**
- ARIA labels could be added for clarity
- Consider `aria-label` on toggle to describe its purpose
- Visual state changes are supplemented by text label changes

## Documentation Updates

### CLAUDE.md

Update `NewRecipeForm Component` section (lines 227-243):

**Before:**
```
The form does not currently support adding labels to a recipe on creation, and
throws uninformative errors when the times are left blank or use an unexpected
format (10m instead of 10, for example).
```

**After:**
```
**Toggle Control:**
- Visual sliding toggle for marking recipes as tried/untried
- Toggle ON ("I've tried it!"): Recipe marked as tried (New: false)
- Toggle OFF ("I haven't tried this yet"): Recipe marked as new (New: true)
- Implemented as styled checkbox with value transformation in form submission

The form does not currently support adding labels to a recipe on creation, and
throws uninformative errors when the times are left blank or use an unexpected
format (10m instead of 10, for example).
```

## Implementation Notes

**No breaking changes:**
- Underlying form mechanism unchanged (still uses checkbox)
- Backend API unchanged
- Data model unchanged
- All existing tests remain valid with selector updates

**Stateless component:**
- NewRecipeForm remains stateless
- No React state management added
- Relies on native form behavior with CSS styling

**Value transformation:**
- All inversion logic centralized in `handleNewRecipeSubmit`
- Clear comments explain the transformation
- Easy to understand and maintain

**CSS organization:**
- Toggle styles isolated in Recipe.css
- No impact on other components
- Can be easily extracted to reusable component if needed later

## Rollback Plan

If issues are discovered:

1. Revert commit containing toggle changes
2. Previous checkbox implementation remains functional
3. No database or API changes, so rollback is safe
4. All tests will pass with previous implementation

## Success Criteria

- [ ] Toggle visually replaces checkbox
- [ ] Toggle shows correct state based on recipe.New
- [ ] Clicking toggle or label switches state
- [ ] Form submits correct value to backend
- [ ] Creating new recipe works (defaults to untried)
- [ ] Editing recipes works (shows current state)
- [ ] All existing tests pass with updated selectors
- [ ] Visual indicators (title, list bullet) still work correctly
- [ ] No console errors or warnings
- [ ] Smooth CSS transitions on state change
