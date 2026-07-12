# Site-wide Day/Night Mode (Public Site) — Design

**Date:** 2026-07-12
**Status:** Approved, pending implementation plan

## Problem

The public site has no working dark mode. Earlier project notes referenced a
dark-mode toggle in article controls and a `darkMode` flag in `AppContext`, but
both have since been removed — `AppContext` now manages only font size, and the
CSS `--dark` / `--primary-dark` variables are just color *names*, not a theme.

Visitors want a night reading mode across the whole public site.

## Goals

- A manual light/dark toggle available site-wide (public pages only).
- Default to the visitor's OS preference (`prefers-color-scheme`) on first visit;
  a manual choice overrides and persists.
- No flash of the wrong theme on initial load.
- Admin/dashboard stays light (out of scope).

## Non-goals

- Theming the admin panel.
- Per-component theme customization or multiple accent themes.
- Inverting or recoloring news photographs.

## Decisions (from brainstorming)

1. **Thoroughness:** Full token refactor — introduce semantic tokens and remap the
   CSS to use them, overriding token values under `[data-theme="dark"]`.
2. **Activation:** Manual toggle + follow OS default; choice saved to
   `localStorage['pa-theme']`.
3. **Scope:** Whole public site; toggle lives in the TopBar next to the edition
   switcher. Admin excluded.

## Architecture

### 1. Semantic token layer

Add a semantic token set to `:root` in `resources/css/app.css`. These tokens are
the *only* values dark mode overrides:

```css
:root{
  --bg:#ffffff;          /* page background */
  --surface:#ffffff;     /* cards, panels, dropdowns */
  --surface-2:#f8f8f8;   /* nested / subtle fills */
  --text-color:#121212;  /* body text */
  --text-muted:#666666;  /* meta, captions */
  --border-color:#e0e0e0;
  --link-color:#263238;
  --shadow-color:rgba(0,0,0,.08);
  color-scheme: light;
}
:root[data-theme="dark"]{
  --bg:#121212; --surface:#1e1e1e; --surface-2:#262626;
  --text-color:#e8e8e8; --text-muted:#9aa0a6; --border-color:#333333;
  --link-color:#8ab4f8; --shadow-color:rgba(0,0,0,.5);
  color-scheme: dark;
}
```

Brand-primary red and breaking-news red (`--breaking`, `--primary`) stay fixed —
they carry semantic urgency and already render white-on-color.

### 2. CSS remap

Migrate the ~869 hardcoded hex colors + 227 white backgrounds in `app.css` to the
tokens, **section by section** (never a blind global find/replace — many `#fff`
values sit on red/dark backgrounds and must stay white). Categories:

| Hardcoded pattern | → Token |
|---|---|
| `#fff` / `#ffffff` / `white` backgrounds | `var(--surface)` or `var(--bg)` |
| body/heading text `#121212 #0d0d0d #222 #333 #444 #555` | `var(--text-color)` |
| muted text `#666 #777 #888 #999` | `var(--text-muted)` |
| borders `#e0e0e0 #eee #ddd` | `var(--border-color)` |
| `box-shadow rgba(0,0,0,…)` | `var(--shadow-color)` |
| links | `var(--link-color)` |

### 3. Flash-free initialization

Inline **blocking** script in `resources/views/app.blade.php` `<head>`, before the
Vite assets, so `data-theme` is set before first paint. Scoped to the public site
via the existing `@unless(request()->is('admin') || request()->is('admin/*'))`
guard:

```js
(function(){try{var t=localStorage.getItem('pa-theme');
if(!t)t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
```

### 4. State (mirror the font-size pattern)

Extend `resources/js/contexts/AppContext.jsx`:

- `theme` state initialized from the `data-theme` attribute the inline script
  already set (falls back to `'light'`), so React state matches the DOM — no flash,
  no hydration mismatch.
- `toggleTheme()` flips light/dark, writes `localStorage['pa-theme']`.
- `useEffect` syncs `document.documentElement.setAttribute('data-theme', theme)` —
  identical shape to the existing `data-font-size` effect.
- Expose `theme` and `toggleTheme` from the context value.

### 5. Toggle UI

Sun/moon button in `resources/js/Components/TopBar.jsx`, placed next to
`.tb-edition`, using the existing `Icon name="sun" / "moon"`. Includes
`aria-label` and `aria-pressed`, with bn/en labels. Shows moon in light mode
(action = go dark) and sun in dark mode. New `.tb-theme-btn` CSS in the TopBar
style block.

### 6. Inline-style cleanup (targeted)

Only the **visible-chrome** inline styles that would break in dark mode are
migrated to reference tokens — `TopBar.jsx`, `ArticleControls.jsx` (font-size /
bookmark / print buttons), and any similar chrome using hardcoded `#fff` /
`#e0e0e0` / `#444`. Example: `background:'var(--surface)'`,
`borderColor:'var(--border-color)'`, `color:'var(--text-color)'`. Deep page
components are covered by the CSS remap and are not touched.

## Edge cases

- **Logos:** The per-edition logo may be dark-on-transparent and could vanish on a
  dark header. Verify during implementation; if it disappears, add a dark-mode
  logo variant or a subtle backdrop. (Note: the masthead may already be a fixed
  dark/brand color, in which case no change is needed.)
- **Images / photographs:** Left untouched — correct for a news site.
- **Admin:** Excluded via the blade guard and by not mounting the toggle in admin
  layouts.
- **White-on-color text:** Preserved by doing the CSS remap section-by-section.

## Testing / verification

- Build succeeds (`npm run build`), no console errors.
- Toggle flips the whole public site; choice persists across reloads and
  navigations (Inertia SPA).
- First load with OS set to dark renders dark with no white flash.
- Article page (primary reading surface), home, category, footer, and dropdown
  menus all read correctly in both themes — spot-check contrast on text and
  borders.
- Admin pages remain light and unaffected.

## Risks

- Large mechanical pass over `app.css` → mitigated by chunked, section-by-section
  edits and a build + visual spot-check after each major section.
- The main failure mode is white text left on a now-dark surface (or vice versa);
  caught by the section-by-section approach rather than global replace.
