# Specification: Default Grouped View with Collapsed Groups

## Overview
Changed the recipe list to display grouped by labels by default, with all groups collapsed except "Main". This provides better organization while keeping the most commonly accessed category visible.

## Changes

### State Management
**Previous Implementation:**
- State tracked `collapsedGroups` as an object mapping group labels to boolean values
- Groups were expanded by default (not present in `collapsedGroups`)
- Clicking a group header toggled its presence in `collapsedGroups`

**New Implementation:**
- State tracks `expandedGroups` as an object mapping group labels to boolean values
- Groups are collapsed by default (not present in `expandedGroups`)
- Only "Main" group is expanded on initial load: `expandedGroups: { Main: true }`
- Clicking a group header toggles its presence in `expandedGroups`

### Default Behavior
**Previous:**
- `groupBy` defaulted to `false` (ungrouped list view)
- User had to click the group button to enable grouping
- When enabled, all groups were expanded

**New:**
- `groupBy` defaults to `true` (grouped view)
- All groups are collapsed except "Main"
- User can toggle grouping off to see a single flat list

### Implementation Details

**App.js (line 32):**
```javascript
expandedGroups: { Main: true }
```

**App.js (line 29):**
```javascript
groupBy: true
```

**App.js (lines 475-479):**
```javascript
handleGroupCollapse = (groupLabel) => {
  const newExpandedGroups = { ...this.state.expandedGroups };
  newExpandedGroups[groupLabel] = !newExpandedGroups[groupLabel];
  this.setState({ expandedGroups: newExpandedGroups });
};
```

**GroupedResultList.js (line 39):**
```javascript
const isExpanded = props.expandedGroups[labelName] || false;
```

The logic inverts: a group is expanded only if it's explicitly set to `true` in `expandedGroups`, otherwise it defaults to collapsed (`false`).

### Prop Changes
- `App.js` passes `expandedGroups` instead of `collapsedGroups` to `GroupedResultList`
- Handler remains named `handleGroupCollapse` but now toggles expanded state
- `GroupedResultList` receives `expandedGroups` prop and checks for explicit `true` values

## Rationale

1. **Better default UX**: Most users want to browse recipes in the "Main" category, so having it expanded by default reduces clicks
2. **Less visual clutter**: Collapsed groups keep the interface clean while still showing category organization
3. **Clearer intent**: `expandedGroups` makes the code more self-documenting - you can see at a glance which groups are expanded
4. **Consistent with grouping**: If we're showing groups by default, having them intelligently organized (Main expanded, others collapsed) is more useful than showing everything

## User Impact

**Visible Changes:**
- Recipe list now displays grouped by default when the page loads
- Only "Main" group is expanded initially
- Users can click group headers to expand/collapse other categories
- Users can click the group button to toggle back to flat list view

**Behavioral Preservation:**
- Group expand/collapse state still persists across filter/search changes
- Selected sort mode still applies within each group
- Recipes tagged with multiple grouping labels still appear in each relevant group
- "Other" group still catches recipes without grouping labels
