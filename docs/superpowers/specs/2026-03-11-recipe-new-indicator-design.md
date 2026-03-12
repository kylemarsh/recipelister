# Recipe "New" Indicator Design

**Date:** 2026-03-11
**Feature:** Indicate new recipes and mark them as tried

## Overview

Add visual indicators to show which recipes haven't been tried yet, and provide a way to mark recipes as cooked through the edit form. The backend Recipe model already includes a `New` field (boolean) for this purpose.

## Data Model

**Recipe Object:**
- `New` (boolean): Indicates whether recipe has been tried
  - `true` = untried/new recipe
  - `false` = recipe has been cooked

**API:**
- No new endpoints required
- Existing `PUT /priv/recipe/{id}` endpoint handles the "new" field
- Form data includes checkbox value which backend interprets correctly

## UI Components

### Recipe Pane (Recipe.js)

**Title Display:**
- Append "(New!)" text to recipe title when `recipe.New === true`
- Implementation: `{recipe.Title}{recipe.New ? " (New!)" : ""}`
- Visible in view mode only (not in edit mode)
- No authentication check - display if field is true

### NewRecipeForm (Recipe.js)

**New Checkbox Field:**
- Location: After totalTime field, before textarea
- Label: "This recipe has been cooked"
- Input name: "new"
- Input type: checkbox

**Checkbox State Logic:**
- Creating new recipe (no recipeId):
  - Default: unchecked
  - When unchecked, FormData omits field, backend defaults to `New: true`
- Editing existing recipe:
  - Default: checked if `!recipe.New`, unchecked if `recipe.New`
  - Inverted because checkbox semantics: checked = "has been cooked" = `New: false`

**Form Data:**
- Checked: FormData includes `new: "on"`, interpreted as `New: false`
- Unchecked: FormData omits field, interpreted as `New: true`

### ResultList (ResultList.js)

**List Item Display:**
- Show bullet point character (•) before recipe title when `item.New === true`
- Implementation: `{item.New && "• "}{item.Title}`
- No authentication check required
- No additional props needed

### ResultList.css

**Remove Default Bullets:**
- Add CSS rule: `.result-list { list-style-type: none; }`
- Prevents double bullets (CSS default + manual indicator)
- May require margin/padding adjustments

## State Management

**App.js:**
- No new state variables needed
- `recipe.New` is part of existing recipe object structure
- No new event handlers required
- Existing `handleNewRecipeSubmit` handles all form fields including "new"

**Data Flow:**
1. User checks/unchecks "This recipe has been cooked" in NewRecipeForm
2. Form submission includes checkbox state in FormData
3. `handleNewRecipeSubmit` sends FormData to `Api.updateRecipe` or `Api.createRecipe`
4. On success, recipe list reloads via `reloadRecipeList: true`
5. Updated recipe object includes new `New` field value
6. UI components re-render with updated state

## Error Handling

- Reuses existing "addRecipe" error context
- Auto-dismiss on successful recipe creation/update
- No new error handling code required

## User Experience

**Marking a Recipe as Cooked:**
1. User clicks recipe in list to view it
2. User sees "(New!)" in title if recipe is untried
3. User clicks edit button (pencil icon)
4. User checks "This recipe has been cooked" checkbox
5. User saves changes
6. "(New!)" indicator disappears from title
7. Bullet point disappears from list

**Visual Indicators:**
- List Pane: Bullet point (•) prefix for new recipes
- Recipe Pane: "(New!)" suffix on recipe title
- Edit Form: Checkbox state reflects current status

## Implementation Notes

**No Breaking Changes:**
- All changes are additive
- Existing components receive additional props or render logic
- No changes to component signatures

**Styling Considerations:**
- Removing default CSS bullets may cause layout shift
- Test with grouped and ungrouped recipe lists
- Verify mobile responsive layout

**Accessibility:**
- Checkbox has clear label text
- Visual indicators are supplementary to existing functionality
- No color-only indicators used
