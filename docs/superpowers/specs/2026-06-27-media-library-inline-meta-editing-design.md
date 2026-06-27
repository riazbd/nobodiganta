# Media Library — Direct (Auto-Save) Metadata Editing

**Date:** 2026-06-27
**Status:** Approved (design)

## Problem

In the Media Library detail modal, metadata is shown **read-only**. To change
anything (alt text, caption, credit, source, license, edition) the user must
click an **"Edit"** button to toggle the panel into a form, then **Save**. The
client wants to drop that extra "Edit" step — metadata should be editable
directly.

## Decisions (confirmed)

- **Where:** In the existing detail modal (not inline in the grid).
- **Save behavior:** Auto-save on blur (debounced per dirty field), with a
  small `Saving… / Saved` status indicator. No "Edit" button, no read-only view.

## Approach

Collapse the modal's read-only view and edit form into a single, always-editable
panel, and save changes automatically. The existing `PUT admin.media.update`
endpoint validates `license_type` and `edition` as **required**, so each save
sends the **full** current field set (all values are present in the modal) —
**no backend change needed**.

## Changes — `resources/js/features/admin/pages/media/MediaLibrary.jsx`

### State

- Remove `isEditing` state and the `startEditing()` helper.
- Keep `editData` as the live form state; initialize it from `selectedMedia`
  whenever the modal opens (a `useEffect` keyed on `selectedMedia?.id`).
- Add a `savedRef` (useRef) holding the last-persisted values, for per-field
  dirty checks.
- Add `saveStatus` state: `'idle' | 'saving' | 'saved' | 'error'`.

### Detail modal — right column

Replace the `!isEditing ? (read-only) : (form)` branch with a single block of
editable controls:
- Text inputs: Alt (BN), Alt (EN), Credit (BN), Credit (EN), Source Link.
- Textareas: Caption (BN), Caption (EN).
- Select: License.
- Button group: Edition (bn / en / both).

Keep the picker-mode **Select** button (when `onSelect` is provided) and the
**Delete** button at the bottom.

### Saving

- `saveMeta()` — `PUT route('admin.media.update', { media: selectedMedia.id })`
  with the full `editData`; on success set `selectedMedia` from the response,
  update `savedRef`, and set `saveStatus` to `'saved'` (auto-reset to `'idle'`
  after ~1.5s); on failure set `'error'` and show an error toast (the edited
  value is kept for retry).
- Text/textarea fields call `saveMeta()` **on blur**, but only if the field's
  value differs from `savedRef` (skip no-op saves).
- License `select` and Edition buttons call `saveMeta()` immediately **on
  change** (they have no meaningful blur).
- Guard against overlapping requests (ignore a new save while one is in flight
  for the same field is unnecessary; a simple in-flight flag plus the dirty
  check is sufficient).

### Status indicator

Small text near the modal title: `Saving…` while a request is in flight,
`Saved` briefly after success. Errors surface via the existing `useToast`.

### List freshness

Do **not** reload the grid on every save (jarring). Update `selectedMedia`
locally per save; run a single `router.reload({ only: ['media'] })` when the
modal closes so grid captions/thumbnails reflect the edits.

## Out of Scope

- Inline editing directly in the grid/list cards.
- Changes to the Upload modal (untouched).
- Backend/controller/validation changes.

## Backward Compatibility & Notes

- The `PUT admin.media.update` contract is unchanged; non-media-library callers
  are unaffected.
- Auto-save creates one audit-log entry per changed field per editing session —
  slightly more entries than the previous single-save flow, but only for fields
  that actually changed.

## Testing

Manual: open a media item → fields are immediately editable (no Edit button) →
change alt text and click away → indicator shows Saving… then Saved → reopen
the item and confirm the value persisted → change License/Edition → saves
immediately → close modal → grid reflects updated caption. Verify a failed save
shows an error toast and keeps the edited value.
