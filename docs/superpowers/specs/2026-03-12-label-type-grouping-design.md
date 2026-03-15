# Label Type-Based Grouping (Frontend) Design

## Overview
Update the grouping feature to use label types instead of hardcoded label names. Recipes will be grouped by labels with `Type === "course"` by default, making the feature dynamic and automatically adapting when new course labels are added.

## Goals
- Change groupBy state from boolean to string
- Update grouping logic to filter labels by Type field
- Remove hardcoded label names from getGroupingLabels utility
- Maintain existing user experience (groups by course labels by default)
- Enable future extension to group by other label types

## Non-Goals
- UI for selecting different grouping types (future enhancement)
- Multiple simultaneous groupings
- Grouping by multiple label types at once
- Custom group ordering (uses label_id order from API)

## State Management Changes

### App.js Constructor

**Change groupBy from boolean to string:**

```javascript
// Current state initialization (line 29)
groupBy: true,

// New state initialization
groupBy: "course",
```

**Values:**
- `"course"` - Group by labels with Type === "course" (default)
- `""` - No grouping (ungrouped list view)
- Future: other type values like "cuisine", "dietary", etc.

### App.js Methods

**Update handleGroupToggle method (lines 472-475):**

```javascript
// Current implementation
handleGroupToggle = () => {
  const newfilters = { ...this.state.filters, groupBy: !this.state.filters.groupBy };
  this.setState({ filters: newfilters });
};

// New implementation
handleGroupToggle = () => {
  const newGroupBy = this.state.filters.groupBy === "" ? "course" : "";
  const newfilters = { ...this.state.filters, groupBy: newGroupBy };
  this.setState({ filters: newfilters });
};
```

**Behavior:**
- Toggles between `"course"` (grouped) and `""` (ungrouped)
- Default is `"course"` which groups by labels with `Type === "course"`
- Future enhancement: could cycle through multiple type options

## Utility Function Changes

### Util.js - getGroupingLabels

**Current implementation:**

```javascript
function getGroupingLabels() {
  return ['Main', 'Dessert', 'Breakfast', 'Side', 'Appetizer', 'Drink'];
}
```

**New implementation:**

```javascript
function getGroupingLabels(allLabels, groupBy) {
  if (!groupBy) return [];

  return allLabels
    .filter(label => label.Type === groupBy)
    .map(label => label.Label);
}
```

**Parameters:**
- `allLabels` - Full array of label objects from API (includes ID, Label, Icon, Type)
- `groupBy` - String specifying which type to group by (or empty string for no grouping)

**Return Value:**
- Empty array when `groupBy` is empty string or falsy (no grouping)
- Array of label names (strings) that match the specified type
- Labels returned in the order they appear in allLabels (typically by label_id)

**Behavior:**
- Case-sensitive match on Type field (types are lowercase in database)
- Filters labels where `label.Type === groupBy`
- Maps filtered labels to their names for display

**Benefits:**
- Removes all hardcoded label names
- Automatically adapts when new labels of the grouping type are added
- Extensible to group by any label type
- Type-based filtering is more maintainable than case-insensitive name matching

## Component Changes

### GroupedResultList Component

**Current Behavior:**
- Receives `groupBy` as boolean prop
- Calls `Util.getGroupingLabels()` with no parameters
- When `groupBy === false`, renders ungrouped list
- When `groupBy === true`, renders grouped view

**Updated Behavior:**
- Receives `groupBy` as string prop
- Passes `this.props.labels` and `this.props.groupBy` to `Util.getGroupingLabels(labels, groupBy)`
- When `groupBy === ""`, renders single ungrouped `ResultList`
- When `groupBy` has a value (e.g., "course"), renders grouped view using labels filtered by that type

**Implementation Change:**

```javascript
// Current
const groupingLabels = Util.getGroupingLabels();

// New
const groupingLabels = Util.getGroupingLabels(this.props.labels, this.props.groupBy);
```

**Props:**
- Add `labels` prop to receive full labels array from App state
- Change `groupBy` prop type from boolean to string

### QueryForm Component

**Current Button State:**
- Active when `this.props.groupBy === true`
- Visual styling shows blue border/background when active

**Updated Button State:**
- Active when `this.props.groupBy !== ""`
- Visual styling shows blue border/background when grouping enabled
- Button behavior unchanged (calls `handleGroupToggle` prop)

**Implementation Change:**

```javascript
// Current
const groupButtonActive = this.props.groupBy === true;

// New
const groupButtonActive = this.props.groupBy !== "";
```

## API Integration

### No API Changes Required

**Labels API Response:**
- `fetchLabels()` call remains unchanged
- Label objects returned include Type field automatically
- Existing code ignores unknown fields (backward compatible)

**Label Object Structure:**

```javascript
{
  ID: 14,
  Label: "mexican",
  Icon: "🇲🇽",
  Type: "cuisine"
}
```

**Data Flow:**
1. App fetches labels via `Api.fetchLabels()`
2. Labels stored in `this.state.allLabels`
3. Labels passed to GroupedResultList as `labels` prop
4. GroupedResultList passes to `Util.getGroupingLabels(labels, groupBy)`
5. Utility filters labels by Type field and returns names

## User Experience

### Default Behavior (Grouped by Course)
- App loads with `groupBy: "course"`
- Groups display: Main, Dessert, Breakfast, Side, Appetizer, Drink
- Same visual appearance as current implementation
- "Main" group expanded by default, others collapsed

### Toggle to Ungrouped
- User clicks group button (icon: 📂)
- groupBy changes to `""`
- All recipes shown in single unsorted list
- Button visual state changes (no blue border/background)

### Toggle Back to Grouped
- User clicks group button again
- groupBy changes to `"course"`
- Groups reappear with course labels
- "Main" group expanded, others collapsed

### Dynamic Label Support
- If new label with `Type === "course"` is added (e.g., "brunch")
- Label automatically appears as new group on next load
- No code changes needed
- Group ordering follows label_id from database

## Testing Strategy

### Unit Tests

**State management:**
- groupBy initializes to "course"
- handleGroupToggle toggles between "course" and ""
- Multiple toggles work correctly

**Utility functions:**
- getGroupingLabels returns empty array when groupBy is ""
- getGroupingLabels filters labels by Type field
- getGroupingLabels returns label names in order
- getGroupingLabels handles labels without Type field (empty string)

**Components:**
- GroupedResultList renders ungrouped when groupBy === ""
- GroupedResultList uses filtered labels for grouping
- GroupedResultList passes correct props to getGroupingLabels
- QueryForm button active state reflects groupBy !== ""

### Integration Tests

**Full workflow:**
1. Load app, verify groupBy starts as "course"
2. Verify groups display course labels
3. Click group button, verify groupBy changes to ""
4. Verify ungrouped list displays
5. Click group button, verify groupBy changes to "course"
6. Verify groups reappear

**Edge cases:**
- Labels with empty Type field don't appear in groups
- Labels with Type="course" all appear as groups
- Group collapse/expand state persists across toggle

### Manual Testing

**Backend integration:**
1. Add new label with type="course" in database
2. Refresh frontend
3. Verify new label appears as group automatically
4. Verify existing behavior unchanged

**Visual verification:**
- Group button styling correct in both states
- Groups display in expected order
- Group headers show correct label names
- Recipe counts accurate in group headers

## Implementation Notes

### Code Organization
- State management: `src/App.js`
- Utilities: `src/Util.js`
- Components: `src/GroupedResultList.js`, `src/QueryForm.js`

### Consistency Patterns
- State updates via spread operator and setState
- Filter state nested in `filters` object
- Component props passed down from App
- Utility functions in Util.js
- Class component pattern with arrow function methods

### Backward Compatibility
- Labels fetched from API include Type field
- Frontend gracefully handles labels without Type (empty string)
- Existing label objects work with new code
- No breaking changes to API contracts

## Future Considerations

### Out of Scope (Future Enhancements)

**Multiple grouping types:**
1. Change `handleGroupToggle` to cycle through types: "" -> "course" -> "cuisine" -> "dietary" -> ""
2. Update button UI to show current grouping type
3. Store available grouping types in state or derive from labels
4. No backend changes needed

**Type-based filtering:**
1. Add type filter to AdvancedQuery component
2. Update `applyFilters` in Util.js to filter by label types
3. Backend already returns Type field, no API changes needed

**Custom group ordering:**
1. Add ordering configuration in App state
2. Sort filtered labels before mapping to names
3. Persist ordering preference in localStorage

## Acceptance Criteria

- [ ] groupBy state changed from boolean to string
- [ ] groupBy initializes to "course"
- [ ] handleGroupToggle toggles between "course" and ""
- [ ] getGroupingLabels accepts allLabels and groupBy parameters
- [ ] getGroupingLabels filters by Type field
- [ ] getGroupingLabels returns empty array when groupBy is ""
- [ ] GroupedResultList receives labels prop
- [ ] GroupedResultList passes labels and groupBy to getGroupingLabels
- [ ] GroupedResultList uses dynamic label filtering
- [ ] QueryForm button state checks groupBy !== ""
- [ ] Grouping works with course labels (same behavior as before)
- [ ] New course labels automatically appear in groups
- [ ] Toggle button switches between grouped and ungrouped views
- [ ] No hardcoded label names remain in code
- [ ] Group expand/collapse state persists across toggle
