# Clickable Tag Icons

## Summary
Make label icons in the recipe list clickable to add them to the advanced query "All" filter, providing a faster way to filter recipes by clicking visible labels rather than opening the multiselect dropdown.

## Current State (Before Implementation)
- Recipe list displays label icons after recipe titles for labels with an `Icon` field
- Icons show tooltips on hover but are not interactive (cursor: default)
- To filter by a label, user must:
  1. Check "Advanced" to expand options
  2. Click into the "All" multiselect dropdown
  3. Find and select the label from the list

## Desired Outcome
- Clicking a label icon in the recipe list adds that label to the "All" filter
- Advanced options automatically expand if collapsed
- Clicking an icon does not select the recipe (no event bubbling)
- Icons show pointer cursor to indicate clickability
- No duplicate labels are added if the label is already selected
- The multiselect widget reflects the selection

## Implementation Decisions

### Event Flow
- `handleIconClick` handler added to App.js
- Handler passed through: App → GroupedResultList → ResultList
- Icon spans get onClick handler that calls `props.handleIconClick(e, label)`
- `event.stopPropagation()` prevents recipe selection

### State Updates
- Check if label already exists in `filters.tagsAll` (by ID comparison)
- If not present: add label object to `tagsAll` array and set `showAdvancedOptions: true`
- If already present: just ensure `showAdvancedOptions: true` so user can see it
- Multiselect automatically reflects selection via controlled `value` prop

### Visual Feedback
- Change cursor from `default` to `pointer` in ResultList.css
- Advanced options expand immediately when icon is clicked

## Edge Cases Handled

1. **Duplicate prevention**: Check label.ID before adding to prevent duplicates
2. **Advanced options collapsed**: Automatically expand when icon clicked
3. **Advanced options already open**: Just add the label, don't toggle
4. **Label already selected**: Don't add duplicate, just ensure options are visible
5. **Event bubbling**: stopPropagation() prevents recipe from being selected
6. **Grouped and ungrouped views**: Handler passed to ResultList in both rendering paths

## Bug Fix: Advanced Options Checkbox
During implementation, discovered pre-existing bug where the "Advanced" checkbox was bound to `props.advancedQuery` (undefined) instead of `props.showAdvancedOptions`. This caused the checkbox to never show as checked even when the advanced panel was open.

**Fix**: Updated QueryForm.js line 19 from `checked={props.advancedQuery}` to `checked={props.showAdvancedOptions}`

## Testing Requirements
Tests should verify:
- Icon click adds label to tagsAll
- Icon click doesn't add duplicates (by ID)
- Icon click expands advanced options when collapsed
- Icon click doesn't interfere with recipe selection
- Advanced options checkbox reflects actual state
- Handler is passed correctly through component hierarchy

## Tests Implemented
Added 5 tests in App.test.js under "Clickable tag icons in ResultList":
1. **renders label icons for recipes with icon labels**: Verifies icons render correctly with proper title attributes
2. **clicking icon calls handleIconClick with correct label**: Verifies handler is called with the full label object
3. **clicking icon does not trigger recipe selection**: Verifies stopPropagation prevents recipe click handler from firing
4. **does not render icons for labels without Icon field**: Verifies conditional rendering works correctly
5. **handles recipes with no labels**: Verifies no errors when recipes have no Labels array

All tests pass (50/50 tests passing total).

## Files Modified
- `src/App.js`: Added handleIconClick handler and passed to GroupedResultList
- `src/GroupedResultList.js`: Passed handleIconClick to ResultList components
- `src/ResultList.js`: Added onClick handler to icon spans
- `src/ResultList.css`: Changed cursor from default to pointer
- `src/QueryForm.js`: Fixed checkbox binding bug (advancedQuery → showAdvancedOptions)
- `src/CLAUDE.md`: Documented clickable icon behavior in ResultList component section
- `src/App.test.js`: Added 5 tests for clickable icon functionality

## Implementation Notes
- Uses existing multiselect infrastructure (controlled component)
- No API changes required
- No database changes required
- Feature works with existing label data
