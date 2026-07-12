# Public Dark Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a site-wide, persisted light/dark theme toggle to the public site that defaults to the visitor's OS preference and applies to every public page.

**Architecture:** Introduce a semantic CSS token layer in `app.css` whose values are overridden under `:root[data-theme="dark"]`. A flash-free inline script in the blade `<head>` sets `data-theme` before first paint from `localStorage` or `prefers-color-scheme`. React `AppContext` owns the `theme` state + `toggleTheme()`, mirroring the existing `fontSize` pattern, and a sun/moon toggle in the TopBar drives it. The bulk of the work is a section-by-section remap of ~869 hardcoded colors in `app.css` onto the tokens.

**Tech Stack:** Laravel + Inertia (React 18), Vite, Tailwind 3, plain CSS custom properties. Bengali-first UI.

## Global Constraints

- Public site only. Admin (`request()->is('admin')` / `admin/*`) stays light and untouched.
- No new dependencies. No JS test runner exists in this repo (only phpunit for PHP) — CSS/UI tasks are verified with `npm run build` succeeding + the described manual visual spot-check. Do **not** add a JS test framework.
- Brand-primary red (`--primary`, `#263238`) and breaking-news red (`--breaking`, `#e8001e`) stay fixed in both themes; text that sits *on* these colors stays white.
- localStorage key: exactly `pa-theme`. HTML attribute: exactly `data-theme` on `<html>` (`document.documentElement`), values `"light"` / `"dark"`.
- Follow the existing `data-font-size` pattern in `resources/js/contexts/AppContext.jsx` for shape/naming consistency.
- Never do a blind global find/replace of `#fff` → token: many `#fff` values are white text/borders on red or dark backgrounds and MUST stay literal. Remap section-by-section.

---

## File Structure

- `resources/css/app.css` — add token layer + `[data-theme="dark"]` block near the top (`:root`); remap hardcoded colors section-by-section. (~3847 lines.)
- `resources/views/app.blade.php` — inline flash-free theme init script in `<head>`, inside the existing public-only `@unless` guard.
- `resources/js/contexts/AppContext.jsx` — add `theme` state, `toggleTheme()`, `useEffect` sync, expose in context value.
- `resources/js/Components/TopBar.jsx` — sun/moon toggle button next to `.tb-edition`; migrate its own chrome inline styles to tokens.
- `resources/js/Components/article/ArticleControls.jsx` — migrate font-size / bookmark / print button inline styles to tokens.

---

## Task 1: Semantic token layer + prove it on `body`

**Files:**
- Modify: `resources/css/app.css:32-60` (the `:root` block and `body` rule)

**Interfaces:**
- Produces: CSS custom properties consumed by every later task —
  `--bg`, `--surface`, `--surface-2`, `--text-color`, `--text-muted`, `--border-color`, `--link-color`, `--shadow-color`. Plus a `:root[data-theme="dark"]` override block.

- [ ] **Step 1: Add the token layer.** In `resources/css/app.css`, inside the existing `:root { … }` block (currently lines 32–54), append these tokens before the closing `}` (keep all existing variables as-is):

```css
  /* ── Semantic theme tokens (the only values dark mode overrides) ── */
  --bg:#ffffff;          /* page background */
  --surface:#ffffff;     /* cards, panels, dropdowns */
  --surface-2:#f8f8f8;   /* nested / subtle fills */
  --text-color:#121212;  /* body text */
  --text-muted:#666666;  /* meta, captions */
  --border-color:#e0e0e0;
  --link-color:#263238;
  --shadow-color:rgba(0,0,0,.08);
  color-scheme: light;
```

- [ ] **Step 2: Add the dark override block.** Immediately after the `:root { … }` block closes (before `*{margin:0…}` on the current line 55), add:

```css
:root[data-theme="dark"]{
  --bg:#121212; --surface:#1e1e1e; --surface-2:#262626;
  --text-color:#e8e8e8; --text-muted:#9aa0a6; --border-color:#333333;
  --link-color:#8ab4f8; --shadow-color:rgba(0,0,0,.5);
  color-scheme: dark;
}
```

- [ ] **Step 3: Point `body` at the tokens (the visible proof).** Change the `body` rule (currently line 59: `body{font-family:'SolaimanLipi',sans-serif;background:#fff;color:var(--black);line-height:1.9;}`) to:

```css
body{font-family:'SolaimanLipi',sans-serif;background:var(--bg);color:var(--text-color);line-height:1.9;transition:background-color .2s ease,color .2s ease;}
```

- [ ] **Step 4: Build.**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 5: Visual verification.** Serve the app (or open a built public page), open devtools, and on the `<html>` element set `data-theme="dark"`. Expected: page background turns near-black (`#121212`) and body text turns light (`#e8e8e8`). Remove the attribute → returns to white. (Headers/cards are still light — that's expected; they're remapped in later tasks.)

- [ ] **Step 6: Commit.**

```bash
git add resources/css/app.css
git commit -m "feat(theme): add dark-mode token layer and theme body background"
```

---

## Task 2: AppContext theme state

**Files:**
- Modify: `resources/js/contexts/AppContext.jsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `useApp()` returns additional fields `theme` (`'light'|'dark'`) and `toggleTheme()` (flips and persists). Consumed by Task 3 (TopBar).

- [ ] **Step 1: Add theme state initialized from the DOM attribute.** In `AppProvider`, after the `fontSize` state block (after line 13), add:

```jsx
  const [theme, setTheme] = useState(() => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.getAttribute('data-theme') || 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('pa-theme', next); } catch {}
      return next;
    });
  }, []);
```

- [ ] **Step 2: Sync the attribute on change.** After the existing `data-font-size` `useEffect` (lines 30–32), add:

```jsx
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
```

- [ ] **Step 3: Expose in the context value.** In the `useMemo` value object (lines 34–41), add `theme` and `toggleTheme`, and add both to the dependency array:

```jsx
  const value = useMemo(() => ({
    lang,
    fontSize,
    cycleFontSize,
    setFontSize: setFontSizeExplicit,
    theme,
    toggleTheme,
    settings,
    globalBreakingNews: props.globalBreakingNews || [],
  }), [lang, fontSize, cycleFontSize, setFontSizeExplicit, theme, toggleTheme, settings, props.globalBreakingNews]);
```

- [ ] **Step 4: Build.**

Run: `npm run build`
Expected: build completes, no errors.

- [ ] **Step 5: Verification.** In the browser console on a public page run `window.__t = document.documentElement.getAttribute('data-theme')` before and confirm the app renders. (Full toggle behavior is proven in Task 3.) Expected: no console errors; page renders normally in light mode.

- [ ] **Step 6: Commit.**

```bash
git add resources/js/contexts/AppContext.jsx
git commit -m "feat(theme): add theme state and toggleTheme to AppContext"
```

---

## Task 3: TopBar toggle + flash-free init (end-to-end working toggle)

**Files:**
- Modify: `resources/views/app.blade.php` (around line 30, inside the public-only `@unless` block; and note `@vite` is at line 124)
- Modify: `resources/js/Components/TopBar.jsx:160-173` (next to `.tb-edition`)
- Modify: `resources/css/app.css` (TopBar style area — add `.tb-theme-btn`)

**Interfaces:**
- Consumes: `theme`, `toggleTheme` from `useApp()` (Task 2).

- [ ] **Step 1: Add the flash-free init script.** In `resources/views/app.blade.php`, inside the existing `@unless(request()->is('admin') || request()->is('admin/*'))` block (the one that starts around line 10), add this script (place it as the first child of that block so it runs before Vite assets at line 124):

```blade
        <script>
          (function(){try{var t=localStorage.getItem('pa-theme');
          if(!t)t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
          document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
        </script>
```

- [ ] **Step 2: Add the toggle button in TopBar.** In `resources/js/Components/TopBar.jsx`, first ensure the component reads the new context fields — change the `useApp()` destructure (line 57) from `const { lang, settings } = useApp();` to:

```jsx
  const { lang, settings, theme, toggleTheme } = useApp();
```

Then, immediately after the `.tb-edition` `<div>` closes (after line 173), add:

```jsx
            <button
              className="tb-theme-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark'
                ? (lang === 'bn' ? 'দিনের মোড' : 'Light mode')
                : (lang === 'bn' ? 'রাতের মোড' : 'Dark mode')}
              aria-pressed={theme === 'dark'}
              title={theme === 'dark'
                ? (lang === 'bn' ? 'দিনের মোড' : 'Light mode')
                : (lang === 'bn' ? 'রাতের মোড' : 'Dark mode')}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
            </button>
```

(`Icon` is already imported in TopBar; `sun` and `moon` already exist in `Icon.jsx`.)

- [ ] **Step 3: Style the button.** In `resources/css/app.css`, near the other `.tb-*` rules, add:

```css
.tb-theme-btn{display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;color:inherit;cursor:pointer;padding:4px 6px;margin-left:6px;opacity:.85;transition:opacity .15s ease;}
.tb-theme-btn:hover{opacity:1;}
```

- [ ] **Step 4: Build.**

Run: `npm run build`
Expected: build completes, no errors.

- [ ] **Step 5: Visual verification (end-to-end).** Load a public page. Click the moon icon in the top bar. Expected: page background/text flip to dark; icon becomes a sun. Reload the page — it stays dark with **no white flash** on load. Clear `localStorage['pa-theme']`, set OS to dark, reload → loads dark automatically. Set OS to light, clear key, reload → loads light. Confirm `admin` pages are unaffected (still light).

- [ ] **Step 6: Commit.**

```bash
git add resources/views/app.blade.php resources/js/Components/TopBar.jsx resources/css/app.css
git commit -m "feat(theme): flash-free init and TopBar day/night toggle"
```

---

## Remap tasks (4–8): procedure

Tasks 4–8 each remap one section of `app.css` from hardcoded colors to tokens. **Every remap task uses the same deterministic procedure:**

For each rule in the section's line range, apply this mapping — but only when the color is used as UI chrome (page/card background, body text, border, shadow), NOT when it's white/light text or a border sitting on a red/dark/image background (those stay literal):

| Hardcoded value (as background/text/border/shadow) | Replace with |
|---|---|
| `#fff` / `#ffffff` / `white` **background** of a card/panel/page | `var(--surface)` (cards/panels) or `var(--bg)` (full-page areas) |
| body/heading text `#121212` `#0d0d0d` `#111` `#222` `#2d3134` `#333` `#444` | `var(--text-color)` |
| muted text `#555` `#666` `#777` `#888` `#999` | `var(--text-muted)` |
| border `#e0e0e0` `#eee` `#ececec` `#ddd` `#f0f0f0` | `var(--border-color)` |
| subtle fill background `#f8f8f8` `#f5f5f5` `#fafafa` | `var(--surface-2)` |
| `box-shadow` `rgba(0,0,0,.0X)` | keep offsets/blur; swap the color for `var(--shadow-color)` |
| link text using `--red`/`--primary`/dark neutral as a *link* | `var(--link-color)` |

**Keep literal (do NOT tokenize):** any `#fff`/white/`#e...` that is text or border on `--primary`/`--breaking`/`--primary-dark`/`#0f1117`/gradient/image backgrounds; the `--breaking` red; brand red accents used as intentional accent (e.g., reading-progress bar, active pills). When unsure whether a `#fff` is on a colored background, read the surrounding rule/selector before deciding.

**Per-task loop for the assigned line range:**
1. `grep -nE "#[0-9a-fA-F]{3,6}|rgba?\(" resources/css/app.css | awk -F: '$1>=START && $1<=END'` to list candidates.
2. Edit each qualifying rule per the table; leave exceptions literal.
3. `npm run build` → must pass.
4. Visual check the pages that use this section in **both** themes (toggle in the top bar).
5. Commit.

---

## Task 4: Remap global chrome — base, top bar, header, navigation

**Files:**
- Modify: `resources/css/app.css` lines ~55–430 (base/reset through nav). Includes `#top-bar` (line 117), `#header`/`.bbc-*` (155–210), nav rules (~400–430).

**Interfaces:** Consumes tokens from Task 1.

- [ ] **Step 1: Handle the header masthead + logo (the known edge case).**
  - `#top-bar` (line 117) is already dark (`#0f1117`) — **leave it literal**; it reads correctly in both themes.
  - The `#header` bar and `.bbc-site-name` (line 207, `color:#111`) are light-on-white. Change `.bbc-site-name` color to `var(--text-color)` and set the header bar background to `var(--surface)` (find the `.bbc-bar` / `#header` background rule near lines 155–200 and tokenize it).
  - Logo image `.bbc-logo-img` (line 203): after building, check whether the logo is dark-on-transparent and disappears on the dark header. If it does, add:
    ```css
    :root[data-theme="dark"] .bbc-logo-img{filter:brightness(0) invert(1);}
    ```
    Only add this if the logo actually vanishes; if the logo is already light or the masthead stays a fixed brand color, skip it. Note which you did in the commit message.

- [ ] **Step 2: Remap the rest of the range** (base reset, nav bar, nav links, dropdowns `.nav-sub-dropdown`/`.nav-sub-link`, "More" menu) per the procedure table. Nav dropdown panels are `background:#fff` on white → `var(--surface)`; their borders → `var(--border-color)`; nav link text → `var(--text-color)`.

- [ ] **Step 3: Build.** Run: `npm run build` → Expected: passes.

- [ ] **Step 4: Visual verification.** On the home page, toggle dark. Expected: header bar + nav become dark surfaces with light text; the logo is visible; nav hover dropdowns are dark panels with readable links; the already-dark top bar is unchanged and the toggle/edition buttons remain legible.

- [ ] **Step 5: Commit.**

```bash
git add resources/css/app.css
git commit -m "feat(theme): remap header, top bar and navigation to theme tokens"
```

---

## Task 5: Remap the homepage (`.hp-*`)

**Files:**
- Modify: `resources/css/app.css` — all `.hp-*` rules (grep for `.hp-` to get the exact range).

**Interfaces:** Consumes tokens from Task 1.

- [ ] **Step 1: Remap.** Run `grep -nE "^\.hp-" resources/css/app.css | head -1` and `... | tail -1` to bound the block, then apply the procedure table across it: card backgrounds `#fff` → `var(--surface)`; section/column separators and hairlines → `var(--border-color)`; headlines → `var(--text-color)`; kickers/meta/timestamps → `var(--text-muted)`; subtle section fills → `var(--surface-2)`; box-shadows → `var(--shadow-color)`. Keep any white text that sits on the red/breaking hero blocks literal.

- [ ] **Step 2: Build.** Run: `npm run build` → Expected: passes.

- [ ] **Step 3: Visual verification.** Home page in dark mode: hero, breaking column, mid-hero list, photo strip, weather/opinion/trending/poll sidebar, category sections with subcategory pills, tag chips, video section, and footer-adjacent blocks all render as dark surfaces with readable text and visible separators. Article-tag chips and subcategory pills stay legible. No lingering white card backgrounds.

- [ ] **Step 4: Commit.**

```bash
git add resources/css/app.css
git commit -m "feat(theme): remap homepage layout to theme tokens"
```

---

## Task 6: Remap the article page (`.art-*`, rich body, controls, comments)

**Files:**
- Modify: `resources/css/app.css` — `.art-*` rules and the Quill/rich-text body rules (`.art-body` and its `h2/h3/blockquote/ul/ol/pre/code/img` descendants).

**Interfaces:** Consumes tokens from Task 1.

- [ ] **Step 1: Remap.** Bound the `.art-` block via grep, then apply the table: article surface/background `#fff` → `var(--surface)`/`var(--bg)`; body text → `var(--text-color)`; byline/meta/caption → `var(--text-muted)`; rules/dividers → `var(--border-color)`. In `.art-body`: `blockquote` background/border → `var(--surface-2)`/`var(--border-color)`; `pre`/`code` background → `var(--surface-2)`; heading colors → `var(--text-color)`. Keep the reading-progress bar red and any share-button brand colors literal.

- [ ] **Step 2: Build.** Run: `npm run build` → Expected: passes.

- [ ] **Step 3: Visual verification.** Open a full article in dark mode: title, byline, body paragraphs, embedded headings, blockquotes, lists, and code blocks are all readable on dark; images render normally (untouched); the reading-progress bar stays red; author bio, related-news, and comments (threaded replies + form inputs) are legible. Font-size A-/A/A+ and print/bookmark controls are covered in Task 8.

- [ ] **Step 4: Commit.**

```bash
git add resources/css/app.css
git commit -m "feat(theme): remap article page and rich-text body to theme tokens"
```

---

## Task 7: Remap widgets, sidebar, cards, footer, forms, and remaining pages

**Files:**
- Modify: `resources/css/app.css` — everything not covered by Tasks 4–6: shared card/`.card` rules, the 8 Bangladesh widgets, `.right-col` sidebar, footer, `.contact-form`/form inputs, category/author/tag/search page rules, error pages, tables, badges, pagination, modal, tabs, ad slots.

**Interfaces:** Consumes tokens from Task 1.

- [ ] **Step 1: Remap remaining sections.** Sweep the rest of `app.css` with the candidate grep and apply the table. Special attention:
  - Form inputs/textareas/selects: `background:#fff` → `var(--surface)`, `border` → `var(--border-color)`, text → `var(--text-color)`, and add a placeholder rule if needed: `[data-theme="dark"] input::placeholder,[data-theme="dark"] textarea::placeholder{color:var(--text-muted);}`.
  - Footer: if it has its own dark-ish background already, leave literal; otherwise tokenize backgrounds/borders/text.
  - Widgets with gradient/brand-colored headers (e.g. `.weather` uses `--primary` gradient) — keep the colored header literal, tokenize only the white body area beneath it.
  - Tables (`.almnc-week-tbl` etc.): row backgrounds → `var(--surface)`/`var(--surface-2)`, borders → `var(--border-color)`, keep `.is-today` brand highlight literal.

- [ ] **Step 2: Build.** Run: `npm run build` → Expected: passes.

- [ ] **Step 3: Visual verification.** Toggle dark and walk: a category page, author page, tag page, search results (+ empty state), a static/contact page with a form, the 404/500 error pages, and the sidebar widgets (prayer times, cricket, weather, gold, stock, poll, trending, newsletter). Expected: all surfaces dark, all text readable, form fields legible with visible borders and placeholders, widget colored headers preserved, no orphan white blocks.

- [ ] **Step 4: Commit.**

```bash
git add resources/css/app.css
git commit -m "feat(theme): remap widgets, sidebar, footer, forms and remaining pages"
```

---

## Task 8: Migrate visible-chrome inline styles + final full-site pass

**Files:**
- Modify: `resources/js/Components/article/ArticleControls.jsx` (font-size / bookmark / print buttons, lines ~44–84)
- Modify: `resources/js/Components/TopBar.jsx` — any remaining hardcoded `#ddd`/`#bbb` chrome (lines ~146,151) that reads poorly, only if needed on the dark bar (top bar is already dark, so likely fine — verify).

**Interfaces:** Consumes tokens from Task 1.

- [ ] **Step 1: Tokenize ArticleControls buttons.** In `resources/js/Components/article/ArticleControls.jsx`, replace the hardcoded chrome colors in the inline styles with token references so the controls read in dark mode:
  - Font-size wrapper border `'1px solid #e0e0e0'` → `'1px solid var(--border-color)'`; inner `borderRight` `'1px solid #e0e0e0'` → `'1px solid var(--border-color)'`.
  - Inactive button `background:'#fff'` → `'var(--surface)'`, `color:'#444'` → `'var(--text-color)'`. Keep the active `background:'#c00'`/`color:'#fff'` literal (brand accent).
  - Bookmark + print buttons: `border:'1px solid #e0e0e0'` → `var(--border-color)`, `background:'#fff'` → `var(--surface)`, `color:'#444'` → `var(--text-color)`; keep the bookmarked-state red literal.

- [ ] **Step 2: Verify TopBar chrome.** Load the site; the top bar was already dark (`#0f1117`) so its `#ddd`/`#bbb` text should still read in both themes. Only if something is now illegible, swap that specific inline color for a token. Otherwise leave as-is (don't over-edit).

- [ ] **Step 3: Build.** Run: `npm run build` → Expected: passes.

- [ ] **Step 4: Full-site verification in both themes.** With the toggle, do a final walk of: home, a category, a full article (incl. font-size controls A-/A/A+, bookmark, print buttons now legible), author, tag, search, a form page, footer, and 404. Confirm: (a) no white flash on any first load in dark; (b) preference persists across Inertia navigations and reloads; (c) OS-default path works with the key cleared; (d) admin still light; (e) no orphan white surfaces or invisible text anywhere. Fix any stragglers found (tokenize the offending rule) and note them in the commit.

- [ ] **Step 5: Commit.**

```bash
git add resources/js/Components/article/ArticleControls.jsx resources/js/Components/TopBar.jsx resources/css/app.css
git commit -m "feat(theme): tokenize article controls chrome and finalize dark mode"
```

---

## Self-Review (against the spec)

- **Spec §1 token layer** → Task 1. ✅
- **Spec §2 CSS remap** → Tasks 4–7 (header/nav, homepage, article, widgets/rest), with the shared procedure table. ✅
- **Spec §3 flash-free init** → Task 3 Step 1. ✅
- **Spec §4 AppContext state** → Task 2. ✅
- **Spec §5 toggle UI** → Task 3 Steps 2–3. ✅
- **Spec §6 inline-style cleanup** → Task 8. ✅
- **Spec §7 edge cases:** logo → Task 4 Step 1; images untouched → stated in constraints/Task 6; admin excluded → Task 3 Step 1 guard + constraints; white-on-color preserved → procedure "keep literal" rule. ✅
- **Spec testing/verification** → build + both-theme visual checks in every task; final pass in Task 8 Step 4. ✅
- **Naming consistency:** `pa-theme`, `data-theme`, `theme`, `toggleTheme`, tokens `--bg/--surface/--surface-2/--text-color/--text-muted/--border-color/--link-color/--shadow-color` used identically across Tasks 1–8. ✅
- **Placeholder scan:** the remap tasks intentionally use a deterministic procedure + grep bounds rather than enumerating 869 literal edits; each still has concrete build + visual acceptance criteria. No "TBD/handle edge cases" hand-waving. ✅
