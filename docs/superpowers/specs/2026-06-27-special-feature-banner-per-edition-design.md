# Special Feature Section — Separate Banner per Edition

**Date:** 2026-06-27
**Status:** Approved (design)

## Problem

The Special Feature homepage section renders a single banner image
(`config.banner_image`) that is shown identically in both the Bangla and
English editions. Editors need to show a **different banner per edition** —
typically because the banner graphic has title/branding text baked into the
image in the respective language.

## Goal

Allow editors to upload a separate English banner for a Special Feature
section, while keeping the existing banner as the Bangla banner. The change
must be backward compatible: existing sections continue to render their
current banner in both editions until an English banner is added.

## Approach

Follow the existing `_bn`/`_en` config convention already used in this section
(`badge_label_bn`/`badge_label_en`, `title_bn`/`title_en`). Add a new config
field `banner_image_en`; the existing `banner_image` is treated as the Bangla
banner. Banner config lives in the section's JSON `config` blob, so no database
migration is required.

## Changes

### 1. Defaults — `SpecialFeatureSection.jsx` (`SF_DEFAULTS`)

Add `banner_image_en: null` alongside the existing `banner_image: null`.

### 2. Public rendering — `SpecialFeatureSection.jsx`

Select the banner source by edition, with fallback to the Bangla banner so
existing sections keep working in the English edition:

```js
const bannerSrc = lang === 'bn'
  ? cfg.banner_image
  : (cfg.banner_image_en || cfg.banner_image);
```

Pass `bannerSrc` to `SFBanner`. The single `show_banner` toggle continues to
control banner visibility for both editions (one toggle, edition-specific
source).

### 3. Admin editor — `HomepageLayout.jsx`

Inside the existing "Banner Image" block (rendered when `show_banner !== false`),
render **two** upload slots, clearly labeled:

- **Bangla Banner** → binds to `banner_image`. Uses the existing
  `handleBannerUpload` / `handleBannerRemove` handlers and `uploadingBanner`
  state, unchanged.
- **English Banner** → binds to `banner_image_en`. New handlers
  `handleBannerEnUpload` / `handleBannerEnRemove` mirroring the existing ones,
  plus a new `uploadingBannerEn` state flag. A short note clarifies that this
  banner falls back to the Bangla banner if left empty.

Both slots reuse the existing generic upload route
(`admin.homepage-layout.upload-banner`) and delete route
(`admin.homepage-layout.delete-banner`). The recommended aspect-ratio hint text
is shared and unchanged.

### 4. Backend

No changes. The upload/delete routes are generic (they handle an arbitrary
image file/URL), and the config is stored as JSON, so no controller, model, or
migration changes are needed.

## Out of Scope

- No renaming of the existing `banner_image` field.
- No separate `show_banner` toggle per edition (one toggle controls both).
- No database/backend changes.

## Backward Compatibility

Existing sections have only `banner_image` set. In the Bangla edition they
render unchanged; in the English edition they fall back to `banner_image`,
so behavior is identical until an editor uploads an English banner.
