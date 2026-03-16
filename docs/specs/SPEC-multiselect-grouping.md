# Multiselect Label Grouping and Sorting

## Summary
Enhanced the advanced query interface to group and sort labels in the multiselect dropdowns by their Type field, improving label discoverability and organization.

## Changes

### UI Changes
- Label dropdowns (All, Any, None) now display labels grouped by Type
- Each group shows a header with the Type name (e.g., "Course", "Protein", "Cuisine")
- Labels within each group are sorted alphabetically
- Labels without a Type appear in an "Other" group at the end of the list
- Group order preserves the original order of Types as they appear in the data

### Component Changes

#### AdvancedQuery.js
- Added `groupBy="Type"` prop to all three Multiselect components
- Imports `Util.js` to access the new sorting helper
- Calls `Util.sortLabelsForMultiselect()` to prepare labels before rendering
- Passes sorted labels to all Multiselect components via the `data` prop

#### Util.js
- Added `sortLabelsForMultiselect(labels)` helper function
- Exports the new function for use in AdvancedQuery component

### Implementation Details

The `sortLabelsForMultiselect()` function:
1. Separates labels into two groups: those with a Type and those without
2. Groups labels with Type, preserving the original order of Type values
3. Sorts labels alphabetically (by Label field) within each Type group
4. Sorts labels without a Type alphabetically
5. Maps typeless labels to have `Type: "Other"` for display purposes
6. Returns all typed labels first, followed by "Other" labels at the end

### Benefits
- Easier to find labels when there are many in the system
- Visual organization by category (Course, Protein, etc.)
- Consistent alphabetical ordering within categories
- Clear handling of labels without a Type (grouped as "Other")

### Testing
Added comprehensive unit tests for `sortLabelsForMultiselect()` in `App.test.js`:
- Alphabetical sorting within each type group
- Preservation of original type group order
- Handling labels without Type (mapped to "Other", placed at end)
- Handling empty label lists
- Immutability (does not mutate original array)
- Preservation of other label fields (ID, Icon, etc.)

All 45 tests pass, including 9 new tests for the sorting function.

### Compatibility
- No API changes required
- No database schema changes required
- Backward compatible with existing label data
- Works with the existing react-widgets Multiselect component
