# Three-Column Section & Robust Poll System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `TabbedSection` on the homepage with a three-column section (Opinion | Poll | Stories), upgrade PollWidget to be API-driven with rich UI, and swap the hero right column (stories → TrendingWidget).

**Architecture:** A new `ThreeColumnSection` feature component owns the three-column layout; `PollWidget` becomes a standalone API-driven widget; `StoryCarousel` is extracted from `Home.jsx` to a shared component so it can be reused in both the hero (previously) and the new section.

**Tech Stack:** React (JSX), Laravel 11, Inertia.js, window.axios (CSRF-aware), localStorage for vote persistence, app.css (BEM-lite CSS)

---

## File Map

**Create:**
- `database/migrations/YYYY_add_featured_image_to_polls_table.php`
- `resources/js/Components/media/StoryCarousel.jsx`
- `resources/js/features/home/ThreeColumnSection.jsx`

**Modify:**
- `app/Models/Poll.php` — add `featured_image` to `$fillable`
- `app/Http/Controllers/NewsController.php` — update `apiPoll`, add `apiPollVote`
- `app/Http/Controllers/Admin/PollController.php` — validate + save `featured_image`
- `routes/web.php` — add vote route
- `resources/js/services/newsService.js` — add `getActivePoll`, `submitPollVote`
- `resources/js/features/admin/pages/operations/PollManagement.jsx` — add image URL field
- `resources/js/Components/widgets/PollWidget.jsx` — full rewrite
- `resources/js/Pages/Home.jsx` — wire ThreeColumnSection, swap HeroBlock right col
- `resources/css/app.css` — new `htcs-` classes + extended `poll-` classes

---

## Task 1: Migration — Add `featured_image` to polls

**Files:**
- Create: `database/migrations/YYYY_add_featured_image_to_polls_table.php`

- [ ] **Step 1: Generate the migration**

```bash
php artisan make:migration add_featured_image_to_polls_table
```

- [ ] **Step 2: Edit the generated file**

Open `database/migrations/<timestamp>_add_featured_image_to_polls_table.php` and replace its contents with:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('polls', function (Blueprint $table) {
            $table->string('featured_image')->nullable()->after('total_votes');
        });
    }

    public function down(): void
    {
        Schema::table('polls', function (Blueprint $table) {
            $table->dropColumn('featured_image');
        });
    }
};
```

- [ ] **Step 3: Run the migration**

```bash
php artisan migrate
```

Expected output: `Migrating: ..._add_featured_image_to_polls_table` then `Migrated`.

- [ ] **Step 4: Commit**

```bash
git add database/migrations/
git commit -m "feat: add featured_image column to polls table"
```

---

## Task 2: Update Poll Model + apiPoll Response

**Files:**
- Modify: `app/Models/Poll.php`
- Modify: `app/Http/Controllers/NewsController.php` (lines ~717–734)

- [ ] **Step 1: Add `featured_image` to Poll `$fillable`**

In `app/Models/Poll.php`, change:

```php
protected $fillable = [
    'question_bn',
    'question_en',
    'is_active',
    'start_date',
    'end_date',
    'total_votes',
];
```

To:

```php
protected $fillable = [
    'question_bn',
    'question_en',
    'is_active',
    'start_date',
    'end_date',
    'total_votes',
    'featured_image',
];
```

- [ ] **Step 2: Update `apiPoll` response to include `featured_image` and `created_at`**

In `app/Http/Controllers/NewsController.php`, find the `apiPoll` method and replace the return statement:

```php
return response()->json(['data' => [
    'id' => $poll->id,
    'question' => $poll->getQuestion($edition),
    'total_votes' => $poll->total_votes,
    'options' => $poll->options->map(fn($opt) => [
        'id' => $opt->id,
        'option' => $opt->getOption($edition),
        'votes' => $opt->votes,
    ])
]]);
```

With:

```php
return response()->json(['data' => [
    'id'            => $poll->id,
    'question'      => $poll->getQuestion($edition),
    'total_votes'   => $poll->total_votes,
    'featured_image'=> $poll->featured_image,
    'created_at'    => $poll->created_at?->toISOString(),
    'end_date'      => $poll->end_date?->toDateString(),
    'options'       => $poll->options->map(fn($opt) => [
        'id'     => $opt->id,
        'option' => $opt->getOption($edition),
        'votes'  => $opt->votes,
    ]),
]]);
```

- [ ] **Step 3: Commit**

```bash
git add app/Models/Poll.php app/Http/Controllers/NewsController.php
git commit -m "feat: expose featured_image and created_at in poll API response"
```

---

## Task 3: Add Vote Route + `apiPollVote` Controller Method

**Files:**
- Modify: `routes/web.php`
- Modify: `app/Http/Controllers/NewsController.php`

- [ ] **Step 1: Add the route**

In `routes/web.php`, find:

```php
Route::get('/api/poll', [NewsController::class, 'apiPoll'])->name('api.poll');
```

Add immediately after it:

```php
Route::post('/api/poll/{poll}/vote', [NewsController::class, 'apiPollVote'])
    ->name('api.poll.vote')
    ->whereNumber('poll');
```

- [ ] **Step 2: Add `apiPollVote` method to NewsController**

In `app/Http/Controllers/NewsController.php`, add this method directly after the `apiPoll` method:

```php
public function apiPollVote(Request $request, Poll $poll)
{
    $validated = $request->validate([
        'option_id' => 'required|integer',
    ]);

    $option = PollOption::where('id', $validated['option_id'])
        ->where('poll_id', $poll->id)
        ->firstOrFail();

    $option->increment('votes');
    $poll->increment('total_votes');

    $poll->load('options');

    return response()->json([
        'options' => $poll->options->map(fn($opt) => [
            'id'    => $opt->id,
            'votes' => $opt->votes,
        ]),
    ]);
}
```

- [ ] **Step 3: Verify `PollOption` is imported at the top of NewsController**

Check that `use App\Models\PollOption;` is present among the imports at the top of `app/Http/Controllers/NewsController.php`. If not, add it.

- [ ] **Step 4: Test the route manually**

```bash
php artisan route:list --name=api.poll
```

Expected: Two rows — `GET /api/poll` and `POST /api/poll/{poll}/vote`.

- [ ] **Step 5: Commit**

```bash
git add routes/web.php app/Http/Controllers/NewsController.php
git commit -m "feat: add poll vote API endpoint with atomic increment"
```

---

## Task 4: Update Admin PollController + PollManagement Form

**Files:**
- Modify: `app/Http/Controllers/Admin/PollController.php`
- Modify: `resources/js/features/admin/pages/operations/PollManagement.jsx`

- [ ] **Step 1: Update PollController validation to accept `featured_image`**

In `app/Http/Controllers/Admin/PollController.php`, find the `store` method's `$request->validate([...])` call and add the new field:

```php
$validated = $request->validate([
    'question_bn'    => 'required|string|max:255',
    'question_en'    => 'required|string|max:255',
    'is_active'      => 'boolean',
    'start_date'     => 'required|date',
    'end_date'       => 'nullable|date|after_or_equal:start_date',
    'featured_image' => 'nullable|string|max:500',
    'options'        => 'required|array|min:2',
    'options.*.option_bn' => 'required|string',
    'options.*.option_en' => 'required|string',
]);
```

Then update the `Poll::create([...])` call to include `featured_image`:

```php
$poll = Poll::create([
    'question_bn'    => $validated['question_bn'],
    'question_en'    => $validated['question_en'],
    'is_active'      => $validated['is_active'] ?? false,
    'start_date'     => $validated['start_date'],
    'end_date'       => $validated['end_date'],
    'featured_image' => $validated['featured_image'] ?? null,
]);
```

- [ ] **Step 2: Add `featured_image` to the admin form state**

In `PollManagement.jsx`, find the `form` state initial value and add the new field:

```js
const [form, setForm] = useState({
  question_bn: '',
  question_en: '',
  is_active: true,
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  featured_image: '',
  options: [
    { option_bn: '', option_en: '' },
    { option_bn: '', option_en: '' }
  ]
});
```

Also update `openAddModal`:

```js
const openAddModal = () => {
  setForm({
    question_bn: '', question_en: '', is_active: true,
    start_date: new Date().toISOString().split('T')[0], end_date: '',
    featured_image: '',
    options: [{ option_bn: '', option_en: '' }, { option_bn: '', option_en: '' }]
  });
  setShowModal(true);
};
```

- [ ] **Step 3: Add the image URL input to the modal form**

In `PollManagement.jsx`, inside the modal `<div className="p-8 space-y-6 ...">`, add a new field block after the Question (EN) input and before the date grid:

```jsx
<div>
  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Featured Image URL (Optional)</label>
  <input
    type="url"
    value={form.featured_image}
    onChange={e => setForm({...form, featured_image: e.target.value})}
    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]"
    placeholder="https://..."
  />
</div>
```

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/Admin/PollController.php resources/js/features/admin/pages/operations/PollManagement.jsx
git commit -m "feat: add featured_image field to poll creation in admin"
```

---

## Task 5: Add Poll API Functions to newsService.js

**Files:**
- Modify: `resources/js/services/newsService.js`

- [ ] **Step 1: Add `getActivePoll` and `submitPollVote` functions**

At the end of `resources/js/services/newsService.js`, add:

```js
export async function getActivePoll(edition = 'bn') {
  try {
    const res = await fetch(`/api/poll?edition=${edition}`);
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.error('Error fetching poll', err);
  }
  return null;
}

export async function submitPollVote(pollId, optionId) {
  try {
    const res = await window.axios.post(`/api/poll/${pollId}/vote`, { option_id: optionId });
    return res.data;
  } catch (err) {
    console.error('Error submitting vote', err);
  }
  return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/services/newsService.js
git commit -m "feat: add getActivePoll and submitPollVote to newsService"
```

---

## Task 6: Extract StoryCarousel to Shared Component

**Files:**
- Create: `resources/js/Components/media/StoryCarousel.jsx`
- Modify: `resources/js/Pages/Home.jsx` (remove the inline definition, add import)

- [ ] **Step 1: Create `StoryCarousel.jsx`**

Create `resources/js/Components/media/StoryCarousel.jsx` with this content:

```jsx
import { useState } from 'react';
import Icon from '../Icon';

export default function StoryCarousel({ label, items, isVideo, onClickItem, scrollRef }) {
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollAmount = () => (scrollRef.current?.offsetWidth ?? 200) * 0.8;
  const scrollLeft   = () => scrollRef.current?.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  const scrollRight  = () => scrollRef.current?.scrollBy({ left:  scrollAmount(), behavior: 'smooth' });

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  return (
    <div className="hp-h3-carousel-sec">
      <div className="hp-h3-cs-hdr">
        <span className="hp-h3-cs-ttl">{label}</span>
      </div>
      <div className="hp-h3-stories">
        <div className="hp-h3-scroll" ref={scrollRef} onScroll={onScroll}>
          {items.length > 0 ? items.slice(0, 8).map((item, idx) => (
            <div
              key={item.id}
              className="hp-h3-scard"
              onClick={() => onClickItem(item, idx)}
              role="button"
              tabIndex={0}
              aria-label={item.title}
            >
              {(item.cover_thumbnail || item.cover || item.featured_image)
                ? <img src={item.cover_thumbnail || item.cover || item.featured_image} alt={item.title} loading="lazy" />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3b82f6,#7c3aed)' }} />}
              <div className="hp-h3-scard-grad" />
              {isVideo && <div className="hp-h3-scard-play"><Icon name="play" size={16} /></div>}
              <div className="hp-h3-scard-title">{item.title}</div>
            </div>
          )) : (
            <div style={{ padding: '16px 12px', color: '#aaa', fontSize: 12, fontFamily: "'Kalpurush','SolaimanLipi',sans-serif" }}>
              কোনো কন্টেন্ট নেই।
            </div>
          )}
        </div>
        {items.length > 1 && canScrollLeft && (
          <button className="hp-h3-arr hp-h3-arr-left" onClick={scrollLeft} aria-label="Scroll left">‹</button>
        )}
        {items.length > 1 && canScrollRight && (
          <button className="hp-h3-arr hp-h3-arr-right" onClick={scrollRight} aria-label="Scroll right">›</button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Remove the inline `StoryCarousel` function from `Home.jsx`**

In `resources/js/Pages/Home.jsx`, delete lines 60–113 (the entire `function StoryCarousel(...)` definition).

Do NOT add an import for `StoryCarousel` in `Home.jsx` — after this refactor `Home.jsx` will not use it. Only `ThreeColumnSection.jsx` imports it.

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/media/StoryCarousel.jsx resources/js/Pages/Home.jsx
git commit -m "refactor: extract StoryCarousel to shared component"
```

---

## Task 7: Rewrite PollWidget

**Files:**
- Modify: `resources/js/Components/widgets/PollWidget.jsx`

- [ ] **Step 1: Replace the entire file content**

Replace all content of `resources/js/Components/widgets/PollWidget.jsx` with:

```jsx
import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { toBengaliNum, formatDate } from '../../lib/formatters';
import { getActivePoll, submitPollVote } from '../../services/newsService';

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function BarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/>
    </svg>
  );
}

export default function PollWidget() {
  const { lang } = useApp();
  const [poll, setPoll]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts]   = useState({});
  const [voted, setVoted]     = useState(null);

  useEffect(() => {
    setLoading(true);
    getActivePoll(lang).then(data => {
      if (!data) { setLoading(false); return; }
      setPoll(data);
      const savedVote = localStorage.getItem(`poll_voted_${data.id}`);
      setVoted(savedVote ? Number(savedVote) : null);
      const initCounts = {};
      data.options.forEach(o => { initCounts[o.id] = o.votes; });
      setCounts(initCounts);
      setLoading(false);
    });
  }, [lang]);

  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);
  const fmtNum = (n) => lang === 'bn' ? toBengaliNum(Number(n).toLocaleString('en-IN')) : Number(n).toLocaleString();

  const isClosed = poll?.end_date && new Date(poll.end_date) < new Date();

  const handleVote = async (optionId) => {
    if (voted || isClosed) return;
    const result = await submitPollVote(poll.id, optionId);
    if (result?.options) {
      const newCounts = {};
      result.options.forEach(o => { newCounts[o.id] = o.votes; });
      setCounts(newCounts);
    } else {
      setCounts(prev => ({ ...prev, [optionId]: (prev[optionId] || 0) + 1 }));
    }
    setVoted(optionId);
    localStorage.setItem(`poll_voted_${poll.id}`, String(optionId));
  };

  const handleShare = () => {
    const text = poll?.question || '';
    if (navigator.share) {
      navigator.share({ title: text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href).then(() => {
        alert(lang === 'bn' ? 'লিংক কপি হয়েছে' : 'Link copied');
      });
    }
  };

  const winningOptionId = Object.entries(counts).reduce(
    (best, [id, v]) => v > (counts[best] || 0) ? Number(id) : best,
    null
  );

  if (loading) {
    return (
      <div className="poll-widget poll-skeleton">
        <div className="poll-sk-img" />
        <div className="poll-sk-line" style={{ width: '80%' }} />
        <div className="poll-sk-line" style={{ width: '60%', marginBottom: 12 }} />
        <div className="poll-sk-line" style={{ height: 32, marginBottom: 8 }} />
        <div className="poll-sk-line" style={{ height: 32, marginBottom: 8 }} />
        <div className="poll-sk-line" style={{ height: 32 }} />
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="poll-widget htcs-poll-wrap">
      <div className="poll-hdr">
        <BarIcon />
        {lang === 'bn' ? 'অনলাইন জিরপ' : 'Online Poll'}
      </div>

      {poll.featured_image && (
        <img src={poll.featured_image} alt="" className="poll-img" />
      )}

      <div className="poll-meta">
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ClockIcon />
          {poll.created_at
            ? new Date(poll.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            : ''}
        </span>
        {isClosed && (
          <span className="poll-closed-badge">
            {lang === 'bn' ? 'ভোট শেষ' : 'Closed'}
          </span>
        )}
      </div>

      <p className="poll-q">{poll.question}</p>

      {poll.options.map(opt => {
        const pct   = totalVotes ? Math.round((counts[opt.id] / totalVotes) * 100) : 0;
        const isSelected = voted === opt.id;
        const isWinner   = opt.id === winningOptionId && voted !== null;
        return (
          <div key={opt.id}>
            <div
              className="poll-opt-row"
              onClick={() => handleVote(opt.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleVote(opt.id)}
            >
              <span className={`poll-radio-circle${isSelected ? ' checked' : ''}`} />
              <span className="poll-opt-lbl">{opt.option}</span>
              {voted !== null && (
                <span className="poll-opt-pct">
                  {lang === 'bn' ? toBengaliNum(String(pct)) : pct}%
                </span>
              )}
            </div>
            {voted !== null && (
              <div className="poll-bar-wrap">
                <div
                  className={`poll-bar-fill ${isWinner ? 'winner' : 'normal'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        );
      })}

      <div className="poll-footer-row">
        <span className="poll-total">
          {lang === 'bn'
            ? `মোট ভোটদাতাঃ ${fmtNum(totalVotes)} জন`
            : `${fmtNum(totalVotes)} votes cast`}
        </span>
        <button className="poll-share-btn" onClick={handleShare} aria-label="Share poll">
          <ShareIcon />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify `formatDate` import — remove if not exported**

Check `resources/js/lib/formatters.js`. If `formatDate` is not exported there, remove it from the import line in `PollWidget.jsx`. The component uses `new Date(...).toLocaleDateString(...)` directly anyway, so `formatDate` is not actually called in the code above — safe to remove from the import:

```js
import { toBengaliNum } from '../../lib/formatters';
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/widgets/PollWidget.jsx
git commit -m "feat: rewrite PollWidget as API-driven rich component"
```

---

## Task 8: Create ThreeColumnSection

**Files:**
- Create: `resources/js/features/home/ThreeColumnSection.jsx`

- [ ] **Step 1: Create the `features/home` directory and the component**

Create `resources/js/features/home/ThreeColumnSection.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import StoryCarousel from '../../Components/media/StoryCarousel';
import StoryViewer from '../../Components/StoryViewer';
import PollWidget from '../../Components/widgets/PollWidget';

// ─── Opinion Column ────────────────────────────────────────────────────────────
function OpinionColumn({ lang, nav }) {
  const [opinions, setOpinions] = useState([]);
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(true);
  const timerRef = useRef(null);
  const PER_PAGE = 3;

  useEffect(() => {
    fetch(`/api/opinions?limit=9&edition=${lang}`)
      .then(r => r.ok ? r.json() : { data: [] })
      .then(json => { setOpinions(json.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lang]);

  const totalPages = Math.ceil(opinions.length / PER_PAGE);

  useEffect(() => {
    if (totalPages <= 1) return;
    timerRef.current = setInterval(() => {
      setPage(p => (p + 1) % totalPages);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [totalPages]);

  const pause = () => clearInterval(timerRef.current);
  const resume = () => {
    if (totalPages <= 1) return;
    timerRef.current = setInterval(() => setPage(p => (p + 1) % totalPages), 5000);
  };

  const visible = opinions.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const goTo = (op) => {
    nav('article', { categorySlug: op.categorySlug || 'opinion', articleSlug: op.slug });
  };

  return (
    <div className="htcs-col">
      <div className="htcs-sec-hdr">
        <span className="htcs-sec-ttl">{lang === 'bn' ? 'মতামত' : 'Opinion'}</span>
        <span className="htcs-sec-more" onClick={() => nav('category', 'opinion')}>
          {lang === 'bn' ? 'আরও »' : 'More »'}
        </span>
      </div>

      {loading ? (
        <div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0f0f0', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: '#f0f0f0', borderRadius: 2, marginBottom: 6 }} />
                <div style={{ height: 12, background: '#f0f0f0', borderRadius: 2, width: '70%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div onMouseEnter={pause} onMouseLeave={resume}>
          {visible.map(op => (
            <div
              key={op.id}
              className="htcs-op-card"
              onClick={() => goTo(op)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && goTo(op)}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div className="htcs-op-av">
                  {op.avatar
                    ? <img src={op.avatar} alt={op.name} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#f0d0c0,#e0a090)', display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>👤</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="htcs-op-name">{op.name}</div>
                  <div className="htcs-op-desg">{op.desg}</div>
                  <div className="htcs-op-title">{op.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="htcs-op-dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`htcs-op-dot${page === i ? ' on' : ''}`}
              onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stories Panel ─────────────────────────────────────────────────────────────
function StoriesPanel({ stories, lang }) {
  const [activeStory, setActiveStory] = useState(null);
  const videoScrollRef = useRef(null);
  const photoScrollRef = useRef(null);

  const videoStories = stories.filter(s => s.slides?.some(sl => sl.is_video));
  const photoStories = stories.filter(s => !s.slides?.some(sl => sl.is_video));

  return (
    <div className="htcs-col">
      <div className="htcs-sec-hdr">
        <span className="htcs-sec-ttl">{lang === 'bn' ? 'স্টোরি' : 'Stories'}</span>
      </div>
      <StoryCarousel
        label={lang === 'bn' ? 'ভিডিও স্টোরি' : 'Video Story'}
        items={videoStories}
        isVideo={true}
        onClickItem={(_, idx) => setActiveStory(stories.indexOf(videoStories[idx]))}
        scrollRef={videoScrollRef}
      />
      <StoryCarousel
        label={lang === 'bn' ? 'ফটো স্টোরি' : 'Photo Story'}
        items={photoStories}
        isVideo={false}
        onClickItem={(_, idx) => setActiveStory(stories.indexOf(photoStories[idx]))}
        scrollRef={photoScrollRef}
      />
      {activeStory !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeStory}
          onClose={() => setActiveStory(null)}
        />
      )}
    </div>
  );
}

// ─── Three Column Section ──────────────────────────────────────────────────────
export default function ThreeColumnSection({ stories = [] }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  return (
    <div className="p-section htcs-wrap">
      <OpinionColumn lang={lang} nav={onNavigate} />
      <div className="htcs-col htcs-col-poll">
        <div className="htcs-sec-hdr" style={{ visibility: 'hidden', marginBottom: 0, height: 0 }}>
          <span className="htcs-sec-ttl">Poll</span>
        </div>
        <PollWidget />
      </div>
      <StoriesPanel stories={stories} lang={lang} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/features/home/ThreeColumnSection.jsx
git commit -m "feat: create ThreeColumnSection with Opinion, Poll, and Stories columns"
```

---

## Task 9: Update HeroBlock — Swap Stories for TrendingWidget

**Files:**
- Modify: `resources/js/Pages/Home.jsx`

- [ ] **Step 1: Add TrendingWidget import**

At the top of `Home.jsx`, add:

```js
import TrendingWidget from '../Components/widgets/TrendingWidget';
```

- [ ] **Step 2: Remove stories-related props from HeroBlock**

Find the `HeroBlock` function signature:

```js
function HeroBlock({ feat, grid6, midMain, midList, stories, lang, nav, settings }) {
```

Change to:

```js
function HeroBlock({ feat, grid6, midMain, midList, lang, nav, settings }) {
```

- [ ] **Step 3: Remove story state and carousel refs from HeroBlock**

Delete these lines near the top of the `HeroBlock` function body:

```js
const [activeStory, setActiveStory] = useState(null);
const videoScrollRef = useRef(null);
const photoScrollRef = useRef(null);
```

And:

```js
const videoStories = stories.filter(s => s.slides?.some(sl => sl.is_video));
const photoStories = stories.filter(s => !s.slides?.some(sl => sl.is_video));
```

- [ ] **Step 4: Replace the right column content in HeroBlock JSX**

Find the `hp-h3-right` div:

```jsx
{/* ── RIGHT: Social follow + Video Story + Photo Story ── */}
<div className="hp-h3-right">
  <SocialFollow settings={settings} lang={lang} />
  <StoryCarousel
    label={lang === 'bn' ? 'ভিডিও স্টোরি' : 'Video Story'}
    items={videoStories}
    isVideo={true}
    onClickItem={(_, idx) => setActiveStory(stories.indexOf(videoStories[idx]))}
    scrollRef={videoScrollRef}
  />
  <StoryCarousel
    label={lang === 'bn' ? 'ফটো স্টোরি' : 'Photo Story'}
    items={photoStories}
    isVideo={false}
    onClickItem={(_, idx) => setActiveStory(stories.indexOf(photoStories[idx]))}
    scrollRef={photoScrollRef}
  />
</div>

{activeStory !== null && (
  <StoryViewer
    stories={stories}
    initialIndex={activeStory}
    onClose={() => setActiveStory(null)}
  />
)}
```

Replace with:

```jsx
{/* ── RIGHT: Social follow + Trending ── */}
<div className="hp-h3-right">
  <SocialFollow settings={settings} lang={lang} />
  <TrendingWidget />
</div>
```

- [ ] **Step 5: Remove unused imports from Home.jsx**

In `resources/js/Pages/Home.jsx`, remove this import line (no longer used after stories left HeroBlock):

```js
import StoryViewer from '../Components/StoryViewer';
```

- [ ] **Step 6: Commit**

```bash
git add resources/js/Pages/Home.jsx
git commit -m "feat: swap hero right column from stories to TrendingWidget"
```

---

## Task 10: Wire Home.jsx — Render ThreeColumnSection

**Files:**
- Modify: `resources/js/Pages/Home.jsx`

- [ ] **Step 1: Add ThreeColumnSection import**

At the top of `Home.jsx`, add:

```js
import ThreeColumnSection from '../features/home/ThreeColumnSection';
```

- [ ] **Step 2: Update the HeroBlock call to remove `stories` prop**

Find:

```jsx
<HeroBlock
  feat={heroFeat}
  grid6={heroGrid6}
  midMain={midMain}
  midList={midList}
  stories={heroStories}
  lang={lang}
  nav={onNavigate}
  settings={settings}
/>
```

Change to:

```jsx
<HeroBlock
  feat={heroFeat}
  grid6={heroGrid6}
  midMain={midMain}
  midList={midList}
  lang={lang}
  nav={onNavigate}
  settings={settings}
/>
```

- [ ] **Step 3: Replace the TabbedSection render with ThreeColumnSection**

Find inside `<div className="p-body">`:

```jsx
{/* Tabbed most-read / popular */}
{mostRead.length > 0 && (
  <TabbedSection
    mostRead={mostRead}
    breakingNews={breakingNews}
    latest={leadArticles}
    featured={tabFeat}
    lang={lang}
    nav={onNavigate}
  />
)}
```

Replace with:

```jsx
{/* Three-column: Opinion | Poll | Stories */}
<ThreeColumnSection stories={heroStories} />
```

- [ ] **Step 4: Commit**

```bash
git add resources/js/Pages/Home.jsx
git commit -m "feat: render ThreeColumnSection on homepage, remove TabbedSection"
```

---

## Task 11: Add CSS

**Files:**
- Modify: `resources/css/app.css`

- [ ] **Step 1: Add `htcs-` layout and opinion column classes**

At the end of `resources/css/app.css`, add:

```css
/* ══ THREE-COLUMN SECTION (htcs-) ══════════════════════════════════════════ */
.htcs-wrap{display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:0;border-top:3px solid var(--primary);padding-top:18px;margin-bottom:20px;}
.htcs-col{padding:0 16px;border-right:1px solid var(--border);}
.htcs-col:first-child{padding-left:0;}
.htcs-col:last-child{border-right:none;padding-right:0;}
.htcs-col-poll{padding:0 12px;}
.htcs-sec-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #f0f0f0;}
.htcs-sec-ttl{font-family:'SolaimanLipi',sans-serif;font-size:20px;font-weight:700;color:var(--black);border-left:3px solid var(--primary);padding-left:8px;line-height:1.2;}
.htcs-sec-more{font-size:14px;color:var(--primary);cursor:pointer;font-weight:600;}
.htcs-sec-more:hover{text-decoration:underline;}
/* Opinion cards */
.htcs-op-card{padding:10px 0;border-bottom:1px solid #f0f0f0;cursor:pointer;transition:background .12s;}
.htcs-op-card:last-child{border-bottom:none;}
.htcs-op-card:hover .htcs-op-title{color:var(--primary);}
.htcs-op-av{width:64px;height:64px;border-radius:50%;overflow:hidden;flex-shrink:0;background:#f0f0f0;border:2px solid #f0d0c0;}
.htcs-op-av img{width:100%;height:100%;object-fit:cover;}
.htcs-op-name{font-size:15px;font-weight:700;color:#333;margin-bottom:2px;}
.htcs-op-desg{font-size:13px;color:var(--lighter-text);margin-bottom:5px;}
.htcs-op-title{font-family:'SolaimanLipi',sans-serif;font-size:17px;line-height:1.5;color:var(--black);transition:color .15s;}
.htcs-op-dots{display:flex;justify-content:center;gap:7px;margin-top:14px;padding-bottom:4px;}
.htcs-op-dot{width:8px;height:8px;border-radius:50%;background:#ddd;border:none;cursor:pointer;padding:0;transition:background .15s;}
.htcs-op-dot.on{background:var(--primary);}
/* Poll within htcs (standalone, not in .right-col) */
.htcs-poll-wrap{border:1px solid var(--border);background:#fff;overflow:hidden;}
.poll-img{width:100%;height:180px;object-fit:cover;display:block;}
.poll-sk-img{height:180px;background:#f0f0f0;}
.poll-hdr{background:var(--primary);color:#fff;padding:8px 10px;font-family:'SolaimanLipi',sans-serif;font-size:18px;font-weight:700;display:flex;align-items:center;gap:6px;}
.poll-meta{display:flex;align-items:center;justify-content:space-between;padding:5px 10px;font-size:13px;color:var(--lighter-text);border-bottom:1px solid #f5f5f5;}
.poll-q{font-family:'SolaimanLipi',sans-serif;font-size:17px;font-weight:700;line-height:1.55;color:var(--black);padding:10px 10px 6px;}
.poll-opt-row{display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;transition:background .12s;font-size:17px;font-family:'SolaimanLipi',sans-serif;}
.poll-opt-row:hover{background:#f5f8ff;}
.poll-radio-circle{width:16px;height:16px;border:2px solid #ccc;border-radius:50%;flex-shrink:0;transition:border-color .15s,background .15s;}
.poll-opt-row:hover .poll-radio-circle{border-color:var(--primary);}
.poll-radio-circle.checked{border-color:var(--primary);background:var(--primary);box-shadow:inset 0 0 0 3px #fff;}
.poll-opt-lbl{flex:1;}
.poll-opt-pct{font-size:13px;color:var(--primary);font-weight:700;min-width:32px;text-align:right;}
.poll-bar-wrap{margin:0 10px 4px;height:4px;background:#eee;border-radius:2px;overflow:hidden;}
.poll-bar-fill{height:100%;border-radius:2px;transition:width .5s ease;}
.poll-bar-fill.winner{background:var(--primary);}
.poll-bar-fill.normal{background:#ccc;}
.poll-footer-row{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-top:1px solid #f5f5f5;margin-top:4px;}
.poll-total{font-size:14px;color:var(--lighter-text);}
.poll-share-btn{width:34px;height:34px;border-radius:50%;background:#27ae60;color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;flex-shrink:0;}
.poll-share-btn:hover{background:#219a52;}
.poll-closed-badge{font-size:11px;font-weight:700;background:#e67e22;color:#fff;padding:2px 7px;border-radius:3px;}
.poll-skeleton{padding:10px;}
.poll-sk-line{background:#f0f0f0;border-radius:2px;margin-bottom:8px;}
/* Mobile */
@media(max-width:767px){
  .htcs-wrap{grid-template-columns:1fr;}
  .htcs-col{padding:14px 0;border-right:none;border-bottom:1px solid var(--border);}
  .htcs-col:last-child{border-bottom:none;}
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/css/app.css
git commit -m "feat: add htcs- layout classes and rich poll-widget styles"
```

---

## Task 12: Build and Verify

- [ ] **Step 1: Build the frontend**

```bash
npm run build
```

Expected: No errors. If there are import errors, check the import paths in `ThreeColumnSection.jsx` (e.g., `../../contexts/AppContext`).

- [ ] **Step 2: Run the dev server and open the homepage**

```bash
npm run dev
```

Open `http://localhost` (or your local URL) and verify:
- Hero right column shows Social Follow + TrendingWidget (no more story carousels there)
- Below the video section, the three-column section appears: Opinion | Poll | Stories
- Opinion column shows author cards with dots at bottom, auto-advances every 5s
- Poll column shows the active poll from DB (or is empty if none exists)
- Stories column shows the video/photo story carousels

- [ ] **Step 3: Create a test poll in the admin**

Navigate to Admin → Poll Management → New Poll. Fill in:
- Question (BN): যেকোনো প্রশ্ন
- Featured Image URL: any valid image URL
- Options: at least 2
- Start Date: today

Verify the poll appears on the homepage with the featured image displayed.

- [ ] **Step 4: Test voting**

Click an option. Verify:
- Progress bars animate in
- Total vote count increments
- Refreshing the page still shows the results view (localStorage persists the vote)

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: three-column section, rich poll widget, hero TrendingWidget swap — complete"
```
