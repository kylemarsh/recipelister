# Spec: Cycling Group Button with Title-Cased Labels

**Status**: Implemented
**Date**: 2026-03-14
**Branch**: `stage`

## Overview
Enhanced the recipe grouping feature to cycle through all available label types instead of a simple on/off toggle. Additionally, all labels and label types are now displayed in title case for improved readability.

## Motivation
- The original grouping button only toggled between "no grouping" and "course" grouping
- Users wanted to group by other label types (e.g., Protein, Cuisine) without code changes
- Label names were displayed in lowercase as stored in the database, which looked unpolished
- The system should adapt to whatever label types exist in the data

## Features

### 1. Cycling Group Button
The group button (📂) now cycles through all available label types:
- Click progression starts at "Course" (default), cycles through all other available label types (determined dynamically from the data), and ends at no grouping before cycling back to "Course"
- The button displays the current grouping type when active (e.g., "📂 Course", "📂 Protein")
- Default grouping is "Course" with the "Main" group expanded on initial load
- Available types are determined dynamically from the API data

### 2. Title-Cased Label Display
All label names and types are formatted for display:
- Database storage: lowercase (e.g., "chicken", "gluten free", "course")
- Display format: title case (e.g., "Chicken", "Gluten Free", "Course")
- Whitespace normalization: multiple spaces/tabs replaced with single spaces
- Formatting applied when data is loaded from API, not during render

## Implementation Details

### New Helper Functions (Util.js)

**`getAvailableTypes(allLabels)`**
- Extracts unique `Type` values from label list
- Filters out `undefined` and `null` values
- Returns array with "Course" first (when present) to maintain default grouping
- Location: `Util.js:101-115`

**`titleCase(str)`**
- Capitalizes first letter of each word (after whitespace)
- Normalizes all whitespace runs to single spaces
- Returns empty/null strings unchanged
- Location: `Util.js:117-124`

**`formatLabelsForDisplay(labels)`**
- Title-cases both `Label` and `Type` fields
- Preserves all other label properties (ID, Icon, etc.)
- Returns new array without mutating input
- Location: `Util.js:126-132`

### Modified Components

**App.js**
- Initial state: `groupBy: "Course"` (was `"course"`)
- `handleGroupToggle()`: Cycles through available types instead of binary toggle (lines 475-497)
- `getRecipes()`: Formats labels within each recipe (lines 531-544)
- `getLabels()`: Formats label list (lines 546-559)
- `handleLabelLinkSubmit()`: Formats newly created labels (line 237)

**QueryForm.js**
- Button displays grouping type when active: `📂{props.groupBy !== "" ? ` ${props.groupBy}` : ""}`
- Location: `QueryForm.js:64-71`

**QueryForm.css**
- Active button text color: `color: #333` for improved contrast
- Location: `QueryForm.css:38`

**GroupedResultList.js**
- No changes required; works with any groupBy value

### Tests
Added 10 new tests (total: 31 passing):
- `getAvailableTypes()`: 5 tests covering unique extraction, Course-first ordering, filtering
- `formatLabelsForDisplay()`: 5 tests covering Label/Type formatting, edge cases, whitespace normalization

## Architecture Decision: Formatting in Util vs API

The title-casing logic is implemented in `Util.js` rather than `api.js` for these reasons:

**Separation of Concerns**
- API layer handles data transport and HTTP communication
- Presentation logic belongs in the application/utility layer
- Clear boundary: API returns raw data, App formats for display

**Flexibility**
- Different clients (web, mobile, CLI) may have different formatting needs
- API remains client-agnostic and reusable
- Web-specific presentation concerns don't leak into shared API code

**Testability**
- API and formatting logic are independently testable
- Mocking/testing is simpler with separated concerns

**Data Normalization**
- Database stores normalized (lowercase) values for consistent querying
- UI layer transforms for presentation without affecting data integrity
- Clear distinction between storage format and display format

## Edge Cases Handled
- Labels without `Type` field: filtered out of grouping options
- Empty label lists: returns empty available types array
- Whitespace variations: "gluten  free" → "Gluten Free"
- Case variations: "MEXICAN" → "Mexican", "chicken" → "Chicken"
- Null/undefined Type values: filtered out
- Creating new labels: formatted before adding to state

## User Experience
- **Default behavior**: App loads with recipes grouped by Course, Main group expanded
- **Cycling**: Click 📂 repeatedly to cycle through available label types, ending at no grouping before returning to Course
- **Visual feedback**: Button shows active state (blue border/background) and displays type name
- **Persistence**: Group expand/collapse state persists across filter changes
- **Dynamic adaptation**: Available grouping types depend on what label types exist in your data

## Migration Notes
- No database migrations required
- Existing lowercase data works correctly
- No breaking changes to API
- Backward compatible with existing label data

## File Changes
```
Modified:
  src/App.js (lines 29, 237, 475-497, 531-544, 546-559)
  src/QueryForm.js (lines 64-71)
  src/QueryForm.css (line 38)
  src/Util.js (added lines 101-132, updated exports)
  src/App.test.js (updated existing tests, added 10 new tests)
  CLAUDE.md (documentation updates)

Added:
  specs/cycling-group-button.md (this file)
```

## Bundle Size Impact
- Production build: +111 bytes (gzipped)
- Negligible performance impact
