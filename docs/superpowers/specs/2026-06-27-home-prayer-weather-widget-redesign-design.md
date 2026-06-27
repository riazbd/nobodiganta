# Homepage Prayer & Weather Widget — Redesign to Match Mockup

**Date:** 2026-06-27
**Status:** Approved (design)

## Problem

The client supplied a polished mockup (`namaz-weather-green.html`) for the
homepage prayer + weather widget. The current widget
(`resources/js/Components/home/PrayerWeatherSection.jsx`) shows the same data
but with a plainer look. We need the widget to match the mockup.

## Decisions (confirmed)

- **Font:** use the site's existing Bengali font (SolaimanLipi/Noto), not the
  mockup's Google Fonts. Match the mockup's layout/colors, not its typeface.
- **Language:** bilingual — Bengali on the bn edition, English on the en
  edition (keep current language-aware behavior).

## Scope

Frontend-only **visual rebuild** of the existing widget + its CSS. No backend
changes: the data layer (`/api/prayer`, weather fetch, geolocation, city
select, `lib/prayerUtils.js`) is already complete and stays as-is.

## Current State (analysis)

- Rendered on the homepage sidebar aside: `Pages/Home.jsx` →
  `<PrayerWeatherSection initialPrayer={prayerTimes} initialWeather={weather} />`.
- The component already provides: city dropdown + GPS locate (localStorage
  persistence), live prayer timings, current/next prayer, 1s countdown, current
  weather, 3-day forecast, next sun event, "full schedule" navigation, and
  bilingual labels via `prayerUtils` (`prayerLabel`, `findCurrentPrayer`,
  `findNextPrayer`, `findNextSunEvent`, `formatCountdown`, `formatTime12h`,
  `toBn`, `PRAYER_ORDER`).
- Data shapes (unchanged): `prayer.timings` keyed `Fajr/Sunrise/Dhuhr/Asr/
  Sunset/Maghrib/Isha/Imsak` ("HH:MM"), `prayer.is_ramadan`;
  `weather.current{temp_c,condition_bn,condition_en,humidity,wind_kph,weather_code}`,
  `weather.forecast[]{date,max_c,weather_code,...}`.
- Existing CSS lives under the `.pw-*` namespace in `resources/css/app.css`.

## What the mockup adds over the current widget

1. **Dark-gradient hero** (night→forest→emerald→gold) with faint star specks
   and a Rub-el-Hizb medallion watermark.
2. **Sun-path arc** — an SVG sine curve spanning Fajr→Isha with a dot per
   prayer positioned by time-of-day, the current prayer marked by a gold dot +
   pulsing ring, and small labels (name + time) under each dot.
3. **Large countdown** to the next prayer + a "next starts · <time>" line and a
   status row ("<current> ওয়াক্ত চলছে").
4. **Full 5-waqt strip** (Fajr, Dhuhr, Asr, Maghrib, Isha) — current chip
   filled green, next chip green-outlined (replaces the current next-3 grid).
5. Weather block, 3-day forecast, and footer (sunset + full-schedule link) —
   same data, restyled to the mockup.

## Implementation

### Component — rewrite `Components/home/PrayerWeatherSection.jsx`

Keep all existing state/effects (city, gpsCoords, prayer, weather, loading,
`load()`, geolocation, localStorage, `useCountdown`). Replace the returned JSX
with the mockup's structure, driven by live data:

- **Header:** title + location pill containing the existing city `<select>` and
  the GPS locate button (preserve current functionality; the mockup's static
  "আপনার এলাকা" becomes the live city label/select).
- **Arc:** a small helper builds the SVG from real timings.
  - Map each of the 5 prayers to minutes-from-midnight (parse "HH:MM").
  - Normalize `t = (minutes − fajrMin) / (ishaMin − fajrMin)` to 0..1, position
    on a sine curve (same geometry as the mockup: baseline/amp/X range).
  - Mark the current prayer (`findCurrentPrayer`) with a gold dot + `.pulse-ring`;
    the next prayer (`findNextPrayer`) with a lighter dot; others faint. During
    a gap (no current prayer), highlight the upcoming one.
  - Labels rendered as absolutely-positioned divs (name + time) like the mockup.
- **Countdown block:** status row (current/upcoming), "<next> বাকি / in" label,
  big `formatCountdown` value (Bengali numerals on bn), and "<next> শুরু ·
  <time>".
- **5-waqt strip:** map `PRAYER_ORDER`; current → filled, next → outlined;
  Ramadan iftar labeling preserved for Maghrib.
- **Weather + forecast + footer:** reuse current logic (lucide `WeatherIcon`
  map, `forecast.slice(1,4)`, `findNextSunEvent`).
- Graceful states: loading placeholders when `prayer`/`weather` are null; hide
  weather/forecast blocks when absent.

### Styling — `resources/css/app.css`

- Remove the now-unused `.pw-*` block and add a **new `.nw-*` namespace**
  (namaz-weather) so the mockup's otherwise-generic class names (hero, arc,
  waqt, weather, forecast, foot…) cannot collide with global styles.
- Port the mockup's CSS variables (greens/gold/paper), gradient hero, star
  specks, medallion, arc labels, countdown, waqt chips, weather rows, forecast,
  footer, and the `pulse` keyframe (gated by
  `@media (prefers-reduced-motion: no-preference)` exactly as the mockup).
- **Font:** use the site's Bengali font stack instead of Hind Siliguri/Tiro
  Bangla.
- **Width:** fluid to fill the sidebar aside (not a fixed 420px); the mockup's
  proportions/radii are kept. Keep it readable down to mobile widths.

## Out of Scope

- No backend/API/service changes.
- No changes to the full Prayer Times page (`Pages/PrayerTimes.jsx`).
- No new fonts.

## Edge Cases

- Prayer data not yet loaded → arc/strip show a loading placeholder.
- Gap between prayers (e.g. Sunrise→Dhuhr) → no current dot; highlight upcoming.
- After Isha → next prayer is tomorrow's Fajr (handled by `findNextPrayer`).
- Missing Sunset in cached timings → footer falls back via `findNextSunEvent`.
- English edition → all labels/numerals render in English.
- Reduced motion → pulse ring animation disabled.

## Testing

Manual on the homepage (bn and en): widget matches the mockup's layout/colors;
arc dots sit at the right positions with the current prayer pulsing; countdown
ticks each second; the 5-waqt strip highlights current/next; city change and
GPS locate refresh prayer + weather; weather, forecast, and sunset render from
live data; "full schedule" navigates to the prayer-times page.
