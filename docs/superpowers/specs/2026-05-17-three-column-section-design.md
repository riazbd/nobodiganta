# Three-Column Section & Robust Poll System

**Date:** 2026-05-17
**Status:** Approved

---

## Overview

Replace the existing `TabbedSection` on the homepage with a new three-column section (`ThreeColumnSection`) matching the reference design. Simultaneously upgrade the `PollWidget` to a full API-driven, production-grade component. Swap the hero right column contents (stories ↔ TrendingWidget).

---

## 1. Layout Changes

### Hero Right Column (HeroBlock)
**Before:** SocialFollow → Video StoryCarousel → Photo StoryCarousel
**After:** SocialFollow → TrendingWidget

- `TrendingWidget` is rendered here in addition to its existing location in `PageSidebar` (both instances fetch independently — no prop drilling needed)
- `StoryCarousel` components and `StoryViewer` are removed from `HeroBlock`

### New ThreeColumnSection (replaces TabbedSection)
Location: `resources/js/features/home/ThreeColumnSection.jsx`

```
ThreeColumnSection
  ├── Col 1 (Opinion)   — OpinionColumn component
  ├── Col 2 (Poll)      — PollWidget component (upgraded)
  └── Col 3 (Stories)  — StoriesPanel component (moved from hero)
```

- **Col 1** width: ~30%
- **Col 2** width: ~36%
- **Col 3** width: ~34%
- On mobile (< 768px): single column stack, order Opinion → Poll → Stories
- CSS wrapper class: `htcs-wrap`
- `TabbedSection` component and its CSS (`.p-tabs`, `.p-tab-*`) remain in the file but are no longer rendered (can be cleaned up later)

---

## 2. Opinion Column

### Component
`OpinionColumn` — defined inside `ThreeColumnSection.jsx`

### Data
Fetches `GET /api/opinions?limit=6` on mount. Falls back gracefully if empty.

### Display
- Section header: red left-border accent + "মতামত" label + "আরও »" link → `/opinion` category page
- Shows **3 cards per page**, dot navigation at bottom (3 dots max)
- Auto-advances every **5 seconds**, pauses on hover/focus
- Card layout:
  - Circular author avatar (72px, fallback placeholder)
  - Author name (bold, 16px)
  - Designation (muted, 13px)
  - Article title (Bengali SolaimanLipi, 17px, max 3 lines)
  - Short excerpt (muted, 14px, max 2 lines, if available)
  - Bottom border separator between cards
- Click on card → navigate to opinion article via `onNavigate('article', { categorySlug, articleSlug })`

### CSS prefix: `htcs-op-`

---

## 3. Poll Widget (Upgraded)

### Component
`resources/js/Components/widgets/PollWidget.jsx` — full rewrite, API-driven

### Data Flow
1. On mount: `GET /api/poll` → fetch active poll
2. Check `localStorage.getItem('poll_voted_${poll.id}')`:
   - If found: render **results view** immediately (no network vote needed)
   - If not found: render **voting view**
3. On vote: `POST /api/poll/{id}/vote` with `{ option_id }`
   - Backend increments `votes` atomically, returns `{ options: [{id, votes}] }`
   - Set `localStorage.setItem('poll_voted_${poll.id}', option_id)`
   - Transition to results view with animation

### Display — Voting View
- Featured image (full width, 180px tall, `object-fit: cover`) — only if `featured_image` is set
- Top row: clock icon + formatted datetime + download icon (right-aligned)
- Question text (bold, SolaimanLipi, 18px)
- Options as radio rows: radio circle + label text, no percentage shown yet
- Total vote count: "মোট ভোটদাতাঃ X জন" (Bengali numerals)

### Display — Results View
- Same image + datetime header
- Same question
- Each option row:
  - Radio circle (filled/outlined) + label + percentage (right-aligned, red if selected)
  - Animated progress bar beneath (transitions width over 0.5s on first render)
  - Winning option bar is red (`var(--primary)`), others are grey
- Total vote count
- Share button (bottom center): uses `navigator.share` if available, falls back to copying current URL + poll question to clipboard; green circular button matching design

### States
- **Loading:** skeleton placeholder (image skeleton + 3 option skeletons)
- **No active poll:** renders `null` (nothing shown)
- **Poll closed** (`end_date` in past): shows results view, voting disabled, shows "ভোট গ্রহণ শেষ" badge

### CSS
Extend existing `.poll-*` classes. New classes prefixed `poll-` (image, share button, progress bar, closed badge).

---

## 4. Stories Panel (Col 3)

### Component
`StoriesPanel` — defined inside `ThreeColumnSection.jsx`

`StoryCarousel` is currently a local (non-exported) function in `Home.jsx`. It must be **extracted** to `resources/js/Components/media/StoryCarousel.jsx` and exported so both `Home.jsx` and `ThreeColumnSection.jsx` can import it. `StoryViewer` is already a standalone component at `Components/StoryViewer.jsx` — no change needed there.

### Data
Receives `stories` prop from `Home.jsx` (same `heroStories` array previously passed to `HeroBlock`). `HeroBlock` no longer receives the `stories` prop.

### Display
- "ভিডিও স্টোরি" carousel (video stories)
- "ফটো স্টোরি" carousel (photo stories)
- `StoryViewer` fullscreen overlay on click
- Reuses all existing `hp-h3-carousel-sec`, `hp-h3-scroll`, `hp-h3-scard` CSS — zero new styles needed

---

## 5. Backend Changes

### 5a. Migration — Add `featured_image` to polls
File: `database/migrations/YYYY_MM_DD_HHMMSS_add_featured_image_to_polls_table.php`

```php
Schema::table('polls', function (Blueprint $table) {
    $table->string('featured_image')->nullable()->after('total_votes');
});
```

Add `'featured_image'` to `Poll::$fillable`.

### 5b. New Vote Route
```php
// web.php
Route::post('/api/poll/{poll}/vote', [NewsController::class, 'apiPollVote'])
    ->name('api.poll.vote')
    ->whereNumber('poll');
```

### 5c. `apiPollVote` Method (NewsController)
```
- Validate: option_id required, must belong to this poll
- Atomically increment: PollOption::where('id', $optionId)->increment('votes')
- Also increment: Poll::where('id', $poll->id)->increment('total_votes')
- Return: { options: [{ id, votes }] } for all options of this poll
```

No IP tracking. No `poll_votes` table. Vote deduplication is client-side (localStorage).

### 5d. Update `apiPoll` Response
Add `featured_image` and `created_at` to the response payload so the frontend can display the image and datetime.

---

## 6. Home.jsx Changes

1. Remove `<TabbedSection ... />` render call (keep component definition for now)
2. Pass `stories={heroStories}` to `ThreeColumnSection` instead of `HeroBlock`
3. Remove `stories` prop from `HeroBlock` call
4. Add `<TrendingWidget />` inside `HeroBlock` right column (after `SocialFollow`)
5. Import `ThreeColumnSection` and render it after the video section

### Render order (p-body):
```
VideoSection (if present)
ThreeColumnSection          ← new, replaces TabbedSection
CategorySections
TagsCloud
Ads
```

---

## 7. CSS Summary

| Prefix | Where | Purpose |
|---|---|---|
| `htcs-` | new | ThreeColumnSection wrapper + grid |
| `htcs-op-` | new | Opinion column cards, dots, carousel |
| `poll-` | extend | Rich poll widget (image, bars, share, closed) |
| `hp-h3-*` | unchanged | Stories carousel (reused) |
| `p-tab-*` | unchanged | TabbedSection (dormant, not rendered) |

---

## 8. File Checklist

**Create:**
- `resources/js/features/home/ThreeColumnSection.jsx`
- `resources/js/Components/media/StoryCarousel.jsx` (extracted from Home.jsx)
- `database/migrations/..._add_featured_image_to_polls_table.php`

**Modify:**
- `resources/js/Pages/Home.jsx` — swap TabbedSection, adjust HeroBlock props
- `resources/js/Components/widgets/PollWidget.jsx` — full API-driven rewrite
- `app/Models/Poll.php` — add `featured_image` to `$fillable`
- `app/Http/Controllers/NewsController.php` — add `apiPollVote`, update `apiPoll`
- `routes/web.php` — add vote route
- `resources/css/app.css` — new `htcs-` classes, extended `poll-` classes
