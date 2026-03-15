# Recipe Action Buttons - Design Specification

**Date:** 2026-03-14
**Status:** Proposed

## Overview

Convert the recipe action controls from semantic `<span>` elements to proper `<button>` elements with visual styling that matches the design language established by the sort buttons in the query form.

## Current State

The `RecipeActions` component (`Recipe.js:106-135`) currently uses three `<span>` elements with onClick handlers to provide navigation and record management actions:

- **Back/Untarget** (&#8630;) - Returns to recipe list, styled navy
- **Edit** (&#9998;) - Opens recipe editor, styled goldenrod
- **Delete** (&otimes;) - Deletes recipe, styled maroon

These spans have:
- `role="img"` attribute (treating them as icons)
- `aria-label` attributes describing icon type (e.g., "back-arrow-icon")
- Cursor pointer styling
- Color differentiation
- No button affordances (borders, backgrounds, hover states)

## Problems

1. **Accessibility**: Spans with onClick handlers are not keyboard-accessible by default and don't convey button semantics to assistive technologies
2. **Semantics**: These are interactive controls, not images or text decoration
3. **Visual consistency**: The sort buttons have established a button design language (borders, hover states, focus indicators) that these actions don't follow
4. **Icon clarity**: Current icons (especially ⊗ for delete) are not immediately recognizable

## Goals

1. Convert to semantic `<button>` elements
2. Match the visual language of sort buttons while preserving action-specific color coding
3. Improve icon recognition
4. Maintain compact header layout
5. Enhance accessibility with proper ARIA labels and focus indicators

## Design

### Component Structure

Replace all three `<span>` elements in `RecipeActions` with `<button>` elements:

```jsx
const RecipeActions = (props) => {
  return (
    <div className="recipe-actions">
      <button
        className="recipe-action-button recipe-untarget-trigger"
        onClick={props.UntargetClick}
        aria-label="Go back to recipe list"
      >
        ← {/* U+2190 - left arrow */}
      </button>
      <button
        className="recipe-action-button recipe-edit-trigger"
        onClick={props.EditClick}
        aria-label="Edit recipe"
      >
        &#9998; {/* ✎ - keep existing */}
      </button>
      <button
        className="recipe-action-button recipe-delete-trigger"
        onClick={props.DeleteClick}
        aria-label="Delete recipe"
      >
        🗑 {/* U+1F5D1 - wastebasket */}
      </button>
    </div>
  );
};
```

**Changes:**
- Element type: `<span>` → `<button>`
- New base class: `.recipe-action-button` (shared button styling)
- Keep existing specific classes for color theming
- Remove `role="img"` (no longer needed)
- Update `aria-label` to describe action, not icon type
- Update icons: ← for back, keep ✎ for edit, 🗑 for delete

### Icon Updates

| Action | Old Icon | New Icon | Rationale |
|--------|----------|----------|-----------|
| Back   | ↶ (U+21B6) | ← (U+2190) | Simple left arrow is unambiguous navigation |
| Edit   | ✎ (U+270E) | ✎ (U+270E) | Current icon works well, keep it |
| Delete | ⊗ (U+2297) | 🗑 (U+1F5D1) | Wastebasket is semantically clear for delete |

### CSS Styling

Add new `.recipe-action-button` base class in `Recipe.css` that captures the sort button visual language while scaling appropriately for the recipe header context:

```css
.recipe-action-button {
  padding: 0.4rem 0.8rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: bold;
}

.recipe-action-button:hover {
  box-shadow: inset 0 0 0 2px currentColor;
  background-color: rgba(0, 0, 0, 0.05);
}

.recipe-action-button:focus {
  outline: 2px solid #4a90e2;
  outline-offset: 2px;
}

.recipe-action-button:active {
  transform: translateY(1px);
}
```

**Update existing color classes** to work with new button structure:

```css
.recipe-untarget-trigger {
  color: navy;
}

.recipe-edit-trigger {
  color: goldenrod;
}

.recipe-delete-trigger {
  color: maroon;
}
```

**Preserve existing container styling:**

```css
.recipe-actions {
  position: relative;
  top: -1rem;
}

.recipe-actions > span {
  cursor: pointer;
  font-weight: bold;
  margin-inline: 0.3rem;
}
```

Update selector from `> span` to `> button` or remove specificity:

```css
.recipe-actions > button {
  margin-inline: 0.3rem;
}
```

### Styling Rationale

**Why not copy sort buttons exactly?**

The sort buttons are primary controls for list manipulation in the query form. Recipe actions serve different purposes (navigation, record management) and live in a different context (recipe header). They need related but differentiated styling.

**Design language borrowing from sort buttons:**
- Border radius (4px rounded corners)
- Box-shadow on hover (instead of solid border)
- Focus outline pattern (#4a90e2 with offset)
- Clean, minimal default appearance
- Smooth transitions

**Adaptations for recipe actions:**
- Smaller sizing (0.4rem vs 0.5rem padding, 1.1rem vs 1.2rem font) to fit compact header
- Transparent background by default (sort buttons have visible backgrounds)
- Box-shadow uses `currentColor` to match each button's semantic color
- Semi-transparent hover background instead of solid color
- Preserve color-coding (navy/goldenrod/maroon) for quick action recognition

### Accessibility Improvements

1. **Keyboard navigation**: Buttons are focusable by default with Tab key
2. **Screen readers**: Button role is conveyed automatically; aria-labels describe action purpose
3. **Focus indicators**: Visible outline on focus (2px solid #4a90e2)
4. **Interactive semantics**: Button elements convey clickability to all assistive technologies

## Implementation

### Files to Modify

1. **src/Recipe.js** (lines 106-135)
   - Replace `<span>` with `<button>`
   - Add `.recipe-action-button` class to all three buttons
   - Update `aria-label` values
   - Remove `role="img"`
   - Update icons

2. **src/Recipe.css**
   - Add `.recipe-action-button` base class with styling
   - Add hover, focus, active state rules
   - Update `.recipe-actions > span` selector to target buttons

### Testing

- Verify buttons render correctly in recipe header
- Test hover states show box-shadow in appropriate colors
- Test keyboard navigation (Tab to buttons, Enter/Space to activate)
- Test with screen reader to verify aria-labels are announced
- Verify icons render properly (especially wastebasket emoji)
- Test responsive behavior on mobile

## Trade-offs

**Benefits:**
- Semantic HTML improves accessibility
- Visual consistency with sort buttons
- Clearer icons improve UX
- Proper focus indicators for keyboard users

**Costs:**
- Slightly more CSS to maintain
- Visual change may require user adjustment (minimal - still same colors and positions)
- Wastebasket emoji may not render on very old systems (acceptable risk - falls back to square)

## Future Considerations

- If more action buttons are added, consider extracting `.recipe-action-button` to a shared component
- Could add tooltips on hover for additional affordance
- Could add confirmation dialog for delete action (separate feature)
