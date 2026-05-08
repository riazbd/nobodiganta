# Photo & Video Stories Feature — Design Spec

**Date:** 2026-05-08  
**Status:** Approved  

---

## Context

Provati needs an Instagram/Facebook-style Stories feature — a format where staff publish sequences of photos and/or videos that readers tap/click through in a full-screen immersive viewer. Stories appear as a horizontal strip of circular bubbles on the homepage (as a configurable section between other sections) and on a dedicated `/stories` page. The feature is fully permission-based with a publish gate and optional auto-expiry with permission-based restoration.

---

## Database Schema

### `stories` table
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| title_bn | string | Bangla title |
| title_en | string nullable | English title |
| slug | string unique | URL-safe identifier |
| cover_media_id | FK → media | Thumbnail shown in story bubble |
| status | enum | `draft`, `published`, `expired`, `archived` |
| expires_at | datetime nullable | null = never expires |
| published_at | datetime nullable | When story was published |
| created_by | FK → users | |
| published_by | FK → users nullable | |
| edition | enum | `bn`, `en`, `both` |
| view_count | unsignedInt default 0 | |
| created_at / updated_at | timestamps | |

### `story_slides` table
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| story_id | FK → stories | Cascade delete |
| sort_order | unsignedTinyInt | Controls slide sequence |
| media_id | FK → media | Photo or video |
| text_overlay_bn | string nullable | Caption shown on slide |
| text_overlay_en | string nullable | |
| linked_article_id | FK → articles nullable | "Read full story" button |
| duration | unsignedTinyInt default 5 | Seconds (photos only; videos auto-advance on end) |
| created_at / updated_at | timestamps | |

---

## Models

### `App\Models\Story`
- Relationships: `belongsTo` User (created_by, published_by), `belongsTo` Media (cover), `hasMany` StorySlide
- Scopes: `published()`, `expired()`, `forEdition($edition)`
- Methods: `getTitle($edition)`, `isExpired()`, `publish(User $by)`, `restore(User $by)`
- Auto-expiry: `isExpired()` checks `expires_at`; a scheduled command or query scope sets `status = expired` when past

### `App\Models\StorySlide`
- Relationships: `belongsTo` Story, `belongsTo` Media, `belongsTo` Article (linked_article)
- Ordered by `sort_order` by default

---

## Permissions

Six new permissions added to the permission seeder:

| Permission | Roles |
|---|---|
| `stories.view_any` | All authenticated staff |
| `stories.create` | Reporter, Editor, Admin |
| `stories.edit` | Editor, Admin (reporters can edit own) |
| `stories.delete` | Editor, Admin |
| `stories.publish` | Editor, Admin only |
| `stories.restore_expired` | Editor, Admin only |

The `stories.publish` gate prevents reporters from publishing directly — a draft must be approved by an editor or admin. Expired stories can only be restored by users with `stories.restore_expired`.

---

## Routes & Controllers

### Public Routes (`routes/web.php`)
```
GET  /stories              → StoriesController@index
GET  /en/stories           → StoriesController@index (English edition)
GET  /api/stories          → StoriesController@apiIndex  (JSON for homepage section)
```

### Admin Routes (auth + permissions middleware)
```
GET    /admin/stories                        → Admin\StoryController@index
GET    /admin/stories/create                 → Admin\StoryController@create
POST   /admin/stories                        → Admin\StoryController@store
GET    /admin/stories/{id}/edit              → Admin\StoryController@edit
PUT    /admin/stories/{id}                   → Admin\StoryController@update
DELETE /admin/stories/{id}                   → Admin\StoryController@destroy
POST   /admin/stories/{id}/publish           → Admin\StoryController@publish      [stories.publish]
POST   /admin/stories/{id}/restore           → Admin\StoryController@restore      [stories.restore_expired]
POST   /admin/stories/{id}/slides            → Admin\StorySlideController@store
PUT    /admin/stories/{id}/slides/{slide}    → Admin\StorySlideController@update
DELETE /admin/stories/{id}/slides/{slide}    → Admin\StorySlideController@destroy
POST   /admin/stories/{id}/slides/reorder    → Admin\StorySlideController@reorder
```

### Controllers
- `app/Http/Controllers/StoriesController.php` — public stories page + API
- `app/Http/Controllers/Admin/StoryController.php` — admin CRUD, publish, restore
- `app/Http/Controllers/Admin/StorySlideController.php` — slide management + reorder

---

## Frontend Components

### Public
| File | Purpose |
|---|---|
| `resources/js/Pages/Stories.jsx` | Dedicated `/stories` page — 3-column 9:16 grid of all published stories |
| `resources/js/Components/StoryStrip.jsx` | Horizontal row of circular story bubbles — used inside homepage sections |
| `resources/js/Components/StoryViewer.jsx` | Full-screen overlay viewer — progress bars, tap/click to navigate, auto-advance, close button |

**StoryViewer behaviour:**
- Progress bar at top with one segment per slide
- Photo slides auto-advance after `duration` seconds
- Video slides auto-advance when video ends
- Tap/click left third = previous slide, right third = next slide
- Keyboard: ArrowLeft / ArrowRight / Escape
- Text overlay rendered at bottom of slide
- "পুরো খবর পড়ুন →" button appears if slide has `linked_article_id`
- Swipe support (touch events) for mobile

### HomepageSection Integration
- Add `type: 'stories'` to HomepageSection enum
- `NewsController@home` fetches published stories when a section of this type exists
- `StoryStrip` renders when section type is `stories`
- Editors position the strip anywhere between sections via the existing HomepageSection admin

### Admin
| File | Purpose |
|---|---|
| `resources/js/Pages/Admin/Stories/Index.jsx` | List with filter tabs: সব / প্রকাশিত / ড্রাফট / মেয়াদোত্তীর্ণ |
| `resources/js/Pages/Admin/Stories/Form.jsx` | Story editor: metadata panel (title, cover, expiry) + drag-to-reorder slide builder |
| `resources/js/Pages/Admin/Stories/SlideModal.jsx` | Modal to add/edit a slide — media picker, text overlay, article link, duration |

---

## Auto-Expiry

- A Laravel scheduled command `stories:expire` runs daily (or every hour) and sets `status = expired` for stories where `expires_at <= now()` and `status = published`
- Register in `app/Console/Kernel.php`
- Expired stories are hidden from public but visible in admin under the "মেয়াদোত্তীর্ণ" tab
- Restore sets `status = published`, clears or extends `expires_at`, logs the restoring user in `published_by`

---

## Verification

1. **Migrations:** Run `php artisan migrate` — both tables created without errors
2. **Permissions:** Run permission seeder — 6 new permissions appear in `permissions` table, assigned to correct roles
3. **Admin flow:** Log in as reporter → create story + slides → cannot see Publish button → log in as editor → publish → story appears publicly
4. **Homepage section:** Add a `stories` type section in HomepageSection admin → verify StoryStrip renders on homepage at correct position
5. **Story viewer:** Click a story bubble → full-screen overlay opens → progress bars animate → photo auto-advances → video plays and advances → tap zones work → Escape closes
6. **Expiry:** Set a story to expire 1 minute in the future → run `php artisan stories:expire` → story disappears from public → visible in admin as expired → restore with editor account → story reappears
7. **Edition:** Publish a `bn`-only story → verify it does not appear on `/en/stories`
