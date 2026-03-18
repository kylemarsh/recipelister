# Spec: Tag Workflow Improvements

## Overview
Improve the recipe tagging experience by adding autocomplete, keyboard shortcuts, auto-focus, and better form state management.

## Current State
The tag form (`TagRecipeForm` in `Tags.js`) is a simple form with:
- Text input for label name
- Submit button (✓)
- Cancel button (✗)
- Handlers in `App.js`:
  - `handleLabelLinkClick`: Sets `showTaggingForm: true`
  - `handleLabelLinkCancel`: Sets `showTaggingForm: false`
  - `handleLabelLinkSubmit`: Submits label, closes form (sets `showTaggingForm: false`)
- App state: `showTaggingForm` (boolean)
- Form closes and resets on every submit/cancel

## Goals
1. Show available labels with autocomplete
2. Enable Tab key to submit and reopen for rapid tagging
3. Auto-focus input when form opens
4. Preserve input value when form closes (Esc/blur), clear on recipe change

## Implementation Plan

### Feature 1: Label List and Autocomplete

**Component:** `TagRecipeForm` in `Tags.js`

**Changes:**
- Replace plain `<input>` with `react-widgets` `Combobox` component
- Filter available labels to exclude those already tagged to recipe
- Group labels by Type (same as multiselect in `AdvancedQuery`)
- Sort alphabetically within groups using `Util.sortLabelsForMultiselect()`
- Labels without Type go to "Other" group at bottom
- When typing non-existent label, show "(new)" in italics after typed text
- Clicking a label in dropdown auto-submits the form

**Props needed:**
- `allLabels`: All labels in system (passed from App via TagList)
- `currentTags`: Labels already on this recipe (to filter out)
- `handleSubmit`: Existing submit handler

**Data flow:**
- TagList receives `allLabels={props.allLabels}` from Recipe
- Recipe receives `allLabels={this.props.allLabels}` from App
- TagRecipeForm receives filtered labels and submits to existing handler

**Combobox configuration:**
- `data`: Filtered labels grouped by Type
- `dataKey="ID"`
- `textField="Label"`
- `groupBy="Type"`
- `filter`: Allow typing new values not in list
- `onChange`: Submit handler
- `placeholder="label"`

**Visual indicator for new labels:**
- Use `renderListItem` prop to customize dropdown items
- Check if typed value matches existing label (case-insensitive)
- If no match, append " (new)" in italics

---

### Feature 2: Tab Key Submission

**Component:** `TagRecipeForm` in `Tags.js`

**Changes:**
- Add `onKeyDown` handler to input/Combobox
- On Tab key: `preventDefault()`, call submit handler, reopen form
- Only apply to input field, not buttons
- On submit error, form closes (existing behavior in App)

**Implementation:**
```javascript
handleKeyDown = (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    // Trigger submit
    // Form will close, then Feature 4 handles reopening
  }
}
```

**Note:** Feature 3 (auto-focus) ensures reopened form is ready for input.

---

### Feature 3: Auto-focus Tag Input

**Component:** `TagRecipeForm` in `Tags.js`

**Changes:**
- Convert to class component or use hooks (for ref access)
- Add ref to Combobox/input
- Focus input when component mounts
- Select all text if value is present (for Feature 4)

**Using hooks approach:**
```javascript
const TagRecipeForm = (props) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select all text
    }
  }, []);

  // ... rest of component
}
```

**Combobox ref:** Check `react-widgets` docs for proper ref handling.

**IMPLEMENTATION NOTE:** The preserved state feature (Feature 4) was simplified during implementation. Input values are now cleared when the form closes (Esc/blur/cancel) rather than preserved, to avoid UX inconsistency where preserved text didn't match the Combobox's filtered dropdown state. Tab submit (the primary rapid-tagging workflow) always cleared values, so this change only affects edge cases.

---

### Feature 4: Auto-reset Tag Form State (MODIFIED)

**State management:**
- Move from App state to TagRecipeForm local state
- Store: `visible` (boolean), `inputValue` (string)
- OR keep `showTaggingForm` in App, add `tagFormInputValue` to App state
- **Decision:** Use App state since:
  - Need to clear when recipe changes (App tracks `targetRecipe`)
  - TagList needs to know visibility for rendering
  - Consistent with existing pattern

**App state additions:**
```javascript
this.state = {
  // existing...
  showTaggingForm: false,
  tagFormInputValue: '', // NEW
}
```

**Behavior changes (AS IMPLEMENTED):**

| Action | Old Behavior | New Behavior |
|--------|-------------|--------------|
| Submit | Close + clear | Close + clear |
| Cancel button (✗) | Close + clear | Close + clear |
| Esc key | N/A | Close + clear |
| Blur | N/A | Close + clear |
| Recipe change | N/A | Close form (if open) |

**Handler updates (AS IMPLEMENTED):**

`handleLabelLinkClick`:
- Set `showTaggingForm: true` (unchanged)

`handleLabelLinkCancel`:
- Set `showTaggingForm: false`
- Clear `tagFormInputValue: ''`

`handleLabelLinkSubmit`:
- Set `showTaggingForm: false` (unchanged)
- Clear `tagFormInputValue: ''`
- Reset `tagFormTabSubmit: false`

**New handlers:**

`handleTagInputChange`:
- Update `tagFormInputValue` as user types

`handleTagFormClose` (merged blur and escape):
- Set `showTaggingForm: false`
- Clear `tagFormInputValue: ''`

`handleTagFormTabSubmit`:
- Set `tagFormTabSubmit: true`
- Accept callback to run after state updates

**componentDidUpdate (AS IMPLEMENTED):**
- Check if `targetRecipe` changed and form is open
- If changed: Close form and clear `tagFormInputValue: ''`

**TagRecipeForm props (AS IMPLEMENTED):**
- Add `value={props.inputValue}`
- Add `onChange={props.handleInputChange}`
- Add `onBlur={props.handleClose}` (merged handler)
- Add `onKeyDown` for Tab and Esc keys
- Add `handleTabSubmit` callback

**Tab submit implementation (AS IMPLEMENTED):**
- Uses `tagFormTabSubmit` state flag instead of custom event property
- `handleKeyDown` sets flag via `handleTabSubmit()` callback
- Simulates Enter keypress to accept highlighted dropdown item
- `handleSelect` checks flag to decide whether to reopen form
- Flag reset after submit completes (success or error)

## Files to Modify

1. `src/Tags.js`:
   - Convert `TagRecipeForm` to use hooks (for ref)
   - Replace input with Combobox
   - Add auto-focus logic
   - Add Tab key handler
   - Add Esc key handler
   - Add blur handler
   - Receive and display preserved input value

2. `src/App.js`:
   - Add `tagFormInputValue: ''` to state
   - Update `handleLabelLinkSubmit` for Tab submit detection
   - Add `handleTagInputChange` handler
   - Add `handleTagFormBlur` handler
   - Add `handleTagFormEscape` handler
   - Update `componentDidUpdate` to clear tag form on recipe change
   - Pass `allLabels` down to Recipe component
   - Pass handlers to TagList

3. `src/Recipe.js`:
   - Pass `allLabels` to TagList component

4. `src/Tags.css`:
   - Add styles for "(new)" indicator
   - Add styles for Combobox if needed

5. `src/Util.js`:
   - Already has `sortLabelsForMultiselect()` - verify it works for this use case

## Edge Cases

1. **Multiple labels with same name but different Types**: Case-insensitive comparison in submit handler handles this

2. **User types label then clicks submit button instead of Tab/Enter**: Standard submit, closes and clears

3. **User types label, clicks elsewhere (blur)**: Form closes, value clears (simplified from preserve)

4. **User starts typing, switches recipes**: Form closes, value clears

5. **Submit fails (API error)**: Form closes, value cleared, flag reset

6. **Empty Combobox submit**: Early return with flag reset (prevents submission)

7. **Tab with no highlighted item**: Fallback timer submits typed value after brief delay

8. **Tab with highlighted item**: Enter simulation triggers `handleSelect` which submits and reopens

## Testing Checklist

After each feature:

**Feature 1 (Autocomplete):**
- [ ] Dropdown shows all available labels grouped by Type
- [ ] Labels already on recipe are filtered out
- [ ] Typing filters the list
- [ ] Typing non-existent label shows "(new)"
- [ ] Clicking label from dropdown submits immediately
- [ ] New labels can still be created

**Feature 2 (Tab Submit):**
- [ ] Tab key submits from input field
- [ ] Form reopens after successful Tab submit
- [ ] Input is focused after reopening
- [ ] Tab from buttons does NOT trigger submit
- [ ] Error closes form without reopening

**Feature 3 (Auto-focus):**
- [ ] Input receives focus when form opens
- [ ] Text is selected if value is present
- [ ] Works after Tab submit

**Feature 4 (Form State - AS IMPLEMENTED):**
- [ ] Esc closes form and clears value
- [ ] Blur closes form and clears value
- [ ] Cancel button closes form and clears value
- [ ] Changing recipes closes form (if open) and clears value
- [ ] Submit clears value and resets Tab flag
- [ ] Empty submit doesn't create tag and resets Tab flag

## Dependencies

- `react-widgets`: Already installed (used for Multiselect)
- Check version supports Combobox with groupBy

## Questions Resolved

1. Library choice: `react-widgets` Combobox (already a dependency)
2. Filter tagged labels: Yes
3. Click behavior: Auto-submit
4. Grouping: Same as multiselect (by Type, alphabetically)
5. Tab from buttons: No, only input
6. Error behavior: Close form
7. Blur behavior: Close and clear (simplified from preserve due to UX inconsistency)
8. State location: App state
9. Cancel vs Esc: Same behavior (close + clear), merged into single handler
10. Submit behavior: Close + clear
11. Tab detection: State flag instead of custom event property (more reliable)
