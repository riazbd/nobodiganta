# সারাদেশ (Saradesh) Location System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hierarchical location-based news section (সারাদেশ) with drill-down navigation: Country → Division (বিভাগ) → District (জেলা) → Upazila (উপজেলা), each level showing filtered articles.

**Architecture:** Single `Location.jsx` page that renders the correct level based on URL segments (`/saradesh`, `/saradesh/{division}`, `/saradesh/{division}/{district}`, `/saradesh/{division}/{district}/{upazila}`). Static BD geographic data in a JS file (64 districts, 8 divisions, ~495 upazilas). `LocationController` resolves the level and fetches articles. Cascading breadcrumb + filter pills for UX.

**Tech Stack:** Laravel (Inertia), React (JSX), custom CSS (existing `.tabs`/`.tbtn` pattern), static `bdLocations.js` data file.

---

## Current State

- `articles` table already has `division` (varchar, indexed) and `district` (varchar, indexed) — migration `2026_04_22_200156`
- `Article::$fillable` includes `division`, `district`
- `Regional.jsx` handles division-only filtering via `?division=` query param — **leave it untouched**
- `apiRegional()` in `NewsController` already handles `division` + `district` query filters — **reuse this pattern**
- No `upazila` column yet, no static BD location tree anywhere

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `database/migrations/2026_05_19_add_upazila_to_articles.php` | Add `upazila` column to articles |
| Modify | `app/Models/Article.php` | Add `upazila` to `$fillable` |
| Create | `resources/js/data/bdLocations.js` | Static geographic data (divisions → districts → upazilas) |
| Create | `app/Http/Controllers/LocationController.php` | Single controller, resolves level, returns Inertia props |
| Modify | `routes/web.php` | Add `/saradesh` routes (4 levels) + English mirrors |
| Modify | `resources/js/lib/routes.js` | Add `location` route helpers |
| Create | `resources/js/Pages/Location.jsx` | Single page component, renders all 4 levels |

---

## Task 1: Add `upazila` Migration + Update Model

**Files:**
- Create: `database/migrations/2026_05_19_add_upazila_to_articles.php`
- Modify: `app/Models/Article.php`

- [ ] **Step 1: Create the migration**

```php
<?php
// database/migrations/2026_05_19_add_upazila_to_articles.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->string('upazila')->nullable()->index()->after('district');
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn('upazila');
        });
    }
};
```

- [ ] **Step 2: Run the migration**

```
php artisan migrate
```

Expected output: `Migrating: 2026_05_19_add_upazila_to_articles` then `Migrated`.

- [ ] **Step 3: Add `upazila` to Article `$fillable`**

In `app/Models/Article.php`, find the `$fillable` array and add `'upazila'` after `'district'`:

```php
// Before (line ~36):
'division', 'district',

// After:
'division', 'district', 'upazila',
```

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_05_19_add_upazila_to_articles.php app/Models/Article.php
git commit -m "feat: add upazila column to articles for location hierarchy"
```

---

## Task 2: Create Static BD Location Data

**Files:**
- Create: `resources/js/data/bdLocations.js`

This is the geographic reference tree. All slug values are lowercase English, used in URLs. All `bn` values are Bangla, `en` values are English.

- [ ] **Step 1: Create `resources/js/data/bdLocations.js`**

```js
/**
 * Bangladesh geographic hierarchy: Division → District → Upazila
 * Slugs are URL-safe lowercase English identifiers.
 * Source: Bangladesh Bureau of Statistics administrative divisions.
 */
export const BD_DIVISIONS = [
  {
    slug: 'dhaka', bn: 'ঢাকা', en: 'Dhaka',
    districts: [
      {
        slug: 'dhaka', bn: 'ঢাকা', en: 'Dhaka',
        upazilas: [
          { slug: 'dhanmondi', bn: 'ধানমণ্ডি', en: 'Dhanmondi' },
          { slug: 'gulshan', bn: 'গুলশান', en: 'Gulshan' },
          { slug: 'mirpur', bn: 'মিরপুর', en: 'Mirpur' },
          { slug: 'motijheel', bn: 'মতিঝিল', en: 'Motijheel' },
          { slug: 'uttara', bn: 'উত্তরা', en: 'Uttara' },
          { slug: 'mohammadpur', bn: 'মোহাম্মদপুর', en: 'Mohammadpur' },
          { slug: 'tejgaon', bn: 'তেজগাঁও', en: 'Tejgaon' },
          { slug: 'lalbagh', bn: 'লালবাগ', en: 'Lalbagh' },
          { slug: 'demra', bn: 'ডেমরা', en: 'Demra' },
          { slug: 'sabujbagh', bn: 'সবুজবাগ', en: 'Sabujbagh' },
        ],
      },
      {
        slug: 'gazipur', bn: 'গাজীপুর', en: 'Gazipur',
        upazilas: [
          { slug: 'gazipur-sadar', bn: 'গাজীপুর সদর', en: 'Gazipur Sadar' },
          { slug: 'kaliakair', bn: 'কালিয়াকৈর', en: 'Kaliakair' },
          { slug: 'kapasia', bn: 'কাপাসিয়া', en: 'Kapasia' },
          { slug: 'sreepur', bn: 'শ্রীপুর', en: 'Sreepur' },
          { slug: 'kaliganj-gazipur', bn: 'কালীগঞ্জ', en: 'Kaliganj' },
        ],
      },
      {
        slug: 'narayanganj', bn: 'নারায়ণগঞ্জ', en: 'Narayanganj',
        upazilas: [
          { slug: 'narayanganj-sadar', bn: 'নারায়ণগঞ্জ সদর', en: 'Narayanganj Sadar' },
          { slug: 'bandar', bn: 'বন্দর', en: 'Bandar' },
          { slug: 'araihazar', bn: 'আড়াইহাজার', en: 'Araihazar' },
          { slug: 'rupganj', bn: 'রূপগঞ্জ', en: 'Rupganj' },
          { slug: 'sonargaon', bn: 'সোনারগাঁও', en: 'Sonargaon' },
        ],
      },
      {
        slug: 'narsingdi', bn: 'নরসিংদী', en: 'Narsingdi',
        upazilas: [
          { slug: 'narsingdi-sadar', bn: 'নরসিংদী সদর', en: 'Narsingdi Sadar' },
          { slug: 'belabo', bn: 'বেলাবো', en: 'Belabo' },
          { slug: 'monohardi', bn: 'মনোহরদী', en: 'Monohardi' },
          { slug: 'palash', bn: 'পলাশ', en: 'Palash' },
          { slug: 'raipura', bn: 'রায়পুরা', en: 'Raipura' },
          { slug: 'shibpur', bn: 'শিবপুর', en: 'Shibpur' },
        ],
      },
      {
        slug: 'manikganj', bn: 'মানিকগঞ্জ', en: 'Manikganj',
        upazilas: [
          { slug: 'manikganj-sadar', bn: 'মানিকগঞ্জ সদর', en: 'Manikganj Sadar' },
          { slug: 'daulatpur', bn: 'দৌলতপুর', en: 'Daulatpur' },
          { slug: 'ghior', bn: 'ঘিওর', en: 'Ghior' },
          { slug: 'harirampur', bn: 'হরিরামপুর', en: 'Harirampur' },
          { slug: 'saturia', bn: 'সাটুরিয়া', en: 'Saturia' },
          { slug: 'shivalaya', bn: 'শিবালয়', en: 'Shivalaya' },
          { slug: 'singair', bn: 'সিংগাইর', en: 'Singair' },
        ],
      },
      {
        slug: 'munshiganj', bn: 'মুন্সীগঞ্জ', en: 'Munshiganj',
        upazilas: [
          { slug: 'munshiganj-sadar', bn: 'মুন্সীগঞ্জ সদর', en: 'Munshiganj Sadar' },
          { slug: 'gazaria', bn: 'গজারিয়া', en: 'Gazaria' },
          { slug: 'lohajang', bn: 'লৌহজং', en: 'Lohajang' },
          { slug: 'sirajdikhan', bn: 'সিরাজদিখান', en: 'Sirajdikhan' },
          { slug: 'sreenagar', bn: 'শ্রীনগর', en: 'Sreenagar' },
          { slug: 'tongibari', bn: 'টংগিবাড়ী', en: 'Tongibari' },
        ],
      },
      {
        slug: 'kishoreganj', bn: 'কিশোরগঞ্জ', en: 'Kishoreganj',
        upazilas: [
          { slug: 'kishoreganj-sadar', bn: 'কিশোরগঞ্জ সদর', en: 'Kishoreganj Sadar' },
          { slug: 'austagram', bn: 'অষ্টগ্রাম', en: 'Austagram' },
          { slug: 'bajitpur', bn: 'বাজিতপুর', en: 'Bajitpur' },
          { slug: 'bhairab', bn: 'ভৈরব', en: 'Bhairab' },
          { slug: 'hossainpur', bn: 'হোসেনপুর', en: 'Hossainpur' },
          { slug: 'itna', bn: 'ইটনা', en: 'Itna' },
          { slug: 'karimganj', bn: 'করিমগঞ্জ', en: 'Karimগঞ্জ' },
          { slug: 'katiadi', bn: 'কটিয়াদী', en: 'Katiadi' },
          { slug: 'kuliarchar', bn: 'কুলিয়ারচর', en: 'Kuliarchar' },
          { slug: 'mithamain', bn: 'মিঠামইন', en: 'Mithamain' },
          { slug: 'nikli', bn: 'নিকলী', en: 'Nikli' },
          { slug: 'pakundia', bn: 'পাকুন্দিয়া', en: 'Pakundia' },
          { slug: 'tarail', bn: 'তাড়াইল', en: 'Tarail' },
        ],
      },
      {
        slug: 'tangail', bn: 'টাঙ্গাইল', en: 'Tangail',
        upazilas: [
          { slug: 'tangail-sadar', bn: 'টাঙ্গাইল সদর', en: 'Tangail Sadar' },
          { slug: 'basail', bn: 'বাসাইল', en: 'Basail' },
          { slug: 'bhuapur', bn: 'ভূঞাপুর', en: 'Bhuapur' },
          { slug: 'delduar', bn: 'দেলদুয়ার', en: 'Delduar' },
          { slug: 'dhanbari', bn: 'ধনবাড়ী', en: 'Dhanbari' },
          { slug: 'ghatail', bn: 'ঘাটাইল', en: 'Ghatail' },
          { slug: 'gopalpur', bn: 'গোপালপুর', en: 'Gopalpur' },
          { slug: 'kalihati', bn: 'কালিহাতী', en: 'Kalihati' },
          { slug: 'mirzapur', bn: 'মির্জাপুর', en: 'Mirzapur' },
          { slug: 'nagarpur', bn: 'নাগরপুর', en: 'Nagarpur' },
          { slug: 'sakhipur', bn: 'সখীপুর', en: 'Sakhipur' },
        ],
      },
      {
        slug: 'faridpur', bn: 'ফরিদপুর', en: 'Faridpur',
        upazilas: [
          { slug: 'faridpur-sadar', bn: 'ফরিদপুর সদর', en: 'Faridpur Sadar' },
          { slug: 'alfadanga', bn: 'আলফাডাঙ্গা', en: 'Alfadanga' },
          { slug: 'bhanga', bn: 'ভাঙ্গা', en: 'Bhanga' },
          { slug: 'boalmari', bn: 'বোয়ালমারী', en: 'Boalmari' },
          { slug: 'charbhadrasan', bn: 'চরভদ্রাসন', en: 'Charbhadrasan' },
          { slug: 'madhukhali', bn: 'মধুখালী', en: 'Madhukhali' },
          { slug: 'nagarkanda', bn: 'নগরকান্দা', en: 'Nagarkanda' },
          { slug: 'sadarpur', bn: 'সদরপুর', en: 'Sadarpur' },
          { slug: 'saltha', bn: 'সালথা', en: 'Saltha' },
        ],
      },
    ],
  },
  {
    slug: 'chittagong', bn: 'চট্টগ্রাম', en: 'Chittagong',
    districts: [
      {
        slug: 'chittagong', bn: 'চট্টগ্রাম', en: 'Chittagong',
        upazilas: [
          { slug: 'anwara', bn: 'আনোয়ারা', en: 'Anwara' },
          { slug: 'banshkhali', bn: 'বাঁশখালী', en: 'Banshkhali' },
          { slug: 'boalkhali', bn: 'বোয়ালখালী', en: 'Boalkhali' },
          { slug: 'chandanaish', bn: 'চন্দনাইশ', en: 'Chandanaish' },
          { slug: 'fatikchhari', bn: 'ফটিকছড়ি', en: 'Fatikchhari' },
          { slug: 'hathazari', bn: 'হাটহাজারী', en: 'Hathazari' },
          { slug: 'kotwali', bn: 'কোতোয়ালি', en: 'Kotwali' },
          { slug: 'lohagara', bn: 'লোহাগাড়া', en: 'Lohagara' },
          { slug: 'mirsharai', bn: 'মীরসরাই', en: 'Mirsharai' },
          { slug: 'patiya', bn: 'পটিয়া', en: 'Patiya' },
          { slug: 'rangunia', bn: 'রাঙ্গুনিয়া', en: 'Rangunia' },
          { slug: 'raozan', bn: 'রাউজান', en: 'Raozan' },
          { slug: 'sandwip', bn: 'সন্দ্বীপ', en: 'Sandwip' },
          { slug: 'satkania', bn: 'সাতকানিয়া', en: 'Satkania' },
          { slug: 'sitakunda', bn: 'সীতাকুণ্ড', en: 'Sitakunda' },
        ],
      },
      {
        slug: 'cox-bazar', bn: "কক্সবাজার", en: "Cox's Bazar",
        upazilas: [
          { slug: 'chakaria', bn: 'চকরিয়া', en: 'Chakaria' },
          { slug: 'coxs-bazar-sadar', bn: "কক্সবাজার সদর", en: "Cox's Bazar Sadar" },
          { slug: 'kutubdia', bn: 'কুতুবদিয়া', en: 'Kutubdia' },
          { slug: 'maheshkhali', bn: 'মহেশখালী', en: 'Maheshkhali' },
          { slug: 'pekua', bn: 'পেকুয়া', en: 'Pekua' },
          { slug: 'ramu', bn: 'রামু', en: 'Ramu' },
          { slug: 'teknaf', bn: 'টেকনাফ', en: 'Teknaf' },
          { slug: 'ukhia', bn: 'উখিয়া', en: 'Ukhia' },
        ],
      },
      {
        slug: 'comilla', bn: 'কুমিল্লা', en: 'Comilla',
        upazilas: [
          { slug: 'comilla-sadar', bn: 'কুমিল্লা সদর', en: 'Comilla Sadar' },
          { slug: 'barura', bn: 'বরুড়া', en: 'Barura' },
          { slug: 'brahmanpara', bn: 'ব্রাহ্মণপাড়া', en: 'Brahmanpara' },
          { slug: 'burichang', bn: 'বুড়িচং', en: 'Burichang' },
          { slug: 'chandina', bn: 'চান্দিনা', en: 'Chandina' },
          { slug: 'chauddagram', bn: 'চৌদ্দগ্রাম', en: 'Chauddagram' },
          { slug: 'daudkandi', bn: 'দাউদকান্দি', en: 'Daudkandi' },
          { slug: 'debidwar', bn: 'দেবীদ্বার', en: 'Debidwar' },
          { slug: 'homna', bn: 'হোমনা', en: 'Homna' },
          { slug: 'laksam', bn: 'লাকসাম', en: 'Laksam' },
          { slug: 'meghna', bn: 'মেঘনা', en: 'Meghna' },
          { slug: 'muradnagar', bn: 'মুরাদনগর', en: 'Muradnagar' },
          { slug: 'nangalkot', bn: 'নাঙ্গলকোট', en: 'Nangalkot' },
          { slug: 'titas', bn: 'তিতাস', en: 'Titas' },
        ],
      },
      {
        slug: 'chandpur', bn: 'চাঁদপুর', en: 'Chandpur',
        upazilas: [
          { slug: 'chandpur-sadar', bn: 'চাঁদপুর সদর', en: 'Chandpur Sadar' },
          { slug: 'faridganj', bn: 'ফরিদগঞ্জ', en: 'Faridganj' },
          { slug: 'haimchar', bn: 'হাইমচর', en: 'Haimchar' },
          { slug: 'hajiganj', bn: 'হাজীগঞ্জ', en: 'Hajiganj' },
          { slug: 'kachua', bn: 'কচুয়া', en: 'Kachua' },
          { slug: 'matlab-north', bn: 'মতলব উত্তর', en: 'Matlab North' },
          { slug: 'matlab-south', bn: 'মতলব দক্ষিণ', en: 'Matlab South' },
          { slug: 'shahrasti', bn: 'শাহরাস্তি', en: 'Shahrasti' },
        ],
      },
      {
        slug: 'feni', bn: 'ফেনী', en: 'Feni',
        upazilas: [
          { slug: 'feni-sadar', bn: 'ফেনী সদর', en: 'Feni Sadar' },
          { slug: 'chhagalnaiya', bn: 'ছাগলনাইয়া', en: 'Chhagalnaiya' },
          { slug: 'daganbhuiyan', bn: 'দাগনভূঞা', en: 'Daganbhuiyan' },
          { slug: 'parshuram', bn: 'পরশুরাম', en: 'Parshuram' },
          { slug: 'sonagazi', bn: 'সোনাগাজী', en: 'Sonagazi' },
        ],
      },
      {
        slug: 'noakhali', bn: 'নোয়াখালী', en: 'Noakhali',
        upazilas: [
          { slug: 'begumganj', bn: 'বেগমগঞ্জ', en: 'Begumganj' },
          { slug: 'chatkhil', bn: 'চাটখিল', en: 'Chatkhil' },
          { slug: 'companiganj', bn: 'কোম্পানিগঞ্জ', en: 'Companiganj' },
          { slug: 'hatiya', bn: 'হাতিয়া', en: 'Hatiya' },
          { slug: 'kabirhat', bn: 'কবিরহাট', en: 'Kabirhat' },
          { slug: 'noakhali-sadar', bn: 'নোয়াখালী সদর', en: 'Noakhali Sadar' },
          { slug: 'senbagh', bn: 'সেনবাগ', en: 'Senbagh' },
          { slug: 'subarnachar', bn: 'সুবর্ণচর', en: 'Subarnachar' },
        ],
      },
      {
        slug: 'lakshmipur', bn: 'লক্ষ্মীপুর', en: 'Lakshmipur',
        upazilas: [
          { slug: 'lakshmipur-sadar', bn: 'লক্ষ্মীপুর সদর', en: 'Lakshmipur Sadar' },
          { slug: 'kamalnagar', bn: 'কমলনগর', en: 'Kamalnagar' },
          { slug: 'raipur', bn: 'রায়পুর', en: 'Raipur' },
          { slug: 'ramganj', bn: 'রামগঞ্জ', en: 'Ramganj' },
          { slug: 'ramgati', bn: 'রামগতি', en: 'Ramgati' },
        ],
      },
      {
        slug: 'brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া', en: 'Brahmanbaria',
        upazilas: [
          { slug: 'brahmanbaria-sadar', bn: 'ব্রাহ্মণবাড়িয়া সদর', en: 'Brahmanbaria Sadar' },
          { slug: 'akhaura', bn: 'আখাউড়া', en: 'Akhaura' },
          { slug: 'ashuganj', bn: 'আশুগঞ্জ', en: 'Ashuganj' },
          { slug: 'bancharampur', bn: 'বাঞ্ছারামপুর', en: 'Bancharampur' },
          { slug: 'bijoynagar', bn: 'বিজয়নগর', en: 'Bijoynagar' },
          { slug: 'kasba', bn: 'কসবা', en: 'Kasba' },
          { slug: 'nabinagar', bn: 'নবীনগর', en: 'Nabinagar' },
          { slug: 'nasirnagar', bn: 'নাসিরনগর', en: 'Nasirnagar' },
          { slug: 'sarail', bn: 'সরাইল', en: 'Sarail' },
        ],
      },
    ],
  },
  {
    slug: 'rajshahi', bn: 'রাজশাহী', en: 'Rajshahi',
    districts: [
      {
        slug: 'rajshahi', bn: 'রাজশাহী', en: 'Rajshahi',
        upazilas: [
          { slug: 'bagha', bn: 'বাঘা', en: 'Bagha' },
          { slug: 'bagmara', bn: 'বাগমারা', en: 'Bagmara' },
          { slug: 'charghat', bn: 'চারঘাট', en: 'Charghat' },
          { slug: 'durgapur', bn: 'দুর্গাপুর', en: 'Durgapur' },
          { slug: 'godagari', bn: 'গোদাগাড়ী', en: 'Godagari' },
          { slug: 'mohanpur', bn: 'মোহনপুর', en: 'Mohanpur' },
          { slug: 'paba', bn: 'পবা', en: 'Paba' },
          { slug: 'puthia', bn: 'পুঠিয়া', en: 'Puthia' },
          { slug: 'tanore', bn: 'তানোর', en: 'Tanore' },
        ],
      },
      {
        slug: 'bogura', bn: 'বগুড়া', en: 'Bogura',
        upazilas: [
          { slug: 'bogura-sadar', bn: 'বগুড়া সদর', en: 'Bogura Sadar' },
          { slug: 'adamdighi', bn: 'আদমদীঘি', en: 'Adamdighi' },
          { slug: 'dhunat', bn: 'ধুনট', en: 'Dhunat' },
          { slug: 'dupchanchia', bn: 'দুপচাঁচিয়া', en: 'Dupchanchia' },
          { slug: 'gabtali', bn: 'গাবতলী', en: 'Gabtali' },
          { slug: 'kahaloo', bn: 'কাহালু', en: 'Kahaloo' },
          { slug: 'nandigram', bn: 'নন্দীগ্রাম', en: 'Nandigram' },
          { slug: 'sariakandi', bn: 'সারিয়াকান্দি', en: 'Sariakandi' },
          { slug: 'shajahanpur', bn: 'শাজাহানপুর', en: 'Shajahanpur' },
          { slug: 'sherpur-bogura', bn: 'শেরপুর', en: 'Sherpur' },
          { slug: 'shibganj-bogura', bn: 'শিবগঞ্জ', en: 'Shibganj' },
          { slug: 'sonatala', bn: 'সোনাতলা', en: 'Sonatala' },
        ],
      },
      {
        slug: 'chapainawabganj', bn: 'চাঁপাইনবাবগঞ্জ', en: 'Chapainawabganj',
        upazilas: [
          { slug: 'chapainawabganj-sadar', bn: 'চাঁপাইনবাবগঞ্জ সদর', en: 'Chapainawabganj Sadar' },
          { slug: 'gomastapur', bn: 'গোমস্তাপুর', en: 'Gomastapur' },
          { slug: 'nachole', bn: 'নাচোল', en: 'Nachole' },
          { slug: 'shibganj-chapai', bn: 'শিবগঞ্জ', en: 'Shibganj' },
          { slug: 'bholahat', bn: 'ভোলাহাট', en: 'Bholahat' },
        ],
      },
      {
        slug: 'naogaon', bn: 'নওগাঁ', en: 'Naogaon',
        upazilas: [
          { slug: 'naogaon-sadar', bn: 'নওগাঁ সদর', en: 'Naogaon Sadar' },
          { slug: 'atrai', bn: 'আত্রাই', en: 'Atrai' },
          { slug: 'badalgachhi', bn: 'বাদলগাছী', en: 'Badalgachhi' },
          { slug: 'dhamoirhat', bn: 'ধামইরহাট', en: 'Dhamoirhat' },
          { slug: 'manda', bn: 'মান্দা', en: 'Manda' },
          { slug: 'mahadebpur', bn: 'মহাদেবপুর', en: 'Mahadebpur' },
          { slug: 'niamatpur', bn: 'নিয়ামতপুর', en: 'Niamatpur' },
          { slug: 'patnitala', bn: 'পত্নীতলা', en: 'Patnitala' },
          { slug: 'porsha', bn: 'পোরশা', en: 'Porsha' },
          { slug: 'raninagar', bn: 'রাণীনগর', en: 'Raninagar' },
          { slug: 'sapahar', bn: 'সাপাহার', en: 'Sapahar' },
        ],
      },
      {
        slug: 'natore', bn: 'নাটোর', en: 'Natore',
        upazilas: [
          { slug: 'natore-sadar', bn: 'নাটোর সদর', en: 'Natore Sadar' },
          { slug: 'bagatipara', bn: 'বাগাতিপাড়া', en: 'Bagatipara' },
          { slug: 'baraigram', bn: 'বড়াইগ্রাম', en: 'Baraigram' },
          { slug: 'gurudaspur', bn: 'গুরুদাসপুর', en: 'Gurudaspur' },
          { slug: 'lalpur', bn: 'লালপুর', en: 'Lalpur' },
          { slug: 'singra', bn: 'সিংড়া', en: 'Singra' },
        ],
      },
      {
        slug: 'pabna', bn: 'পাবনা', en: 'Pabna',
        upazilas: [
          { slug: 'pabna-sadar', bn: 'পাবনা সদর', en: 'Pabna Sadar' },
          { slug: 'atgharia', bn: 'আটঘরিয়া', en: 'Atgharia' },
          { slug: 'bera', bn: 'বেড়া', en: 'Bera' },
          { slug: 'bhangura', bn: 'ভাঙ্গুড়া', en: 'Bhangura' },
          { slug: 'chatmohar', bn: 'চাটমোহর', en: 'Chatmohar' },
          { slug: 'faridpur-pabna', bn: 'ফরিদপুর', en: 'Faridpur' },
          { slug: 'ishwardi', bn: 'ঈশ্বরদী', en: 'Ishwardi' },
          { slug: 'santhia', bn: 'সাঁথিয়া', en: 'Santhia' },
          { slug: 'sujanagar', bn: 'সুজানগর', en: 'Sujanagar' },
        ],
      },
      {
        slug: 'sirajganj', bn: 'সিরাজগঞ্জ', en: 'Sirajganj',
        upazilas: [
          { slug: 'sirajganj-sadar', bn: 'সিরাজগঞ্জ সদর', en: 'Sirajganj Sadar' },
          { slug: 'belkuchi', bn: 'বেলকুচি', en: 'Belkuchi' },
          { slug: 'chauhali', bn: 'চৌহালি', en: 'Chauhali' },
          { slug: 'kamarkhand', bn: 'কামারখন্দ', en: 'Kamarkhand' },
          { slug: 'kazipur', bn: 'কাজীপুর', en: 'Kazipur' },
          { slug: 'raiganj', bn: 'রায়গঞ্জ', en: 'Raiganj' },
          { slug: 'shahjadpur', bn: 'শাহজাদপুর', en: 'Shahjadpur' },
          { slug: 'tarash', bn: 'তাড়াশ', en: 'Tarash' },
          { slug: 'ullahpara', bn: 'উল্লাপাড়া', en: 'Ullahpara' },
        ],
      },
      {
        slug: 'joypurhat', bn: 'জয়পুরহাট', en: 'Joypurhat',
        upazilas: [
          { slug: 'joypurhat-sadar', bn: 'জয়পুরহাট সদর', en: 'Joypurhat Sadar' },
          { slug: 'akkelpur', bn: 'আক্কেলপুর', en: 'Akkelpur' },
          { slug: 'kalai', bn: 'কালাই', en: 'Kalai' },
          { slug: 'khetlal', bn: 'ক্ষেতলাল', en: 'Khetlal' },
          { slug: 'panchbibi', bn: 'পাঁচবিবি', en: 'Panchbibi' },
        ],
      },
    ],
  },
  {
    slug: 'khulna', bn: 'খুলনা', en: 'Khulna',
    districts: [
      {
        slug: 'khulna', bn: 'খুলনা', en: 'Khulna',
        upazilas: [
          { slug: 'batiaghata', bn: 'বটিয়াঘাটা', en: 'Batiaghata' },
          { slug: 'dacope', bn: 'দাকোপ', en: 'Dacope' },
          { slug: 'dumuria', bn: 'ডুমুরিয়া', en: 'Dumuria' },
          { slug: 'dighalia', bn: 'দীঘলিয়া', en: 'Dighalia' },
          { slug: 'koyra', bn: 'কয়রা', en: 'Koyra' },
          { slug: 'paikgachha', bn: 'পাইকগাছা', en: 'Paikgachha' },
          { slug: 'phultala', bn: 'ফুলতলা', en: 'Phultala' },
          { slug: 'rupsa', bn: 'রূপসা', en: 'Rupsa' },
          { slug: 'terokhada', bn: 'তেরখাদা', en: 'Terokhada' },
        ],
      },
      {
        slug: 'jessore', bn: 'যশোর', en: 'Jessore',
        upazilas: [
          { slug: 'jessore-sadar', bn: 'যশোর সদর', en: 'Jessore Sadar' },
          { slug: 'abhaynagar', bn: 'অভয়নগর', en: 'Abhaynagar' },
          { slug: 'bagherpara', bn: 'বাঘেরপাড়া', en: 'Bagherpara' },
          { slug: 'chaugachha', bn: 'চৌগাছা', en: 'Chaugachha' },
          { slug: 'jhikargachha', bn: 'ঝিকরগাছা', en: 'Jhikargachha' },
          { slug: 'keshabpur', bn: 'কেশবপুর', en: 'Keshabpur' },
          { slug: 'manirampur', bn: 'মণিরামপুর', en: 'Manirampur' },
          { slug: 'sharsha', bn: 'শার্শা', en: 'Sharsha' },
        ],
      },
      {
        slug: 'bagerhat', bn: 'বাগেরহাট', en: 'Bagerhat',
        upazilas: [
          { slug: 'bagerhat-sadar', bn: 'বাগেরহাট সদর', en: 'Bagerhat Sadar' },
          { slug: 'chitalmari', bn: 'চিতলমারী', en: 'Chitalmari' },
          { slug: 'fakirhat', bn: 'ফকিরহাট', en: 'Fakirhat' },
          { slug: 'kachua-bagerhat', bn: 'কচুয়া', en: 'Kachua' },
          { slug: 'mollahat', bn: 'মোল্লাহাট', en: 'Mollahat' },
          { slug: 'mongla', bn: 'মোংলা', en: 'Mongla' },
          { slug: 'morrelganj', bn: 'মোড়েলগঞ্জ', en: 'Morrelganj' },
          { slug: 'rampal', bn: 'রামপাল', en: 'Rampal' },
          { slug: 'sarankhola', bn: 'শরণখোলা', en: 'Sarankhola' },
        ],
      },
      {
        slug: 'satkhira', bn: 'সাতক্ষীরা', en: 'Satkhira',
        upazilas: [
          { slug: 'satkhira-sadar', bn: 'সাতক্ষীরা সদর', en: 'Satkhira Sadar' },
          { slug: 'assasuni', bn: 'আশাশুনি', en: 'Assasuni' },
          { slug: 'debhata', bn: 'দেবহাটা', en: 'Debhata' },
          { slug: 'kalaroa', bn: 'কলারোয়া', en: 'Kalaroa' },
          { slug: 'kaliganj-satkhira', bn: 'কালিগঞ্জ', en: 'Kaliganj' },
          { slug: 'shyamnagar', bn: 'শ্যামনগর', en: 'Shyamnagar' },
          { slug: 'tala', bn: 'তালা', en: 'Tala' },
        ],
      },
      {
        slug: 'magura', bn: 'মাগুরা', en: 'Magura',
        upazilas: [
          { slug: 'magura-sadar', bn: 'মাগুরা সদর', en: 'Magura Sadar' },
          { slug: 'mohammadpur-magura', bn: 'মোহাম্মদপুর', en: 'Mohammadpur' },
          { slug: 'shalikha', bn: 'শালিখা', en: 'Shalikha' },
          { slug: 'sreepur-magura', bn: 'শ্রীপুর', en: 'Sreepur' },
        ],
      },
      {
        slug: 'narail', bn: 'নড়াইল', en: 'Narail',
        upazilas: [
          { slug: 'narail-sadar', bn: 'নড়াইল সদর', en: 'Narail Sadar' },
          { slug: 'kalia', bn: 'কালিয়া', en: 'Kalia' },
          { slug: 'lohagara-narail', bn: 'লোহাগড়া', en: 'Lohagara' },
        ],
      },
      {
        slug: 'kushtia', bn: 'কুষ্টিয়া', en: 'Kushtia',
        upazilas: [
          { slug: 'kushtia-sadar', bn: 'কুষ্টিয়া সদর', en: 'Kushtia Sadar' },
          { slug: 'bheramara', bn: 'ভেড়ামারা', en: 'Bheramara' },
          { slug: 'daulatpur-kushtia', bn: 'দৌলতপুর', en: 'Daulatpur' },
          { slug: 'khoksa', bn: 'খোকসা', en: 'Khoksa' },
          { slug: 'kumarkhali', bn: 'কুমারখালী', en: 'Kumarkhali' },
          { slug: 'mirpur-kushtia', bn: 'মিরপুর', en: 'Mirpur' },
        ],
      },
      {
        slug: 'meherpur', bn: 'মেহেরপুর', en: 'Meherpur',
        upazilas: [
          { slug: 'meherpur-sadar', bn: 'মেহেরপুর সদর', en: 'Meherpur Sadar' },
          { slug: 'gangni', bn: 'গাংনী', en: 'Gangni' },
          { slug: 'mujibnagar', bn: 'মুজিবনগর', en: 'Mujibnagar' },
        ],
      },
      {
        slug: 'chuadanga', bn: 'চুয়াডাঙ্গা', en: 'Chuadanga',
        upazilas: [
          { slug: 'chuadanga-sadar', bn: 'চুয়াডাঙ্গা সদর', en: 'Chuadanga Sadar' },
          { slug: 'alamdanga', bn: 'আলমডাঙ্গা', en: 'Alamdanga' },
          { slug: 'damurhuda', bn: 'দামুড়হুদা', en: 'Damurhuda' },
          { slug: 'jibannagar', bn: 'জীবননগর', en: 'Jibannagar' },
        ],
      },
      {
        slug: 'jhenaidah', bn: 'ঝিনাইদহ', en: 'Jhenaidah',
        upazilas: [
          { slug: 'jhenaidah-sadar', bn: 'ঝিনাইদহ সদর', en: 'Jhenaidah Sadar' },
          { slug: 'harinakunda', bn: 'হরিণাকুণ্ডু', en: 'Harinakunda' },
          { slug: 'kaliganj-jhenaidah', bn: 'কালীগঞ্জ', en: 'Kaliganj' },
          { slug: 'kotchandpur', bn: 'কোটচাঁদপুর', en: 'Kotchandpur' },
          { slug: 'maheshpur', bn: 'মহেশপুর', en: 'Maheshpur' },
          { slug: 'shailkupa', bn: 'শৈলকুপা', en: 'Shailkupa' },
        ],
      },
    ],
  },
  {
    slug: 'barishal', bn: 'বরিশাল', en: 'Barishal',
    districts: [
      {
        slug: 'barishal', bn: 'বরিশাল', en: 'Barishal',
        upazilas: [
          { slug: 'agailjhara', bn: 'আগৈলঝাড়া', en: 'Agailjhara' },
          { slug: 'babuganj', bn: 'বাবুগঞ্জ', en: 'Babuganj' },
          { slug: 'bakerganj', bn: 'বাকেরগঞ্জ', en: 'Bakerganj' },
          { slug: 'banaripara', bn: 'বানারীপাড়া', en: 'Banaripara' },
          { slug: 'gaurnadi', bn: 'গৌরনদী', en: 'Gaurnadi' },
          { slug: 'hizla', bn: 'হিজলা', en: 'Hizla' },
          { slug: 'mehendiganj', bn: 'মেহেন্দিগঞ্জ', en: 'Mehendiganj' },
          { slug: 'muladi', bn: 'মুলাদী', en: 'Muladi' },
          { slug: 'wazirpur', bn: 'উজিরপুর', en: 'Wazirpur' },
        ],
      },
      {
        slug: 'bhola', bn: 'ভোলা', en: 'Bhola',
        upazilas: [
          { slug: 'bhola-sadar', bn: 'ভোলা সদর', en: 'Bhola Sadar' },
          { slug: 'borhanuddin', bn: 'বোরহানউদ্দিন', en: 'Borhanuddin' },
          { slug: 'charfasson', bn: 'চরফ্যাশন', en: 'Charfasson' },
          { slug: 'daulatkhan', bn: 'দৌলতখান', en: 'Daulatkhan' },
          { slug: 'lalmohan', bn: 'লালমোহন', en: 'Lalmohan' },
          { slug: 'manpura', bn: 'মনপুরা', en: 'Manpura' },
          { slug: 'tazumuddin', bn: 'তজুমদ্দিন', en: 'Tazumuddin' },
        ],
      },
      {
        slug: 'patuakhali', bn: 'পটুয়াখালী', en: 'Patuakhali',
        upazilas: [
          { slug: 'patuakhali-sadar', bn: 'পটুয়াখালী সদর', en: 'Patuakhali Sadar' },
          { slug: 'bauphal', bn: 'বাউফল', en: 'Bauphal' },
          { slug: 'dashmina', bn: 'দশমিনা', en: 'Dashmina' },
          { slug: 'dumki', bn: 'দুমকি', en: 'Dumki' },
          { slug: 'galachipa', bn: 'গলাচিপা', en: 'Galachipa' },
          { slug: 'kalapara', bn: 'কলাপাড়া', en: 'Kalapara' },
          { slug: 'mirza-gopalpur', bn: 'মির্জাগঞ্জ', en: 'Mirzaganj' },
          { slug: 'rangabali', bn: 'রাঙ্গাবালী', en: 'Rangabali' },
        ],
      },
      {
        slug: 'pirojpur', bn: 'পিরোজপুর', en: 'Pirojpur',
        upazilas: [
          { slug: 'pirojpur-sadar', bn: 'পিরোজপুর সদর', en: 'Pirojpur Sadar' },
          { slug: 'bhandaria', bn: 'ভান্ডারিয়া', en: 'Bhandaria' },
          { slug: 'kawkhali', bn: 'কাউখালী', en: 'Kawkhali' },
          { slug: 'mathbaria', bn: 'মঠবাড়িয়া', en: 'Mathbaria' },
          { slug: 'nazirpur', bn: 'নাজিরপুর', en: 'Nazirpur' },
          { slug: 'nesarabad', bn: 'নেছারাবাদ', en: 'Nesarabad' },
          { slug: 'zianagar', bn: 'জিয়ানগর', en: 'Zianagar' },
        ],
      },
      {
        slug: 'barguna', bn: 'বরগুনা', en: 'Barguna',
        upazilas: [
          { slug: 'barguna-sadar', bn: 'বরগুনা সদর', en: 'Barguna Sadar' },
          { slug: 'amtali', bn: 'আমতলী', en: 'Amtali' },
          { slug: 'bamna', bn: 'বামনা', en: 'Bamna' },
          { slug: 'betagi', bn: 'বেতাগী', en: 'Betagi' },
          { slug: 'patharghata', bn: 'পাথরঘাটা', en: 'Patharghata' },
          { slug: 'taltali', bn: 'তালতলী', en: 'Taltali' },
        ],
      },
      {
        slug: 'jhalokati', bn: 'ঝালকাঠি', en: 'Jhalokati',
        upazilas: [
          { slug: 'jhalokati-sadar', bn: 'ঝালকাঠি সদর', en: 'Jhalokati Sadar' },
          { slug: 'kathalia', bn: 'কাঁঠালিয়া', en: 'Kathalia' },
          { slug: 'nalchity', bn: 'নলছিটি', en: 'Nalchity' },
          { slug: 'rajapur', bn: 'রাজাপুর', en: 'Rajapur' },
        ],
      },
    ],
  },
  {
    slug: 'sylhet', bn: 'সিলেট', en: 'Sylhet',
    districts: [
      {
        slug: 'sylhet', bn: 'সিলেট', en: 'Sylhet',
        upazilas: [
          { slug: 'sylhet-sadar', bn: 'সিলেট সদর', en: 'Sylhet Sadar' },
          { slug: 'balaganj', bn: 'বালাগঞ্জ', en: 'Balaganj' },
          { slug: 'beanibazar', bn: 'বিয়ানীবাজার', en: 'Beanibazar' },
          { slug: 'bishwanath', bn: 'বিশ্বনাথ', en: 'Bishwanath' },
          { slug: 'companiganj-sylhet', bn: 'কোম্পানিগঞ্জ', en: 'Companiganj' },
          { slug: 'fenchuganj', bn: 'ফেঞ্চুগঞ্জ', en: 'Fenchuganj' },
          { slug: 'golapganj', bn: 'গোলাপগঞ্জ', en: 'Golapganj' },
          { slug: 'gowainghat', bn: 'গোয়াইনঘাট', en: 'Gowainghat' },
          { slug: 'jaintiapur', bn: 'জৈন্তাপুর', en: 'Jaintiapur' },
          { slug: 'kanaighat', bn: 'কানাইঘাট', en: 'Kanaighat' },
          { slug: 'osmani-nagar', bn: 'ওসমানীনগর', en: 'Osmani Nagar' },
          { slug: 'south-surma', bn: 'দক্ষিণ সুরমা', en: 'South Surma' },
          { slug: 'zakiganj', bn: 'জকিগঞ্জ', en: 'Zakiganj' },
        ],
      },
      {
        slug: 'sunamganj', bn: 'সুনামগঞ্জ', en: 'Sunamganj',
        upazilas: [
          { slug: 'sunamganj-sadar', bn: 'সুনামগঞ্জ সদর', en: 'Sunamganj Sadar' },
          { slug: 'bishwamvarpur', bn: 'বিশ্বম্ভরপুর', en: 'Bishwamvarpur' },
          { slug: 'chhatak', bn: 'ছাতক', en: 'Chhatak' },
          { slug: 'derai', bn: 'দিরাই', en: 'Derai' },
          { slug: 'dharampasha', bn: 'ধর্মপাশা', en: 'Dharampasha' },
          { slug: 'dowarabazar', bn: 'দোয়ারাবাজার', en: 'Dowarabazar' },
          { slug: 'jagannathpur', bn: 'জগন্নাথপুর', en: 'Jagannathpur' },
          { slug: 'jamalganj', bn: 'জামালগঞ্জ', en: 'Jamalganj' },
          { slug: 'sullah', bn: 'সুল্লা', en: 'Sullah' },
          { slug: 'tahirpur', bn: 'তাহিরপুর', en: 'Tahirpur' },
        ],
      },
      {
        slug: 'habiganj', bn: 'হবিগঞ্জ', en: 'Habiganj',
        upazilas: [
          { slug: 'habiganj-sadar', bn: 'হবিগঞ্জ সদর', en: 'Habiganj Sadar' },
          { slug: 'ajmiriganj', bn: 'আজমিরিগঞ্জ', en: 'Ajmiriganj' },
          { slug: 'bahubal', bn: 'বাহুবল', en: 'Bahubal' },
          { slug: 'banncharampur-habiganj', bn: 'বানিয়াচং', en: 'Baniachong' },
          { slug: 'chunarughat', bn: 'চুনারুঘাট', en: 'Chunarughat' },
          { slug: 'lakhai', bn: 'লাখাই', en: 'Lakhai' },
          { slug: 'madhabpur', bn: 'মাধবপুর', en: 'Madhabpur' },
          { slug: 'nabiganj', bn: 'নবীগঞ্জ', en: 'Nabiganj' },
        ],
      },
      {
        slug: 'moulvibazar', bn: 'মৌলভীবাজার', en: 'Moulvibazar',
        upazilas: [
          { slug: 'moulvibazar-sadar', bn: 'মৌলভীবাজার সদর', en: 'Moulvibazar Sadar' },
          { slug: 'barlekha', bn: 'বড়লেখা', en: 'Barlekha' },
          { slug: 'juri', bn: 'জুড়ী', en: 'Juri' },
          { slug: 'kamalganj', bn: 'কমলগঞ্জ', en: 'Kamalganj' },
          { slug: 'kulaura', bn: 'কুলাউড়া', en: 'Kulaura' },
          { slug: 'rajnagar', bn: 'রাজনগর', en: 'Rajnagar' },
          { slug: 'sreemangal', bn: 'শ্রীমঙ্গল', en: 'Sreemangal' },
        ],
      },
    ],
  },
  {
    slug: 'rangpur', bn: 'রংপুর', en: 'Rangpur',
    districts: [
      {
        slug: 'rangpur', bn: 'রংপুর', en: 'Rangpur',
        upazilas: [
          { slug: 'rangpur-sadar', bn: 'রংপুর সদর', en: 'Rangpur Sadar' },
          { slug: 'badarganj', bn: 'বদরগঞ্জ', en: 'Badarganj' },
          { slug: 'gangachara', bn: 'গংগাচড়া', en: 'Gangachara' },
          { slug: 'kaunia', bn: 'কাউনিয়া', en: 'Kaunia' },
          { slug: 'mithapukur', bn: 'মিঠাপুকুর', en: 'Mithapukur' },
          { slug: 'pirgachha', bn: 'পীরগাছা', en: 'Pirgachha' },
          { slug: 'pirganj-rangpur', bn: 'পীরগঞ্জ', en: 'Pirganj' },
          { slug: 'taraganj', bn: 'তারাগঞ্জ', en: 'Taraganj' },
        ],
      },
      {
        slug: 'dinajpur', bn: 'দিনাজপুর', en: 'Dinajpur',
        upazilas: [
          { slug: 'dinajpur-sadar', bn: 'দিনাজপুর সদর', en: 'Dinajpur Sadar' },
          { slug: 'birampur', bn: 'বিরামপুর', en: 'Birampur' },
          { slug: 'birganj', bn: 'বীরগঞ্জ', en: 'Birganj' },
          { slug: 'biral', bn: 'বিরল', en: 'Biral' },
          { slug: 'bochaganj', bn: 'বোচাগঞ্জ', en: 'Bochaganj' },
          { slug: 'chirirbandar', bn: 'চিরিরবন্দর', en: 'Chirirbandar' },
          { slug: 'fulbari', bn: 'ফুলবাড়ী', en: 'Fulbari' },
          { slug: 'ghoraghat', bn: 'ঘোড়াঘাট', en: 'Ghoraghat' },
          { slug: 'hakimpur', bn: 'হাকিমপুর', en: 'Hakimpur' },
          { slug: 'kaharole', bn: 'কাহারোল', en: 'Kaharole' },
          { slug: 'khansama', bn: 'খানসামা', en: 'Khansama' },
          { slug: 'nawabganj', bn: 'নবাবগঞ্জ', en: 'Nawabganj' },
          { slug: 'parbatipur', bn: 'পার্বতীপুর', en: 'Parbatipur' },
        ],
      },
      {
        slug: 'gaibandha', bn: 'গাইবান্ধা', en: 'Gaibandha',
        upazilas: [
          { slug: 'gaibandha-sadar', bn: 'গাইবান্ধা সদর', en: 'Gaibandha Sadar' },
          { slug: 'fulchhari', bn: 'ফুলছড়ি', en: 'Fulchhari' },
          { slug: 'gobindaganj', bn: 'গোবিন্দগঞ্জ', en: 'Gobindaganj' },
          { slug: 'palashbari', bn: 'পলাশবাড়ী', en: 'Palashbari' },
          { slug: 'sadullapur', bn: 'সাদুল্লাপুর', en: 'Sadullapur' },
          { slug: 'sghata', bn: 'সাঘাটা', en: 'Saghata' },
          { slug: 'sundarganj', bn: 'সুন্দরগঞ্জ', en: 'Sundarganj' },
        ],
      },
      {
        slug: 'kurigram', bn: 'কুড়িগ্রাম', en: 'Kurigram',
        upazilas: [
          { slug: 'kurigram-sadar', bn: 'কুড়িগ্রাম সদর', en: 'Kurigram Sadar' },
          { slug: 'bhurungamari', bn: 'ভুরুঙ্গামারী', en: 'Bhurungamari' },
          { slug: 'char-rajibpur', bn: 'চর রাজিবপুর', en: 'Char Rajibpur' },
          { slug: 'chilmari', bn: 'চিলমারী', en: 'Chilmari' },
          { slug: 'nageshwari', bn: 'নাগেশ্বরী', en: 'Nageshwari' },
          { slug: 'phulbari-kurigram', bn: 'ফুলবাড়ী', en: 'Phulbari' },
          { slug: 'rajibpur', bn: 'রাজীবপুর', en: 'Rajibpur' },
          { slug: 'rajarhat', bn: 'রাজারহাট', en: 'Rajarhat' },
          { slug: 'raumari', bn: 'রৌমারী', en: 'Raumari' },
          { slug: 'ulipur', bn: 'উলিপুর', en: 'Ulipur' },
        ],
      },
      {
        slug: 'lalmonirhat', bn: 'লালমনিরহাট', en: 'Lalmonirhat',
        upazilas: [
          { slug: 'lalmonirhat-sadar', bn: 'লালমনিরহাট সদর', en: 'Lalmonirhat Sadar' },
          { slug: 'aditmari', bn: 'আদিতমারী', en: 'Aditmari' },
          { slug: 'hatibandha', bn: 'হাতীবান্ধা', en: 'Hatibandha' },
          { slug: 'kaliganj-lalmonirhat', bn: 'কালীগঞ্জ', en: 'Kaliganj' },
          { slug: 'patgram', bn: 'পাটগ্রাম', en: 'Patgram' },
        ],
      },
      {
        slug: 'nilphamari', bn: 'নীলফামারী', en: 'Nilphamari',
        upazilas: [
          { slug: 'nilphamari-sadar', bn: 'নীলফামারী সদর', en: 'Nilphamari Sadar' },
          { slug: 'dimla', bn: 'ডিমলা', en: 'Dimla' },
          { slug: 'domar', bn: 'ডোমার', en: 'Domar' },
          { slug: 'jaldhaka', bn: 'জলঢাকা', en: 'Jaldhaka' },
          { slug: 'kishoreganj-nilphamari', bn: 'কিশোরগঞ্জ', en: 'Kishoreganj' },
          { slug: 'saidpur', bn: 'সৈয়দপুর', en: 'Saidpur' },
        ],
      },
      {
        slug: 'panchagarh', bn: 'পঞ্চগড়', en: 'Panchagarh',
        upazilas: [
          { slug: 'panchagarh-sadar', bn: 'পঞ্চগড় সদর', en: 'Panchagarh Sadar' },
          { slug: 'atwari', bn: 'আটোয়ারী', en: 'Atwari' },
          { slug: 'boda', bn: 'বোদা', en: 'Boda' },
          { slug: 'debiganj', bn: 'দেবীগঞ্জ', en: 'Debiganj' },
          { slug: 'tetulia', bn: 'তেঁতুলিয়া', en: 'Tetulia' },
        ],
      },
      {
        slug: 'thakurgaon', bn: 'ঠাকুরগাঁও', en: 'Thakurgaon',
        upazilas: [
          { slug: 'thakurgaon-sadar', bn: 'ঠাকুরগাঁও সদর', en: 'Thakurgaon Sadar' },
          { slug: 'baliadangi', bn: 'বালিয়াডাঙ্গী', en: 'Baliadangi' },
          { slug: 'haripur', bn: 'হরিপুর', en: 'Haripur' },
          { slug: 'pirganj-thakurgaon', bn: 'পীরগঞ্জ', en: 'Pirganj' },
          { slug: 'ranisankail', bn: 'রাণীশংকৈল', en: 'Ranisankail' },
        ],
      },
    ],
  },
  {
    slug: 'mymensingh', bn: 'ময়মনসিংহ', en: 'Mymensingh',
    districts: [
      {
        slug: 'mymensingh', bn: 'ময়মনসিংহ', en: 'Mymensingh',
        upazilas: [
          { slug: 'mymensingh-sadar', bn: 'ময়মনসিংহ সদর', en: 'Mymensingh Sadar' },
          { slug: 'bhaluka', bn: 'ভালুকা', en: 'Bhaluka' },
          { slug: 'dhobaura', bn: 'ধোবাউড়া', en: 'Dhobaura' },
          { slug: 'fulbaria', bn: 'ফুলবাড়িয়া', en: 'Fulbaria' },
          { slug: 'gaffargaon', bn: 'গফরগাঁও', en: 'Gaffargaon' },
          { slug: 'gauripur', bn: 'গৌরীপুর', en: 'Gauripur' },
          { slug: 'haluaghat', bn: 'হালুয়াঘাট', en: 'Haluaghat' },
          { slug: 'ishwarganj', bn: 'ঈশ্বরগঞ্জ', en: 'Ishwarganj' },
          { slug: 'muktagachha', bn: 'মুক্তাগাছা', en: 'Muktagachha' },
          { slug: 'nandail', bn: 'নান্দাইল', en: 'Nandail' },
          { slug: 'phulpur', bn: 'ফুলপুর', en: 'Phulpur' },
          { slug: 'trishal', bn: 'ত্রিশাল', en: 'Trishal' },
        ],
      },
      {
        slug: 'jamalpur', bn: 'জামালপুর', en: 'Jamalpur',
        upazilas: [
          { slug: 'jamalpur-sadar', bn: 'জামালপুর সদর', en: 'Jamalpur Sadar' },
          { slug: 'bakshiganj', bn: 'বকশীগঞ্জ', en: 'Bakshiganj' },
          { slug: 'dewanganj', bn: 'দেওয়ানগঞ্জ', en: 'Dewanganj' },
          { slug: 'islampur', bn: 'ইসলামপুর', en: 'Islampur' },
          { slug: 'madarganj', bn: 'মাদারগঞ্জ', en: 'Madarganj' },
          { slug: 'melandaha', bn: 'মেলান্দহ', en: 'Melandaha' },
          { slug: 'sarishabari', bn: 'সরিষাবাড়ী', en: 'Sarishabari' },
        ],
      },
      {
        slug: 'netrokona', bn: 'নেত্রকোণা', en: 'Netrokona',
        upazilas: [
          { slug: 'netrokona-sadar', bn: 'নেত্রকোণা সদর', en: 'Netrokona Sadar' },
          { slug: 'atpara', bn: 'আটপাড়া', en: 'Atpara' },
          { slug: 'barhatta', bn: 'বারহাট্টা', en: 'Barhatta' },
          { slug: 'durgapur-netrokona', bn: 'দুর্গাপুর', en: 'Durgapur' },
          { slug: 'kalmakanda', bn: 'কলমাকান্দা', en: 'Kalmakanda' },
          { slug: 'kendua', bn: 'কেন্দুয়া', en: 'Kendua' },
          { slug: 'khaliajuri', bn: 'খালিয়াজুড়ি', en: 'Khaliajuri' },
          { slug: 'madan', bn: 'মদন', en: 'Madan' },
          { slug: 'mohanganj', bn: 'মোহনগঞ্জ', en: 'Mohanganj' },
          { slug: 'purbadhala', bn: 'পূর্বধলা', en: 'Purbadhala' },
        ],
      },
      {
        slug: 'sherpur', bn: 'শেরপুর', en: 'Sherpur',
        upazilas: [
          { slug: 'sherpur-sadar', bn: 'শেরপুর সদর', en: 'Sherpur Sadar' },
          { slug: 'jhenaigati', bn: 'ঝিনাইগাতী', en: 'Jhenaigati' },
          { slug: 'nakla', bn: 'নকলা', en: 'Nakla' },
          { slug: 'nalitabari', bn: 'নালিতাবাড়ী', en: 'Nalitabari' },
          { slug: 'sreebardi', bn: 'শ্রীবরদী', en: 'Sreebardi' },
        ],
      },
    ],
  },
];

/**
 * Lookup helpers — O(n) but data is small and static.
 */
export function findDivision(slug) {
  return BD_DIVISIONS.find(d => d.slug === slug) || null;
}

export function findDistrict(divisionSlug, districtSlug) {
  const div = findDivision(divisionSlug);
  return div ? (div.districts.find(d => d.slug === districtSlug) || null) : null;
}

export function findUpazila(divisionSlug, districtSlug, upazilaSlug) {
  const dist = findDistrict(divisionSlug, districtSlug);
  return dist ? (dist.upazilas.find(u => u.slug === upazilaSlug) || null) : null;
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/data/bdLocations.js
git commit -m "feat: add static Bangladesh geographic hierarchy data (divisions/districts/upazilas)"
```

---

## Task 3: Create `LocationController`

**Files:**
- Create: `app/Http/Controllers/LocationController.php`

The controller handles one Inertia route that determines the level from URL segments and returns props.

- [ ] **Step 1: Create `app/Http/Controllers/LocationController.php`**

```php
<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    protected function getEdition(Request $request): string
    {
        $path = $request->path();
        if ($path === 'en' || str_starts_with($path, 'en/')) {
            return 'en';
        }
        return $request->query('edition') === 'en' ? 'en' : 'bn';
    }

    /**
     * Root level — shows all divisions. No article filtering here, just the map.
     */
    public function index(Request $request)
    {
        $edition = $this->getEdition($request);

        // Count articles per division so UI can show badge counts
        $divisionCounts = Article::published()
            ->selectRaw('division, count(*) as total')
            ->whereNotNull('division')
            ->groupBy('division')
            ->pluck('total', 'division');

        return Inertia::render('Location', [
            'level'          => 'country',
            'division'       => null,
            'district'       => null,
            'upazila'        => null,
            'articles'       => null,
            'divisionCounts' => $divisionCounts,
            'edition'        => $edition,
        ]);
    }

    /**
     * Division level — shows districts within the division + articles.
     */
    public function division(Request $request, string $division)
    {
        $edition = $this->getEdition($request);

        $articles = Article::published()
            ->forEdition($edition)
            ->where('division', $division)
            ->latest('published_at')
            ->paginate(20)
            ->through(fn($a) => $a->toAPIArray($edition));

        $districtCounts = Article::published()
            ->forEdition($edition)
            ->where('division', $division)
            ->selectRaw('district, count(*) as total')
            ->whereNotNull('district')
            ->groupBy('district')
            ->pluck('total', 'district');

        return Inertia::render('Location', [
            'level'          => 'division',
            'division'       => $division,
            'district'       => null,
            'upazila'        => null,
            'articles'       => $articles,
            'districtCounts' => $districtCounts,
            'edition'        => $edition,
        ]);
    }

    /**
     * District level — shows upazilas within the district + articles.
     */
    public function district(Request $request, string $division, string $district)
    {
        $edition = $this->getEdition($request);

        $articles = Article::published()
            ->forEdition($edition)
            ->where('division', $division)
            ->where('district', $district)
            ->latest('published_at')
            ->paginate(20)
            ->through(fn($a) => $a->toAPIArray($edition));

        $upazilaCounts = Article::published()
            ->forEdition($edition)
            ->where('division', $division)
            ->where('district', $district)
            ->selectRaw('upazila, count(*) as total')
            ->whereNotNull('upazila')
            ->groupBy('upazila')
            ->pluck('total', 'upazila');

        return Inertia::render('Location', [
            'level'         => 'district',
            'division'      => $division,
            'district'      => $district,
            'upazila'       => null,
            'articles'      => $articles,
            'upazilaCounts' => $upazilaCounts,
            'edition'       => $edition,
        ]);
    }

    /**
     * Upazila level — shows articles for this specific upazila.
     */
    public function upazila(Request $request, string $division, string $district, string $upazila)
    {
        $edition = $this->getEdition($request);

        $articles = Article::published()
            ->forEdition($edition)
            ->where('division', $division)
            ->where('district', $district)
            ->where('upazila', $upazila)
            ->latest('published_at')
            ->paginate(20)
            ->through(fn($a) => $a->toAPIArray($edition));

        return Inertia::render('Location', [
            'level'    => 'upazila',
            'division' => $division,
            'district' => $district,
            'upazila'  => $upazila,
            'articles' => $articles,
            'edition'  => $edition,
        ]);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Http/Controllers/LocationController.php
git commit -m "feat: add LocationController for saradesh hierarchy"
```

---

## Task 4: Add Routes

**Files:**
- Modify: `routes/web.php`
- Modify: `resources/js/lib/routes.js`

- [ ] **Step 1: Add routes to `routes/web.php`**

In `routes/web.php`, after the `/regional` route (around line 53), add:

```php
// Location hierarchy — saradesh
Route::get('/saradesh', [App\Http\Controllers\LocationController::class, 'index'])->name('location');
Route::get('/saradesh/{division}', [App\Http\Controllers\LocationController::class, 'division'])->name('location.division');
Route::get('/saradesh/{division}/{district}', [App\Http\Controllers\LocationController::class, 'district'])->name('location.district');
Route::get('/saradesh/{division}/{district}/{upazila}', [App\Http\Controllers\LocationController::class, 'upazila'])->name('location.upazila');
```

Also add to the English edition group (after `/en/regional`, around line 371):

```php
Route::get('/saradesh', [App\Http\Controllers\LocationController::class, 'index'])->name('en.location');
Route::get('/saradesh/{division}', [App\Http\Controllers\LocationController::class, 'division'])->name('en.location.division');
Route::get('/saradesh/{division}/{district}', [App\Http\Controllers\LocationController::class, 'district'])->name('en.location.district');
Route::get('/saradesh/{division}/{district}/{upazila}', [App\Http\Controllers\LocationController::class, 'upazila'])->name('en.location.upazila');
```

Also add the `use` statement at the top of `routes/web.php`:

```php
use App\Http\Controllers\LocationController;
```

- [ ] **Step 2: Add route helpers to `resources/js/lib/routes.js`**

In `ROUTES`, after `regional: ...` (line 21), add:

```js
location:        (ed = 'bn') => ed === 'en' ? '/en/saradesh'   : '/saradesh',
locationDiv:     (div, ed = 'bn') => ed === 'en' ? `/en/saradesh/${div}` : `/saradesh/${div}`,
locationDist:    (div, dist, ed = 'bn') => ed === 'en' ? `/en/saradesh/${div}/${dist}` : `/saradesh/${div}/${dist}`,
locationUpazila: (div, dist, uz, ed = 'bn') => ed === 'en' ? `/en/saradesh/${div}/${dist}/${uz}` : `/saradesh/${div}/${dist}/${uz}`,
```

- [ ] **Step 3: Commit**

```bash
git add routes/web.php resources/js/lib/routes.js
git commit -m "feat: add /saradesh location hierarchy routes (4 levels + en mirrors)"
```

---

## Task 5: Create `Location.jsx` Page

**Files:**
- Create: `resources/js/Pages/Location.jsx`

This single component handles all 4 levels. It uses `level` prop to decide which filter tier to show.

- [ ] **Step 1: Create `resources/js/Pages/Location.jsx`**

```jsx
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import PageSidebar from '../Components/PageSidebar';
import Pagination from '../Components/ui/Pagination';
import NewsCard from '../Components/ui/NewsCard';
import EmptyState from '../Components/ui/EmptyState';
import Breadcrumb from '../Components/ui/Breadcrumb';
import {
  BD_DIVISIONS,
  findDivision,
  findDistrict,
  findUpazila,
} from '../data/bdLocations';
import { ROUTES } from '../lib/routes';

function LocationBreadcrumb({ level, division, district, upazila, lang }) {
  const crumbs = [
    { label: lang === 'bn' ? 'সারাদেশ' : 'Bangladesh', href: ROUTES.location(lang) },
  ];

  if (level !== 'country') {
    const divData = findDivision(division);
    if (divData) {
      crumbs.push({
        label: lang === 'bn' ? divData.bn : divData.en,
        href: ROUTES.locationDiv(division, lang),
      });
    }
  }

  if (level === 'district' || level === 'upazila') {
    const distData = findDistrict(division, district);
    if (distData) {
      crumbs.push({
        label: lang === 'bn' ? distData.bn : distData.en,
        href: ROUTES.locationDist(division, district, lang),
      });
    }
  }

  if (level === 'upazila') {
    const uzData = findUpazila(division, district, upazila);
    if (uzData) {
      crumbs.push({
        label: lang === 'bn' ? uzData.bn : uzData.en,
        href: ROUTES.locationUpazila(division, district, upazila, lang),
      });
    }
  }

  return <Breadcrumb items={crumbs} />;
}

function FilterPills({ items, activeFn, hrefFn, lang, countMap }) {
  return (
    <div className="loc-pills">
      {items.map((item) => {
        const isActive = activeFn(item);
        const count = countMap?.[item.slug];
        return (
          <a
            key={item.slug}
            href={hrefFn(item)}
            className={`loc-pill${isActive ? ' on' : ''}`}
          >
            <span>{lang === 'bn' ? item.bn : item.en}</span>
            {count ? <span className="loc-pill-count">{count}</span> : null}
          </a>
        );
      })}
    </div>
  );
}

function DivisionGrid({ lang, divisionCounts }) {
  return (
    <div className="loc-div-grid">
      {BD_DIVISIONS.map((div) => {
        const count = divisionCounts?.[div.slug] || 0;
        return (
          <a key={div.slug} href={ROUTES.locationDiv(div.slug, lang)} className="loc-div-card">
            <div className="loc-div-name">{lang === 'bn' ? div.bn : div.en}</div>
            <div className="loc-div-meta">
              {lang === 'bn' ? `${div.districts.length}টি জেলা` : `${div.districts.length} Districts`}
            </div>
            {count > 0 && (
              <div className="loc-div-count">
                {count} {lang === 'bn' ? 'সংবাদ' : 'news'}
              </div>
            )}
          </a>
        );
      })}
    </div>
  );
}

export default function Location({
  level,
  division,
  district,
  upazila,
  articles,
  divisionCounts,
  districtCounts,
  upazilaCounts,
  edition: serverEdition,
}) {
  const { lang } = useApp();
  const ed = lang;

  const divData = division ? findDivision(division) : null;
  const distData = (division && district) ? findDistrict(division, district) : null;
  const uzData = (division && district && upazila) ? findUpazila(division, district, upazila) : null;

  const pageTitle = () => {
    if (level === 'upazila' && uzData) return lang === 'bn' ? uzData.bn : uzData.en;
    if (level === 'district' && distData) return lang === 'bn' ? distData.bn : distData.en;
    if (level === 'division' && divData) return lang === 'bn' ? divData.bn : divData.en;
    return lang === 'bn' ? 'সারাদেশ' : 'Bangladesh';
  };

  const results = articles?.data || [];

  return (
    <>
      <Head title={`${pageTitle()} | ${lang === 'bn' ? 'প্রতিটি' : 'Provati'}`} />

      <div className="article-layout">
        <div className="article-main">

          {/* Breadcrumb */}
          <LocationBreadcrumb
            level={level}
            division={division}
            district={district}
            upazila={upazila}
            lang={lang}
          />

          {/* Page header */}
          <div className="sec-hdr" style={{ marginBottom: 16 }}>
            <div className="sec-ttl">{pageTitle()}</div>
          </div>

          {/* Country level: show 8-division grid */}
          {level === 'country' && (
            <DivisionGrid lang={lang} divisionCounts={divisionCounts} />
          )}

          {/* Division level: show district pills */}
          {level === 'division' && divData && (
            <>
              <FilterPills
                items={divData.districts}
                activeFn={(d) => d.slug === district}
                hrefFn={(d) => ROUTES.locationDist(division, d.slug, ed)}
                lang={lang}
                countMap={districtCounts}
              />
            </>
          )}

          {/* District level: show upazila pills */}
          {level === 'district' && distData && (
            <FilterPills
              items={distData.upazilas}
              activeFn={(u) => u.slug === upazila}
              hrefFn={(u) => ROUTES.locationUpazila(division, district, u.slug, ed)}
              lang={lang}
              countMap={upazilaCounts}
            />
          )}

          {/* Article list — shown for division/district/upazila levels */}
          {level !== 'country' && (
            <>
              {results.length === 0 ? (
                <EmptyState
                  titleBn="এই এলাকায় কোনো সংবাদ পাওয়া যায়নি"
                  titleEn="No articles found for this location"
                />
              ) : (
                <div className="g2" style={{ rowGap: 20, marginTop: 20 }}>
                  {results.map((article) => (
                    <NewsCard key={article.id} article={article} variant="featured" imgH={160} />
                  ))}
                </div>
              )}
              {articles && <Pagination links={articles.links} />}
            </>
          )}

        </div>
        <PageSidebar />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Add CSS for location page to `public/css/app.css` (or `resources/css/app.css`)**

Find `app.css` and append these classes:

```css
/* ── Location / Saradesh hierarchy page ── */
.loc-div-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.loc-div-card {
  display: block;
  padding: 16px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  text-decoration: none;
  color: var(--text);
  transition: border-color .15s, box-shadow .15s;
}
.loc-div-card:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}
.loc-div-name {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 4px;
}
.loc-div-meta {
  font-size: .78rem;
  color: var(--text-muted);
}
.loc-div-count {
  font-size: .75rem;
  color: var(--accent);
  margin-top: 6px;
  font-weight: 600;
}
.loc-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.loc-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: .82rem;
  text-decoration: none;
  color: var(--text);
  transition: background .15s, border-color .15s;
}
.loc-pill:hover,
.loc-pill.on {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.loc-pill-count {
  background: rgba(0,0,0,.12);
  border-radius: 10px;
  padding: 1px 6px;
  font-size: .72rem;
  line-height: 1.4;
}
.loc-pill.on .loc-pill-count {
  background: rgba(255,255,255,.25);
}
@media (max-width: 480px) {
  .loc-div-grid { grid-template-columns: repeat(2, 1fr); }
}
```

- [ ] **Step 3: Verify CSS file location**

Run:
```
php artisan route:list | grep saradesh
```
Expected: 4 rows (location, location.division, location.district, location.upazila) + 4 en.* mirrors.

- [ ] **Step 4: Commit**

```bash
git add resources/js/Pages/Location.jsx
git commit -m "feat: add Location.jsx — saradesh hierarchy page with division grid, district/upazila pill filters, article list"
```

- [ ] **Step 5: Add CSS and commit**

Find the app.css file (likely `resources/css/app.css`) and append the CSS from Step 2.

```bash
git add resources/css/app.css
git commit -m "feat: add .loc-* CSS for saradesh location hierarchy page"
```

---

## Task 6: Wire Navigation Entry

**Files:**
- Modify: `resources/js/Components/Navigation.jsx` (add সারাদেশ link)

- [ ] **Step 1: Locate the Navigation component**

Open `resources/js/Components/Navigation.jsx`. Find where `/regional` or `ROUTES.regional` is referenced — there will be a nav link for "সারাদেশ" or "Regional".

- [ ] **Step 2: Add or update the link**

If the nav currently links to `/regional`, add a new link for সারাদেশ using `ROUTES.location(lang)`. Example — find the nav items array and add/replace:

```jsx
{ label: lang === 'bn' ? 'সারাদেশ' : 'Bangladesh', href: ROUTES.location(lang) }
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/Navigation.jsx
git commit -m "feat: add সারাদেশ nav link pointing to /saradesh"
```

---

## Self-Review

### Spec coverage check

| Requirement | Covered by |
|-------------|-----------|
| Desh/Saradesh top level | Task 3 `index()` + Task 5 `DivisionGrid` |
| Bivag (Division) drill-down | Task 3 `division()` + Task 5 `FilterPills` for districts |
| Zilla/District drill-down | Task 3 `district()` + Task 5 `FilterPills` for upazilas |
| Upazila drill-down | Task 3 `upazila()` + Task 5 article list |
| Proper filters | Task 5 `FilterPills` with count badges |
| Dedicated page | Task 5 single `Location.jsx` |
| URL pattern (jugantor-style) | `/saradesh/{division}/{district}/{upazila}` — Task 4 |
| Article counts per location | `divisionCounts`/`districtCounts`/`upazilaCounts` props — Task 3 |
| Bilingual (bn/en) | All labels use `lang` from `useApp()`, `bd`/`en` fields in data |
| English edition mirrors | `/en/saradesh/...` routes — Task 4 |
| Breadcrumb navigation | `LocationBreadcrumb` component — Task 5 |
| Upazila in articles | Task 1 migration + `$fillable` |

### Placeholder scan
No TBDs, no "implement later". All code is complete.

### Type consistency
- `BD_DIVISIONS`, `findDivision`, `findDistrict`, `findUpazila` defined in Task 2 and used in Task 5 — consistent.
- `ROUTES.location`, `ROUTES.locationDiv`, `ROUTES.locationDist`, `ROUTES.locationUpazila` defined in Task 4 and used in Task 5 — consistent.
- Controller method names (`index`, `division`, `district`, `upazila`) match routes in Task 4 — consistent.
- `level` prop values (`'country'`, `'division'`, `'district'`, `'upazila'`) match conditionals in `Location.jsx` — consistent.

---
