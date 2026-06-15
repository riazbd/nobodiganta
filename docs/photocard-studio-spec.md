# Photocard Studio — Technical Spec

> Developer-facing spec of the Photocard Studio feature. Companion to the
> client tutorial in [`photocard-tutorial.html`](./photocard-tutorial.html)
> (print-to-PDF deliverable). Last updated: 2026-06-15.

## 1. Purpose

A self-serve, config-driven photocard builder so the client designs **unlimited**
share-card templates himself (fonts, colors, gradients, backgrounds, logo, ad
banner, icons, custom layers) — no per-design code changes. Design once → reuse on
every article; the card auto-fills each article's photo / headline / date.

100% client-side canvas rendering. No server-side image processing. The DB only
stores a JSON config per template; uploaded assets live in `/storage`.

## 2. Data layer

- **Table** `photocard_templates` — migration `2026_06_14_100000_create_photocard_templates_table.php`
  Columns: `id, name_bn, name_en, slug (unique), canvas_preset, config (json),
  thumbnail (nullable), is_active, sort_order, created_by, timestamps`.
- **Model** `App\Models\PhotocardTemplate` — `config` cast to array; `creator()`; `scopeActive`.
- **Seeder** `PhotocardTemplateSeeder` — three starter templates:
  `classic-dark`, `amar-barta-style` (white header + red panel + social bar),
  `community-ad-style` (dark, logo overlap, bottom ad banner). Run with
  `php artisan db:seed --class=PhotocardTemplateSeeder` (uses `updateOrCreate`, safe to re-run).

## 3. Backend

`App\Http\Controllers\Admin\PhotocardTemplateController` — gated on permission
`media.gallery.manage`. Mutations redirect to the index route (clean URL, no 404 on reload).

| Method | Route (`admin.` prefix) | Purpose |
|---|---|---|
| `index` | GET `/admin/photocard-templates` | Inertia page (`features/admin/pages/photocard/PhotocardStudio`) |
| `apiList` | GET `/photocard-templates/list` | Active templates JSON (for the All News modal) |
| `ads` | GET `/photocard-templates/ads` | Active image ads + `byPosition` map (Ad Manager picker / `{{ad:*}}`) |
| `store` / `update` / `destroy` / `duplicate` | POST / PUT / DELETE / POST | CRUD (redirect to index) |
| `uploadAsset` | POST `/photocard-templates/upload-asset` | Store a bg/logo/banner image to `/storage/photocard` |
| `importUrl` | POST `/photocard-templates/import-url` | Copy an external image URL onto `/storage` (avoids canvas CORS taint). Needs `guzzlehttp/guzzle`. |

## 4. Frontend files (`resources/js/features/admin/components/photocard/`)

| File | Role |
|---|---|
| `schema.js` | `defaultConfig()`, `CANVAS_PRESETS`, `SAMPLE_DATA`, `makeLayer(type)`, `normalizeConfig(stored)` (deep-merge onto defaults + legacy `size`→`width/height` migration) |
| `elements.js` | **Unified element model** — `listElements` / `listAllElements` / `elementBox` / `setElementBox`; `drawConfig` (sync draw); `buildContext` / `resolveTokens` / `resolveUrl` (dynamic fields); `SOCIAL_PLATFORMS`, `ICON_PATHS`, `assetUrls` |
| `dynamicRenderer.js` | Module-level image cache: `getImg` / `ensureAssets` / `drawNow` (sync) / `renderConfig` (async) / `downloadConfig(…, {type})` |
| `templates/utils.js` | `loadImage`, `drawImageFit`, `formatDateBn`/`toBnDigits`, `hexToRgba`, `makeGradient`, `roundRectPath` |
| `fonts.js` | `FONTS` registry, `fontStack`, on-demand Google-font loader (`ensureFont`/`ensureConfigFonts`) |
| `icons.js` | `GENERAL_ICONS` (Material 24×24 fill paths) |
| `PhotocardEditor.jsx` | Direct-manipulation canvas: select / drag / 8 resize handles / rulers / snap-to-guides / element chips / canvas-resize / live readout |
| `StudioControls.jsx` | Styling-only side panel (per-section controls + Layer panel + Field legend + Ad Manager picker) |
| `TemplateThumb.jsx` | Small live-rendered template preview |
| `PhotoCardModal.jsx` | All-News consumer: pick a saved template, render the real article, download |

Page: `resources/js/features/admin/pages/photocard/PhotocardStudio.jsx`.

## 5. Config schema (per template)

Top-left coordinate boxes everywhere `{x, y, width, height}`. **Every image element
(photo, ad banner, image layer, logo, icon) is a free box** — independent width &
height, drag any side (legacy logo/icon `size` auto-migrates to width/height). Only
the background image is full-canvas. Colors may be hex or `rgba()` (per-color opacity).

```
canvas:    { width, height, radius }   // radius rounds the whole card (transparent corners on PNG)
background:{ type:solid|gradient|image, color, gradient*, imageUrl, imageOpacity, fit }
photo:     { enabled, x,y,width,height, radius, fit, zoom, offsetX, offsetY,
             overlayColor, overlayOpacity, fade:{enabled,color,opacity,height} }
panel:     { enabled, x,y,width,height, type, color, gradient*, feather:{enabled,height} }
logo:      { enabled, source:site|custom, imageUrl, x,y,width,height,
             shape:square(=rectangle)|circle(=oval), fit, zoom, offsetX, offsetY, borderColor, borderWidth, radius }
headline:  { enabled, source:title|title_en|custom, customText, font,size,weight,color,
             align, x,y,width, lineHeight, maxLines, shadow:{…} }
cta:       { enabled, text, font,size,weight,color, align, x,y,width }
urlText:   { enabled, text, font,size,weight,color, align, x,y,width }   // empty text → {{site_url}}
dateText:  { enabled, font,size,weight,color, align, x,y,width }
adBanner:  { enabled, x,y,width,height, bgType, bgColor, gradient*, imageUrl, fit,
             text, textColor, textSize, textFont, textWeight, textAlign }
layers: [  // z-order = array order (later = front)
  text  { id,type, text, font,size,weight,color, align, x,y,width, lineHeight,maxLines, rotation,opacity, shadow, hidden,locked }
  image { id,type, imageUrl, x,y,width,height, radius, fit,zoom,offsetX,offsetY, rotation,opacity, hidden,locked }
  rect  { id,type, color, x,y,width,height, radius, rotation,opacity, hidden,locked }
  icon  { id,type, icon, color, x,y,width,height, rotation,opacity, hidden,locked }
  social{ id,type, x,y,width,height, bg, style:badge|plain, iconColor, glyphColor,
          showLabels, labelColor, labelCase:none|upper|lower|title|sentence, labelSize(0=auto),
          labels:{platform:override}, font, size, gap, align, source:manual|auto, platforms[], hidden,locked }
]
```

## 6. Element model & rendering

- `listElements(config)` → visible, drawable elements (skips disabled core + hidden layers).
- `listAllElements(config)` → everything (Layer panel; includes `visible`/`locked`).
- `elementBox(config, key)` → `{x,y,w,h}`; `setElementBox(config, key, box)` → immutable patch
  (text scales font with box height; all images incl. logo/icon are free boxes).
- `drawConfig(canvas, config, data, settings, getImg)` → synchronous draw in order:
  background → photo → panel (+feather blend) → adBanner → logo → headline → cta → url → date → layers.
- **Flicker fix:** images cached module-wide; editor redraws synchronously on every drag tick (no reload).
- **Image fit:** `drawImageFit` supports `cover | contain | stretch` + zoom/offset.
- **Card radius:** `drawConfig` clips the whole canvas to `canvas.radius` (rounded, transparent corners on PNG).
- **Social bar:** real vector brand icons (`SOCIAL_PLATFORMS`); per-platform label override
  (`labels`, empty = brand default), `labelCase` text-transform (Latin only), selectable label
  `font`, and `labelSize` (0 = auto, tied to icon size) — via `transformCase`/`labelOf` in `drawSocial`.

## 7. Dynamic fields (tokens)

Any text/image value may contain `{{token}}`, resolved at render from
`buildContext(data, settings)`:

- Article: `{{title}}`, `{{title_en}}`, `{{date}}`, `{{category}}`, `{{featured_image}}`
- Settings (all public settings): `{{site_name}}`, `{{site_logo}}`, `{{site_url}}` (falls back to `window.host`), `{{facebook_url}}`, `{{contact_phone}}`, …
- Ads: `{{ad:<position>}}` → that position's active ad image (from `settings.ads`)

Images can bind to a system image via `ImageSourceField` (custom upload / `{{site_logo}}` /
`{{featured_image}}` / `{{og_default_image}}`).

**Ad banner — static vs dynamic** (`AdManagerPicker`, fed by `ads()` = active image ads,
treating a NULL start/end date as "no limit"; Ad Manager has `photocard_top`/`photocard_bottom`
positions):
- **Pick specific ad** → stores that ad's image URL in the config (a snapshot; external URLs
  are localized via `importUrl` to avoid canvas CORS taint). Stays even if the ad later expires.
- **Dynamic `{{ad:position}}`** → resolves to the current active ad for that position at render
  time; if none active, the banner shows no image (just its background).

## 8. Editor UX

Direct manipulation on the canvas; the side panel is styling-only.
- Select: click topmost element (or chip / Layer-panel row); **Alt+click (or right-click) cycles
  through stacked elements**. Drag to move · 8 small handles to resize · Esc to deselect.
- Rulers (px) with the selected element's extent highlighted + snap-to-guides (canvas center/edges
  + other elements) + live `x,y · w×h` readout.
- Canvas (document) resizable via the "Canvas" chip (right/bottom/corner) or W/H number inputs.
- Boxes also have **W/H number inputs** (precise/thin sizes; min 2px). Every color has an **opacity** slider.
- Undo/Redo (Ctrl+Z / Ctrl+Shift+Z), arrow-nudge, Delete, Ctrl+D.
- Layer panel: reorder / show-hide / lock. Locked elements render but aren't draggable.
- Unsaved-changes badge + `beforeunload` guard.
- **Viewport-locked layout:** the studio fills the screen (measured grid height); only the
  controls/template columns scroll — the page itself never scrolls and the canvas stays put.
- **New template:** the "New" button offers **Default** (photo/panel/logo/headline on) or
  **Blank** (all elements off, plain white canvas). After a create, the studio selects the
  newest template by **id** (not name) so the next save UPDATEs it — no duplicate rows. A
  `savingRef` guard also blocks double-submit. CRUD redirects to the index route (clean URL).

## 9. Consumer (download from news list)

`PhotoCardModal.jsx` on the **All News** page (purple image icon per row): fetches active
templates via `apiList`, shows thumbnail picker, renders the chosen template with the real
article, downloads PNG/JPG. The card downloads with whatever corner radius the template
defines (no per-download toggle). Article list (`ArticleController@index`) already supplies
`title`, `title_en`, `slug`, `featured_image`, `published_at`.

## 10. Key design decision

**Hybrid, not full free-form Canva.** Structured, data-bound blocks (headline/photo/logo/date
auto-fill per article) + drag + an "add custom layer" escape hatch. Full free-form was rejected
because anonymous layers break per-article auto-fill (would need a layer-tagging system first).

## 11. Fonts

Bengali fonts (render bn + en): SolaimanLipi, Kalpurush, Noto Sans Bengali, Hind Siliguri,
Anek Bangla, Baloo Da 2, Tiro Bangla, Galada. English-only: Playfair Display, Merriweather,
Montserrat, Poppins, Roboto, Oswald. Latin fonts have no Bengali glyphs → fall back to the
Bengali stack on Bengali text.

## 12. Deploy notes

- Run the migration (`php artisan migrate`) and `php artisan db:seed --class=PhotocardTemplateSeeder`.
- `npm run build`. Requires `guzzlehttp/guzzle` (already present) for `importUrl`.
- Dynamic `{{ad:position}}` pointing at external ad URLs may taint the canvas on download —
  prefer ads whose images live on `/storage` (or localize them).
