# New Recipe Form: Reading Mode Layout

## Desired Outcome
When the new recipe form is open, the layout should shift to "reading mode" — recipe pane prominent (~75% width), list pane compressed (~25% width). This matches the layout already used when viewing an existing recipe.

## Current State
Pane widths are controlled by the `recipe-selected` CSS class on `.search-pane`, which is applied when `targetRecipe` is set (i.e., a recipe is selected). When opening the new recipe form, `targetRecipe` is cleared (`undefined`), so the layout stays in "browsing mode" — list pane gets ~75% and the form is squeezed into the narrow recipe pane.

Edit recipe already works correctly because `targetRecipe` remains set, so reading mode is already active.

## Decision
- **New recipe form**: apply reading mode layout (Option A — extend `recipe-selected` class logic).
- **Edit recipe form**: leave as-is (already in reading mode via `targetRecipe`).
- **List pane while form is open**: remains interactive; clicking a recipe cancels the form (existing behavior via `handleResultClick` setting `showRecipeEditor: false`).

## Implementation

One-line change in `App.js` around line 66:

```js
// Before
const searchClass = this.state.targetRecipe
  ? "search-pane recipe-selected"
  : "search-pane";

// After
const searchClass = (this.state.targetRecipe || this.state.showRecipeEditor)
  ? "search-pane recipe-selected"
  : "search-pane";
```

No CSS changes needed — `.recipe-selected` and the `:has()` selector already handle width distribution.

## Testing
1. Click "New Recipe" — verify list pane compresses and form gets the wider pane.
2. Submit the new recipe form — verify layout returns to browsing mode.
3. Cancel the new recipe form — verify layout returns to browsing mode.
4. Click a recipe to open it, then click edit — verify layout stays in reading mode (no regression).
5. Close a recipe — verify layout returns to browsing mode (no regression).
6. On mobile (< 600px): verify new recipe form doesn't break mobile layout.
