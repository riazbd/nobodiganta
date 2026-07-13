# Admin Category Dropdown UX + Child Sorting — Design

**Date:** 2026-07-13
**Status:** Approved, implementing

## Problem

Three related admin UX issues around categories:

1. **Parent-Category selector** (category add/edit form, `CategoryList.jsx`) is a
   native `<select>` listing *all* categories flat — parents and children (children
   prefixed `↳`), with no search. Children are selectable as parents even though the
   site is 2-level; parent/child mix is confusing.
2. **Child categories can't be sorted.** Drag-to-reorder works only for top-level
   rows; subcategory rows are explicitly not draggable.
3. **AllNews category filter** (`AllNews.jsx`) is a native `<Select>` listing every
   category flat — no parent/child grouping, no search.

## Goals

- One reusable, searchable, hierarchy-aware category dropdown, used in both places.
- Parent selector offers only valid parents (top-level), searchable.
- AllNews filter shows a clear parent → child hierarchy, searchable.
- Subcategories are drag-sortable within their parent.

## Decisions

- **2-level rule:** only top-level categories may be parents (children not offered
  in the Parent selector). Matches the public site's 2-level nav.
- **Custom lightweight combobox** (no new dependency), for full control of the
  grouped/indented look; reused in both surfaces.

## Component: `CategorySelect`

New `resources/js/features/admin/components/forms/CategorySelect.jsx`.

Props:
- `value` — currently selected value (string/number/'').
- `onChange(value)`.
- `items` — ordered flat array `[{ value, label, isChild }]` (all selectable). The
  parent builds this per surface (see below).
- `topOption` — `{ value, label }` always shown first (e.g. "None (Main)" or
  "All Categories").
- `placeholder`, `searchPlaceholder`, `buttonClassName` (optional).

Behaviour:
- A button shows the selected item's label (or placeholder).
- Clicking opens a panel: a search input (autofocused) + a scrollable list.
- `topOption` renders first; then `items`. Children (`isChild`) are indented and
  lighter; parents are bold.
- Search filters `items` by case-insensitive label match; `topOption` always shows.
- Selecting an item calls `onChange(value)` and closes.
- Closes on outside-click and Esc. Basic keyboard: ↑/↓ move highlight, Enter selects.
- Themed with the existing admin token classes (works in light/dark).

### Usage

- **Parent selector** (`CategoryList.jsx`): `value = catParentId` (id);
  `items` = top-level categories only, excluding the category being edited;
  `topOption = { value: '', label: 'None (Main Category)' }`.
- **AllNews filter** (`AllNews.jsx`): `value = category` (slug);
  `items` = parents and their children interleaved (parent, its children, …), all
  `value = slug`; children `isChild: true`; `topOption = { value: 'all', label:
  'All Categories' }`. Selecting still calls `applyFilters`.

## Child sorting (`CategoryList.jsx`)

- Make subcategory rows `draggable` with the same drag handlers.
- On drag end, resolve the dragged and target categories:
  - both top-level → reorder roots (existing behaviour), or
  - both share the same `parentId` → reorder that parent's children,
  - otherwise ignore (no cross-group moves).
- Post the reordered group to the existing `POST /admin/categories/reorder`
  (`{ categories: [{ id, sort_order }] }`), optimistic update as today.

## Files

- `resources/js/features/admin/components/forms/CategorySelect.jsx` (new)
- `resources/js/features/admin/pages/categories/CategoryList.jsx` (parent selector +
  child drag-sort)
- `resources/js/features/admin/pages/content/AllNews.jsx` (filter)

## Non-goals

- Backend/schema changes (reorder endpoint already exists; sort_order already stored).
- Deeper than 2-level nesting.

## Verification

- `npm run build` clean.
- Parent selector: opens, searchable, lists only top-level parents + "None"; editing
  a category can't pick itself; saving persists the parent.
- AllNews filter: searchable, parent→child indented; selecting a parent or child
  filters articles; "All Categories" resets.
- Drag a subcategory within its parent → order persists after reload; dragging across
  different parents is a no-op; top-level reorder still works.
