# Spec: Responsive Pane Layout

**Status**: Implemented
**Date**: 2026-03-20
**Branch**: `responsive-pane-layout`

## Overview
Improve the desktop UI's two-pane layout to dynamically prioritize space based on user context: give more space to the recipe list when browsing, and more space to the recipe pane when reading a recipe.

## Motivation
Current desktop layout issues:
- Search pane has `min-width: 40%`, guaranteeing it takes at least 40% of horizontal space
- Recipe pane gets `flex: 1`, taking whatever space remains
- **Problem**: When viewing a recipe, the recipe pane is often squashed, making it hard to read ingredients and instructions
- Mobile already has good behavior (hides search pane when recipe is selected), but desktop doesn't leverage the `recipe-selected` class

**User Request** (TODO.md:9-16):
> "Currently there's no way to hide the query pane in desktop, and width priority is given to the query pane over the Recipe Pane leading to the recipe pane looking too 'squashed'. When there is no active recipe selected we should allow the query pane to take up most of the horizontal space (or even collapse the Recipe Pane altogether), but when a recipe is selected, priority should be given to the recipe pane, even if it means the Query Pane is narrower than ideal."

## Desired Outcome

### Browsing Mode (No Recipe Selected)
- **Search pane**: Takes majority of horizontal space (60-75%)
- **Recipe pane**: Minimal or collapsed (empty state)
- User can comfortably see more recipes in the list

### Reading Mode (Recipe Selected)
- **Recipe pane**: Takes majority of horizontal space (60-75%)
- **Search pane**: Narrower but still functional (25-40%)
- User can read recipe comfortably while still having access to the recipe list for navigation

### Mobile (Unchanged)
- Current behavior works well: search pane hidden when recipe selected
- No changes needed for mobile

## Current State

### App.js
Lines 65-67 set `searchClass` based on whether a recipe is selected:
```javascript
const searchClass = this.state.targetRecipe
  ? "search-pane recipe-selected"
  : "search-pane";
```

This class is applied to the search pane div (line 111).

### App.css

**Desktop** (lines 24-66):
```css
.content-container {
  display: flex;
  height: calc(100vh - 200px);
  overflow: hidden;
}

.search-pane {
  border-right-style: solid;
  border-right-width: thin;
  border-right-color: gray;
  min-width: 40%;  /* Forces 40% minimum - the problem */
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow: hidden;
}

.recipe-pane {
  flex: 1;  /* Takes remaining space */
  overflow-y: auto;
  min-height: 0;
}
```

**Mobile** (lines 72-101):
```css
@media (max-width: 600px) {
  .content-container {
    display: block;
    height: auto;
  }
  .search-pane {
    border-right: none;
    border-bottom-style: solid;
    border-bottom-width: thin;
    border-bottom-color: gray;
    max-height: none;
  }
  .recipe-selected {
    display: none;  /* Hides search pane on mobile when recipe selected */
  }
  /* ... */
}
```

**Key insight**: The `recipe-selected` class already exists and is correctly applied in App.js, but desktop CSS doesn't use it. Mobile uses it for `display: none`, but desktop ignores it entirely.

## Proposed Solution

Use flexbox flex-grow/flex-shrink properties with the existing `recipe-selected` class to dynamically adjust space allocation. No JavaScript changes needed.

### CSS Changes (App.css)

Replace lines 36-66 with:

```css
/*
 * Responsive pane layout:
 * - Browsing mode (no recipe): search pane takes 3 parts, recipe pane takes 1 part
 * - Reading mode (recipe selected): search pane takes 1 part, recipe pane takes 3 parts
 */
.search-pane {
  border-right-style: solid;
  border-right-width: thin;
  border-right-color: gray;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow: hidden;

  /* Browsing mode: search pane gets majority of space */
  flex: 3;
  min-width: 300px;
  max-width: 800px;
}

/* Reading mode: search pane shrinks to narrower width */
.search-pane.recipe-selected {
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.search-pane .query-form {
  flex-shrink: 0;
}

.search-pane > hr {
  flex-shrink: 0;
  margin: 0.5rem 0;
}

.search-pane-results {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.recipe-pane {
  overflow-y: auto;
  min-height: 0;

  /* Browsing mode: recipe pane minimal space */
  flex: 1;
  min-width: 0;
}

/* Reading mode: recipe pane gets majority of space */
.content-container:has(.recipe-selected) .recipe-pane {
  flex: 3;
  min-width: 400px;
}
```

### Alternative (if :has() not supported)

If browser compatibility is a concern (`:has()` selector), add a class to recipe-pane in App.js:

**App.js** (line 143):
```javascript
// Current:
<div className="recipe-pane">

// Change to:
<div className={this.state.targetRecipe ? "recipe-pane recipe-active" : "recipe-pane"}>
```

**App.css**:
```css
.recipe-pane {
  overflow-y: auto;
  min-height: 0;
  flex: 1;
  min-width: 0;
}

.recipe-pane.recipe-active {
  flex: 3;
  min-width: 400px;
}
```

## Design Decisions

### Use Existing `recipe-selected` Class
**Decision**: Leverage the already-applied `recipe-selected` class rather than creating new state or classes.

**Rationale**:
- App.js already toggles this class based on `targetRecipe` state
- Mobile CSS already uses it
- No JavaScript changes needed
- Single source of truth for "is recipe selected" state

### Flex Ratios (3:1)
**Decision**: Use 3:1 flex ratio (75%:25%) instead of fixed percentages.

**Rationale**:
- Flexible: adapts to different screen sizes
- Combined with min/max-width constraints, ensures usability
- 3:1 provides comfortable reading width without completely hiding the other pane

### Min/Max Width Constraints
**Decision**: Add min-width and max-width to both panes.

**Rationale**:
- **Search pane min-width (250-300px)**: Ensures recipe list items remain readable
- **Search pane max-width (400-800px)**: Prevents it from being unnecessarily wide
- **Recipe pane min-width (400px when active)**: Ensures comfortable reading width for ingredients/instructions
- Prevents extreme edge cases (tiny windows, ultra-wide monitors)

### Keep Mobile Behavior Unchanged
**Decision**: Don't modify mobile CSS (leave `display: none` for `.recipe-selected`).

**Rationale**:
- Current mobile behavior is correct and user-tested
- Mobile screens too narrow for side-by-side panes
- Complete hiding on mobile provides better UX than attempting to squeeze both panes

## Edge Cases Handled

1. **Very narrow desktop windows**: Min-width constraints prevent panes from becoming unusable; horizontal scrolling may appear if window < ~650px, but this is acceptable for desktop
2. **Ultra-wide monitors**: Max-width prevents search pane from being unnecessarily wide when browsing
3. **NewRecipeForm active**: Recipe pane gets priority space, providing comfortable form layout
4. **Label Manager open**: Not affected (uses different layout, not `.content-container`)

## Browser Compatibility

### `:has()` Selector
If using the `:has()` approach:
- **Supported**: Chrome 105+, Safari 15.4+, Firefox 121+, Edge 105+
- **Not supported**: IE11 (but app already doesn't support IE11)

If compatibility is a concern, use the alternative approach with explicit `recipe-active` class on the recipe pane.

## Files Modified

```
Modified:
  src/App.css (lines 35-87 - replaced fixed min-width with responsive flex layout)
  src/GroupedResultList.css (line 46 - reduced recipe indentation from 1rem to 0.5rem)
  src/ResultList.css (line 3 - removed default ul padding for cleaner grouped display)
  CLAUDE.md (lines 11-14 - documented dynamic space allocation)
  TODO.md (removed "More responsive UI" feature request)
  docs/specs/responsive-pane-layout.md (this file - marked as implemented)
```

## Implementation Details

Used the `:has()` selector approach (CSS-only, no JavaScript changes):
- `.search-pane`: `flex: 3` by default, `flex: 1` when `.recipe-selected`
- `.recipe-pane`: `flex: 1` by default, `flex: 3` when container has `.recipe-selected`
- Min/max width constraints applied to both panes for usability
- Reduced grouped recipe indentation: removed default ul padding, set explicit 0.5rem margin-left
- All 84 existing tests pass

## Testing Checklist

**Desktop**:
- [ ] No recipe selected: search pane takes ~75% width, recipe pane minimal
- [ ] Recipe selected: recipe pane takes ~75% width, search pane ~25%
- [ ] Search pane remains functional when narrow (recipe list readable)
- [ ] Recipe pane has comfortable reading width when active
- [ ] Transition feels natural when selecting/deselecting recipes
- [ ] Min/max width constraints work correctly
- [ ] NewRecipeForm displays correctly with priority space

**Mobile** (unchanged behavior):
- [ ] No recipe selected: search pane visible
- [ ] Recipe selected: search pane hidden (display: none)
- [ ] Can navigate back to search pane from recipe

**Responsive breakpoints**:
- [ ] Works correctly at common desktop widths (1024px, 1280px, 1440px, 1920px)
- [ ] Mobile breakpoint (600px) still triggers correctly
- [ ] No layout issues in intermediate widths (600-1024px)

## Implementation Notes

1. This is a CSS-only change (preferred) or minimal JavaScript if using the alternative approach
2. No state changes, no new props, no API changes
3. Existing unit tests should still pass
4. No bundle size impact
5. Update CLAUDE.md to document new layout behavior
6. Update TODO.md to mark this feature as complete
