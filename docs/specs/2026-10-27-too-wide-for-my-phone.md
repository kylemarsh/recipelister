# Specification: Recipe Pane Too Wide for Phone (Bugfix)

Status: DRAFT v4 — root cause identified in current `main` (4a2fe48) and
corroborated by live-console data. Pending sign-off to implement.
TODO.md item: `BUGS > Too Wide for my Phone`
Branch: `fix-mobile-recipe-pane-width` (rebased onto origin/main)

## Overview

When reading a recipe on an iPhone 13 mini (375 CSS px viewport), the right
hand side of every line of recipe text is unreachable — it neither wraps
into view nor can be panned/zoomed to. Browsing (list view) is unaffected.

## Root Cause (final)

The responsive-pane-layout work (commit `46da365`, "distinguish browsing and
reading modes on desktop") added a reading-mode rule in `App.css:87-90`:

```css
.content-container:has(.recipe-selected) .recipe-pane {
  flex: 3;
  min-width: 400px;
}
```

**This rule is not scoped to any media query.** On mobile (≤600 px) the
panes go to `display: block` and the search pane hides
(`.recipe-selected { display: none }`, `App.css:116-118`), but a `display:
block` child still honors `min-width` — so the moment a recipe is opened,
the recipe pane's box is forced to **≥400 px on a 375 px screen**. The text
column inside it is ~380 px; the rightmost ~25–65 px of *every* line is
hidden — clipped by `.content-container { overflow: hidden }` (`App.css:27`)
and/or swallowed by iOS's layout-viewport expansion, whose min-zoom clamp
makes the lost strip permanently unreachable. Exactly the reported symptom:
reading breaks, browsing (`.search-pane` min-width 300 + chrome ≈ 350) fits.

Same family, second victim: the base `.search-pane { min-width: 300px }`
(`App.css:51`) means on a 320 px device (iPhone SE 1st gen) even *browsing*
overflows by ~30 px. And in the 601–~690 px window range, the reading-mode
desktop minimums add up (`250 + 400 + ~60` chrome ≈ 690) and `topnav` needs
~676 px, producing the overflow chain the user's console scan captured:

```
DIV.topnav 676>667            DIV.content-container 670>667
DIV.search-pane recipe-selected 299>249   FORM.query-form 294>239
FORM.login-container 117>108  BUTTON.manage-labels-button 85>52 ...
```

The console scan also **exonerated the recipe body**: no `.recipe-body`
element appears in the overflow list, and the zucchini line is plain ASCII
(plus a trailing `\r` — the stored body uses CRLF line endings; harmless to
rendering under `pre-wrap`, but it makes `split("\n")`-style checks noisy).

### Why the zucchini line *looked* guilty

The user's resize test found the container "stopped shrinking" at ~441 px,
which almost exactly matches the width of the longest ingredients line
("1 medium-size Zucchini Sliced moon-shaped or diced" measures ≈ 389 px in
isolation, +52 px chrome = 441). It is a coincidence of numbers: the true
floor is `min-width: 400px` + padding/margins ≈ 442–452 px, independent of
line content. Two red herrings the trail chased:

1. **Invisible characters** — a headless-Chrome experiment (see Appendix)
   proved an ASCII line with real spaces can never form a floor
   (`white-space: pre-wrap` wraps at U+0020), and even NBSP-locked *words*
   still break at a surviving ASCII hyphen; only a line with **zero** break
   opportunities (E3: NBSP + U+2011) creates one. The live DOM console
   check found none of these in the zucchini line — body innocent.
2. **iOS zoom mechanics** — the "can't zoom out" half of the report is
   Safari clamping zoom-out to the initial (device-width) scale; any content
   wider than 375 px is therefore invisible, not merely ugly. Fixes must
   remove the overflow, never touch the viewport meta.

## Requirements

- **R1.** At 375 px (and ideally 320 px), reading *any* recipe produces no
  horizontal overflow: `documentElement.scrollWidth ≤ innerWidth`, and the
  recipe pane's box fits inside the viewport.
- **R2.** Genuinely long unbreakable strings (URLs, run-on tokens,
  NBSP-locked lines of the E3 variety) in body, notes, tags, and titles must
  break mid-segment rather than form a new width floor (defense in depth;
  validated by experiment E4/E7 even though this was not the Soondubu
  trigger).
- **R3.** Line breaks in `recipe.Body` (`white-space: pre-wrap`,
  `main.css:22`) must keep being respected.
- **R4.** Desktop ≥601 px behavior (both browsing and reading modes,
  incl. `46da365`'s 3:1/1:3 flex split) must be visually unchanged by this
  fix.
- **R5.** No viewport-meta changes; no `overflow-x: hidden` clipping of
  recipe content; no new dependencies; `main.css` untouched.

## Proposed Changes

### Change 1 (the fix): scope reading-mode pane sizing to desktop

`App.css` — wrap the `:has()` reading rule in `@media (min-width: 601px)`,
so mobile keeps `.recipe-pane { min-width: 0 }` (its base rule,
`App.css:77-84`). Equivalent alternative: add to the existing `≤600px` block
a matching-specificity override (`.content-container:has(.recipe-selected)
.recipe-pane { min-width: 0 }`). Proposed: the `@media` wrap — the reading
rule is meaningless when the flex row doesn't exist.

### Change 2 (R1 at 320 px): mobile pane minimums

In the `≤600px` media block: `.search-pane { min-width: 0 }` (base 300 px
currently leaves 22 px of slack on 375 px and overflows 320 px).

### Change 3 (R2 hardening, from the earlier analysis)

```css
/* Recipe.css */
.recipe-body       { overflow-wrap: break-word; word-break: break-word; }
.recipe-container h2 { overflow-wrap: break-word; }

/* Notes.css / Tags.css — E6 proved all three properties are required */
.note-list > li,
.tag-list > li {
  max-width: 100%;
  white-space: normal;      /* kills the inherited .tag-list nowrap */
  overflow-wrap: anywhere;  /* shrinks min-content so fit-content clamps */
}
```

### Known adjacent issue (NOT proposed for this branch — user's call)

Between ~601 px and ~690 px the desktop reading layout still overflows
(pane minimums sum ≈ 690 px; topnav ≈ 676 px). Fix would mean retuning the
desktop minimums (e.g. recipe `min-width: min(400px, 55%)`, smaller search
pane, wrappable topnav) — that is layout design, belongs with the "More
responsive UI" TODO item, and R4 says don't change desktop behavior as a
side effect of a mobile bugfix.

## Test Plan

- **Jest (`npm test`):** keep the existing suite green; add the smoke
  assertions carried over from the earlier plan (body/note/tag rendered
  inside their target classes with an E3-style unbreakable fixture string
  containing real ` `/`‑`, locking the CSS contract). jsdom has no
  layout engine, so the real gate is manual.
- **Manual (the acceptance gate), Safari responsive mode 375×812 + Chrome:**
  1. Soondubu Jjigae (or any recipe): dashi line fully visible; recipe pane
     box ≤ viewport; `scrollWidth === 375`; no zoom-out needed.
  2. Browsing view at 375 px: unchanged; at 320 px: fits after Change 2.
  3. Long-URL fixture (New Recipe paste): wraps via Change 3, no floor.
  4. Tag/note chips with very long labels: stay inside the pane.
  5. Desktop: browsing (any width ≥601) and reading mode (≥~700) look and
     behave exactly as before the fix (R4) — 3:1 / 1:3 split intact.
  6. Phone landscape (812 px wide, >600): desktop reading mode; check the
     690 floor doesn't bite (it shouldn't at 812).

## Edge Cases

- CRLF bodies (like Soondubu's): CR is a line-break character under
  `pre-wrap` — renders as a clean break; noted only because it confuses
  console diagnostics. No code change.
- Devices 320–375 px; Dynamic-Type large text (wrapping must hold).
- `:has()` support floor (Safari 15.4+): on older engines the reading rule
  wouldn't apply at all — which degrades to the *correct* mobile behavior,
  so no regression risk from keeping `:has()`.
- Editing a recipe (`showRecipeEditor` also sets `recipe-selected`,
  `App.js:66-68`) — the form pane gets the same 400 px floor on mobile;
  Change 1 fixes it identically.
- Label manager routes (`/admin/labels`) were not implicated by any
  overflow data; out of scope.

## Acceptance Criteria

1. 375 px emulation, reading the reproduction recipe: `scrollWidth ===
   clientWidth === 375`; every line visible at 100% zoom.
2. ≥601 px browsing and reading render pixel-identically to before
   (Change 1 is a no-op above the breakpoint).
3. `npm test` green incl. new fixtures.
4. Diff limited to `App.css`, `Recipe.css`, `Notes.css`, `Tags.css`,
   `App.test.js` (+ TODO.md/CLAUDE.md bookkeeping).
5. TODO.md BUGS entry removed post-merge per project convention.

## Appendix A: Headless-Chrome break-opportunity experiment (2026-10-27)

Static repro of the width chain (375 px box → `medium-container` →
`content-container` → `recipe-body`), script at
`/tmp/toowide-repro/repro.html`:

| Variant | Result |
|---|---|
| E1 — zucchini line as transcribed (pure ASCII) | fits — wraps at spaces |
| E2 — spaces → U+00A0, ASCII hyphen intact | fits — still breaks after "moon-" |
| E3 — U+00A0 spaces **and** U+2011 hyphen | overflow: 389 px unbreakable → floor |
| E4 — E3 + `overflow-wrap: break-word` | fits — hardening validated |
| E5 — tag chip as styled today, unbreakable label | overflow |
| E6 — chip + `max-width` + `anywhere`, `nowrap` inherited | still overflows |
| E7 — chip + `white-space: normal` + `anywhere` | fits |

E1/E2 are why the NBSP theory was abandoned once the live console showed the
zucchini line is ASCII — and why Change 3 is hardening, not the fix.

## Appendix B: Diagnostic history (for the record)

1. v1 suspected long tokens in `.recipe-body` (URL/NBSP theory) — mechanism
   knowledge (iOS zoom clamp, pre-wrap) survives; the culprit was wrong.
2. v3 narrowed to the zucchini ingredients line from the user's resize test —
   coincidental threshold (its width ≈ the 400 px `min-width` floor).
3. v3.1 headless experiment (Appendix A) proved the line would need *zero*
   break opportunities to be guilty.
4. v4 live console evidence (user, deployed build): body not overflowing;
   overflow list full of topnav/search-pane/query-form at widths 667–676 →
   pointed at the unscoped `min-width` rules of `46da365`; confirmed by
   reading the (previously stale — local `main` was ~20 commits behind
   production) CSS in current `main`.

## References

- `src/App.css:87-90` — `:has()` reading rule with `min-width: 400px` (bug)
- `src/App.css:40-60` — pane sizing: base 300/800, reading 250/400
- `src/App.css:24-33` — `.content-container` flex + `overflow: hidden`
- `src/App.css:96-125` — the `≤600px` block (display:block, hide pane)
- `src/App.js:66-68` — `recipe-selected` class trigger
- `src/main.css:22-24` — `.recipe-body { white-space: pre-wrap }`
- `src/Tags.css` `.tag-list` nowrap + `Notes.css` fit-content chips
- commit `46da365` — introduced the reading-mode flex split
- TODO.md `BUGS > Too Wide for my Phone`
