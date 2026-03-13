# Label Icons in Recipe List - Design Spec

**Date:** 2026-03-12
**Feature:** Display label icons after recipe titles in the recipe list

## Overview

Display emoji icons after recipe titles in the recipe list to visually indicate which labels are tagged to each recipe. Icons come from the server's label API response.

## Background

The server now returns an `Icon` field for labels alongside `ID` and `Label` (name). Labels without icons will have an empty/null `Icon` field. This feature makes label information visible at a glance in the recipe list without requiring users to click into each recipe.

## Requirements

- Display label icons inline after recipe title
- Only show icons for labels that have an `Icon` field (truthy)
- Show label name on hover (desktop) using native browser tooltips
- Minimal implementation using native `title` attribute
- No new files or components needed

## Architecture

Single component change to `ResultList.js` with minimal CSS additions.

## Component Changes

### ResultList.js

After rendering the recipe title text, iterate through `item.Labels` array and render icons:

- For each label in `item.Labels`:
  - Check if `label.Icon` exists and is truthy
  - If yes, render a `<span>` containing:
    - `title={label.Label}` for native tooltip with label name
    - `className="recipe-icon"` for styling
    - `key={label.ID}` for React list rendering
    - Text content: `label.Icon`
- Icons render inline after the title with spacing

Example structure:
```jsx
<li>
  {item.New && "• "}{item.Title}
  {item.Labels && item.Labels.map(label =>
    label.Icon ? <span key={label.ID} className="recipe-icon" title={label.Label}>{label.Icon}</span> : null
  )}
</li>
```

## CSS Changes

### ResultList.css

Add `.recipe-icon` class:
- `margin-left: 0.25em` - spacing between title and first icon, and between icons
- `cursor: default` - indicate these are informational, not clickable
- `display: inline` - keep icons flowing with text

## Behavior

### Desktop
- Hover over icon shows native browser tooltip with label name
- Tooltip timing controlled by browser defaults

### Mobile
- Tap on icon shows native browser tooltip
- Tooltip behavior (duration, dismissal) controlled by browser/OS
- Varies by platform (iOS, Android, etc.)

## Edge Cases

1. **Labels without Icon field**: Skip rendering, no icon shown
2. **Recipes without labels**: `item.Labels` is undefined/empty, no icons rendered
3. **Empty Icon string**: Falsy check catches this, no icon shown
4. **Recipes with New indicator**: Icons appear after "• Title" format
5. **Long label lists**: Icons wrap naturally with text flow

## Data Flow

1. Server returns labels with `Icon` field via `/labels/` endpoint
2. `App.js` stores labels in `allLabels` state via `getLabels()`
3. Recipes already have `Labels` array populated when loaded
4. `ResultList` receives recipes with labels attached
5. `ResultList` renders icons directly from `label.Icon` field

## Non-Goals

- Custom tooltip styling or behavior (using native tooltips)
- Click interactions on icons
- Filtering by clicking icons
- Icon animations or transitions
- Fallback icons for labels without Icon field

## Future Considerations

If native tooltip behavior proves insufficient on mobile (doesn't auto-dismiss or lacks discoverability), we can revisit with:
- Custom tooltip component with controlled visibility
- Touch event handlers for tap-to-show-then-auto-dismiss
- Alternative mobile UX (long-press, info icon, etc.)

## Testing

Manual testing needed:
- Recipe list displays icons after titles
- Hover shows label name on desktop
- Icons appear for all labels with Icon field
- No icons shown for labels without Icon field
- Icons wrap naturally on narrow screens
- New recipe indicator (•) still works correctly
