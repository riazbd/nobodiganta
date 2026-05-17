# Real-Time Prayer Times & Weather Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin-managed prayer times and weather system with real-time data from Aladhan API and Open-Meteo, with GPS geolocation, Ramadan detection, a homepage widget section, and a full `/namaz-time` page.

**Architecture:** Two Laravel services (`PrayerTimeService`, `WeatherService`) fetch and cache data from free public APIs. The homepage receives initial data as Inertia props (fast, no client-side flash). City switching and geolocation are handled client-side with fetch to new JSON API routes. The dedicated prayer page adds weekly and monthly views.

**Tech Stack:** Laravel 11, Inertia.js, React JSX, Aladhan API (free, no key), Open-Meteo API (free, no key), Nominatim reverse geocoding (nearest city from config), Laravel Cache facade, localStorage for city persistence.

---

## Data Contracts

### Prayer props shape (passed everywhere)
```json
{
  "city": "Dhaka",
  "city_bn": "ঢাকা",
  "is_location": false,
  "timings": {
    "Imsak": "04:02", "Fajr": "04:12", "Sunrise": "05:33",
    "Dhuhr": "11:58", "Asr": "15:23", "Maghrib": "18:22", "Isha": "19:43"
  },
  "date": { "gregorian": "17 May 2026", "hijri_bn": "১৯ জিলকদ ১৪৪৭", "hijri_month_number": 11 },
  "is_ramadan": false,
  "method": "Muslim World League"
}
```

### Weather props shape
```json
{
  "city": "Dhaka", "city_bn": "ঢাকা",
  "current": { "temp_c": 28.5, "feels_like_c": 33.2, "humidity": 82, "wind_kph": 12.4,
                "weather_code": 3, "condition_bn": "আংশিক মেঘলা", "condition_en": "Partly Cloudy" },
  "forecast": [
    { "date": "2026-05-17", "max_c": 31.2, "min_c": 24.8, "weather_code": 3, "rain_pct": 20 }
  ]
}
```

### Monthly calendar item
```json
{ "day": 1, "date_gregorian": "2026-05-01", "hijri_day_bn": "৩",
  "timings": { "Fajr": "04:15", "Maghrib": "18:19", "Imsak": "04:05" } }
```

---

## File Map

**Create:**
- `config/bangladesh_cities.php`
- `app/Services/PrayerTimeService.php`
- `app/Services/WeatherService.php`
- `app/Http/Controllers/PrayerPageController.php`
- `app/Http/Controllers/WeatherApiController.php`
- `database/migrations/YYYY_drop_prayer_times_and_weathers_tables.php`
- `resources/js/Components/home/PrayerWeatherSection.jsx`
- `resources/js/lib/wmo.js`
- `resources/js/lib/prayerUtils.js`

**Modify:**
- `routes/web.php`
- `app/Http/Controllers/NewsController.php`
- `resources/js/Pages/Home.jsx`
- `resources/js/Pages/PrayerTimes.jsx` (full rewrite)
- `resources/js/features/admin/components/layout/Sidebar.jsx`
- `resources/css/app.css`

**Delete:**
- `app/Http/Controllers/Admin/PrayerTimeController.php`
- `app/Http/Controllers/Admin/WeatherController.php`
- `app/Models/PrayerTime.php`
- `app/Models/Weather.php`
- `resources/js/features/admin/pages/operations/PrayerTimeManagement.jsx`
- `resources/js/features/admin/pages/operations/WeatherManagement.jsx`
- `resources/js/services/prayerService.js`

---

## Task 1: Cleanup — Remove Admin-Managed Prayer & Weather

**Files:**
- Delete: `app/Http/Controllers/Admin/PrayerTimeController.php`
- Delete: `app/Http/Controllers/Admin/WeatherController.php`
- Delete: `app/Models/PrayerTime.php`
- Delete: `app/Models/Weather.php`
- Delete: `resources/js/features/admin/pages/operations/PrayerTimeManagement.jsx`
- Delete: `resources/js/features/admin/pages/operations/WeatherManagement.jsx`
- Delete: `resources/js/services/prayerService.js`
- Create: `database/migrations/YYYY_drop_prayer_times_and_weathers_tables.php`
- Modify: `routes/web.php`
- Modify: `resources/js/features/admin/components/layout/Sidebar.jsx`

- [ ] **Step 1: Delete the six files**

```bash
rm app/Http/Controllers/Admin/PrayerTimeController.php
rm app/Http/Controllers/Admin/WeatherController.php
rm app/Models/PrayerTime.php
rm app/Models/Weather.php
rm resources/js/features/admin/pages/operations/PrayerTimeManagement.jsx
rm resources/js/features/admin/pages/operations/WeatherManagement.jsx
rm resources/js/services/prayerService.js
```

- [ ] **Step 2: Create drop-tables migration**

```bash
php artisan make:migration drop_prayer_times_and_weathers_tables
```

Edit the generated file:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::dropIfExists('prayer_times');
        Schema::dropIfExists('weathers');
    }
    public function down(): void
    {
        Schema::create('prayer_times', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->string('fajr'); $table->string('sunrise');
            $table->string('dhuhr'); $table->string('asr');
            $table->string('maghrib'); $table->string('sunset');
            $table->string('isha'); $table->string('isha_end')->nullable();
            $table->timestamps();
        });
        Schema::create('weathers', function (Blueprint $table) {
            $table->id(); $table->string('city_bn'); $table->string('city_en');
            $table->date('date'); $table->float('temp_c'); $table->string('condition_bn');
            $table->string('condition_en'); $table->integer('humidity');
            $table->float('wind_kph'); $table->float('max_temp_c'); $table->float('min_temp_c');
            $table->string('icon')->nullable(); $table->timestamps();
        });
    }
};
```

- [ ] **Step 3: Run the migration**

```bash
php artisan migrate
```

Expected: `Migrated: ..._drop_prayer_times_and_weathers_tables`

- [ ] **Step 4: Remove admin routes from routes/web.php**

Find and delete these lines:

```php
use App\Http\Controllers\Admin\WeatherController;
use App\Http\Controllers\Admin\PrayerTimeController;
```

And these route blocks inside the admin middleware group:
```php
Route::get('/weather', [WeatherController::class, 'index'])->name('weather');
Route::post('/weather', [WeatherController::class, 'store'])->name('weather.store');
Route::delete('/weather/{weather}', [WeatherController::class, 'destroy'])->name('weather.destroy')->whereNumber('weather');
```
```php
Route::get('/prayer-times', [PrayerTimeController::class, 'index'])->name('prayer-times');
Route::post('/prayer-times', [PrayerTimeController::class, 'store'])->name('prayer-times.store');
Route::delete('/prayer-times/{prayerTime}', [PrayerTimeController::class, 'destroy'])->name('prayer-times.destroy')->whereNumber('prayerTime');
```

Also remove the old public API routes (they will be replaced in Task 7):
```php
Route::get('/api/weather', [NewsController::class, 'apiWeather'])->name('api.weather');
Route::get('/api/prayer-times', [NewsController::class, 'apiPrayerTimes'])->name('api.prayer-times');
```

- [ ] **Step 5: Remove prayer/weather from admin Sidebar.jsx**

In `resources/js/features/admin/components/layout/Sidebar.jsx`, if any item has `id: 'weather'` or `id: 'prayer-times'` in the `navSections` array, delete those entries. (Check — they may not be there.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: remove admin-managed prayer/weather, drop DB tables"
```

---

## Task 2: Bangladesh Cities Config

**Files:**
- Create: `config/bangladesh_cities.php`

- [ ] **Step 1: Create the config file**

```php
<?php
// config/bangladesh_cities.php
return [
    'default' => 'dhaka',

    'cities' => [
        'dhaka'       => ['name_en' => 'Dhaka',        'name_bn' => 'ঢাকা',         'lat' => 23.8103,  'lng' => 90.4125,  'country' => 'BD'],
        'chittagong'  => ['name_en' => 'Chittagong',   'name_bn' => 'চট্টগ্রাম',    'lat' => 22.3569,  'lng' => 91.7832,  'country' => 'BD'],
        'sylhet'      => ['name_en' => 'Sylhet',       'name_bn' => 'সিলেট',         'lat' => 24.8949,  'lng' => 91.8687,  'country' => 'BD'],
        'rajshahi'    => ['name_en' => 'Rajshahi',     'name_bn' => 'রাজশাহী',       'lat' => 24.3745,  'lng' => 88.6042,  'country' => 'BD'],
        'khulna'      => ['name_en' => 'Khulna',       'name_bn' => 'খুলনা',         'lat' => 22.8456,  'lng' => 89.5403,  'country' => 'BD'],
        'barisal'     => ['name_en' => 'Barisal',      'name_bn' => 'বরিশাল',        'lat' => 22.7010,  'lng' => 90.3535,  'country' => 'BD'],
        'rangpur'     => ['name_en' => 'Rangpur',      'name_bn' => 'রংপুর',         'lat' => 25.7439,  'lng' => 89.2752,  'country' => 'BD'],
        'mymensingh'  => ['name_en' => 'Mymensingh',   'name_bn' => 'ময়মনসিংহ',     'lat' => 24.7471,  'lng' => 90.4203,  'country' => 'BD'],
        'comilla'     => ['name_en' => 'Comilla',      'name_bn' => 'কুমিল্লা',      'lat' => 23.4607,  'lng' => 91.1809,  'country' => 'BD'],
        'narayanganj' => ['name_en' => 'Narayanganj',  'name_bn' => 'নারায়ণগঞ্জ',   'lat' => 23.6238,  'lng' => 90.4996,  'country' => 'BD'],
        'gazipur'     => ['name_en' => 'Gazipur',      'name_bn' => 'গাজীপুর',       'lat' => 23.9999,  'lng' => 90.4203,  'country' => 'BD'],
        'jessore'     => ['name_en' => 'Jessore',      'name_bn' => 'যশোর',          'lat' => 23.1667,  'lng' => 89.2167,  'country' => 'BD'],
        'bogra'       => ['name_en' => 'Bogra',        'name_bn' => 'বগুড়া',        'lat' => 24.8465,  'lng' => 89.3776,  'country' => 'BD'],
        'coxsbazar'   => ['name_en' => "Cox's Bazar",  'name_bn' => "কক্সবাজার",    'lat' => 21.4272,  'lng' => 92.0058,  'country' => 'BD'],
    ],
];
```

- [ ] **Step 2: Commit**

```bash
git add config/bangladesh_cities.php
git commit -m "feat: add bangladesh cities config with lat/lng"
```

---

## Task 3: PrayerTimeService

**Files:**
- Create: `app/Services/PrayerTimeService.php`

- [ ] **Step 1: Create the service**

```php
<?php
namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class PrayerTimeService
{
    private const METHOD = 1; // Muslim World League
    private const BASE   = 'https://api.aladhan.com/v1';

    private array $hijriMonthsBn = [
        1=>'মুহররম',2=>'সফর',3=>'রবিউল আউয়াল',4=>'রবিউস সানি',
        5=>'জমাদিউল আউয়াল',6=>'জমাদিউস সানি',7=>'রজব',8=>'শাবান',
        9=>'রমজান',10=>'শাওয়াল',11=>'জিলকদ',12=>'জিলহজ',
    ];

    public function getTimingsForCity(string $cityKey, ?string $date = null): ?array
    {
        $cities = config('bangladesh_cities.cities');
        $city   = $cities[$cityKey] ?? $cities['dhaka'];
        $date   = $date ?? now()->toDateString();
        $key    = "prayer_city_{$cityKey}_{$date}";

        return Cache::remember($key, 86400, fn() =>
            $this->fetchByCoords($city['lat'], $city['lng'], $date, $city['name_en'], $city['name_bn'])
        );
    }

    public function getTimingsByCoords(float $lat, float $lng, ?string $date = null): ?array
    {
        $date    = $date ?? now()->toDateString();
        $latR    = round($lat, 4);
        $lngR    = round($lng, 4);
        $key     = "prayer_coords_{$latR}_{$lngR}_{$date}";
        $nearest = $this->nearestCity($lat, $lng);

        return Cache::remember($key, 86400, fn() =>
            $this->fetchByCoords($lat, $lng, $date, $nearest['name_en'] . ' (approx.)', $nearest['name_bn'])
        );
    }

    public function getMonthlyCalendar(string $cityKey, int $month, int $year): array
    {
        $cities = config('bangladesh_cities.cities');
        $city   = $cities[$cityKey] ?? $cities['dhaka'];
        $key    = "prayer_cal_{$cityKey}_{$year}_{$month}";

        return Cache::remember($key, 86400 * 30, function() use ($city, $month, $year) {
            $url = self::BASE . "/calendar/{$year}/{$month}";
            $res = Http::timeout(8)->get($url, [
                'latitude'  => $city['lat'],
                'longitude' => $city['lng'],
                'method'    => self::METHOD,
            ]);
            if (!$res->ok()) return [];
            $days = $res->json('data') ?? [];
            return collect($days)->map(fn($d) => [
                'day'              => (int) $d['date']['gregorian']['day'],
                'date_gregorian'   => $d['date']['gregorian']['date'],
                'hijri_day_bn'     => $this->toBn((string)($d['date']['hijri']['day'] ?? '')),
                'hijri_month_number' => (int) ($d['date']['hijri']['month']['number'] ?? 0),
                'timings'          => $this->filterTimings($d['timings']),
            ])->values()->all();
        });
    }

    public function getCities(): array
    {
        return config('bangladesh_cities.cities');
    }

    private function fetchByCoords(float $lat, float $lng, string $date, string $nameEn, string $nameBn): ?array
    {
        try {
            $ts  = strtotime($date);
            $url = self::BASE . "/timings/{$ts}";
            $res = Http::timeout(8)->get($url, [
                'latitude'  => $lat,
                'longitude' => $lng,
                'method'    => self::METHOD,
            ]);
            if (!$res->ok()) return null;
            $data   = $res->json('data');
            $hijri  = $data['date']['hijri'] ?? [];
            $mNum   = (int) ($hijri['month']['number'] ?? 0);
            $mBn    = $this->hijriMonthsBn[$mNum] ?? '';
            $dayBn  = $this->toBn((string)($hijri['day'] ?? ''));
            $yearBn = $this->toBn((string)($hijri['year'] ?? ''));

            return [
                'city'       => $nameEn,
                'city_bn'    => $nameBn,
                'is_location'=> false,
                'timings'    => $this->filterTimings($data['timings']),
                'date'       => [
                    'gregorian'          => $data['date']['readable'] ?? $date,
                    'hijri_bn'           => "{$dayBn} {$mBn} {$yearBn}",
                    'hijri_month_number' => $mNum,
                ],
                'is_ramadan' => $mNum === 9,
                'method'     => $data['meta']['method']['name'] ?? 'Muslim World League',
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    private function filterTimings(array $timings): array
    {
        $keys = ['Imsak', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        $out  = [];
        foreach ($keys as $k) {
            // Aladhan sometimes appends " (Fajr)" etc — strip it
            $out[$k] = isset($timings[$k]) ? substr(trim($timings[$k]), 0, 5) : null;
        }
        return $out;
    }

    private function nearestCity(float $lat, float $lng): array
    {
        $cities  = config('bangladesh_cities.cities');
        $nearest = null;
        $minDist = PHP_FLOAT_MAX;
        foreach ($cities as $city) {
            $d = $this->haversine($lat, $lng, $city['lat'], $city['lng']);
            if ($d < $minDist) { $minDist = $d; $nearest = $city; }
        }
        return $nearest ?? $cities['dhaka'];
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $r  = 6371;
        $dL = deg2rad($lat2 - $lat1);
        $dG = deg2rad($lng2 - $lng1);
        $a  = sin($dL/2)**2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dG/2)**2;
        return $r * 2 * atan2(sqrt($a), sqrt(1-$a));
    }

    private function toBn(string $s): string
    {
        return strtr($s, ['0'=>'০','1'=>'১','2'=>'২','3'=>'৩','4'=>'৪','5'=>'৫','6'=>'৬','7'=>'৭','8'=>'৮','9'=>'৯']);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Services/PrayerTimeService.php
git commit -m "feat: add PrayerTimeService with Aladhan API, city/coords, Ramadan detection"
```

---

## Task 4: WeatherService

**Files:**
- Create: `app/Services/WeatherService.php`

- [ ] **Step 1: Create the service**

```php
<?php
namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class WeatherService
{
    private const BASE = 'https://api.open-meteo.com/v1/forecast';

    // WMO code → [bn, en]
    private array $wmo = [
        0  => ['পরিষ্কার আকাশ',     'Clear sky'],
        1  => ['প্রায় পরিষ্কার',    'Mainly clear'],
        2  => ['আংশিক মেঘলা',      'Partly cloudy'],
        3  => ['মেঘলা',            'Overcast'],
        45 => ['কুয়াশা',            'Fog'],
        48 => ['ঘন কুয়াশা',        'Icy fog'],
        51 => ['হালকা গুঁড়ি বৃষ্টি','Light drizzle'],
        53 => ['গুঁড়ি বৃষ্টি',     'Drizzle'],
        55 => ['ভারী গুঁড়ি বৃষ্টি', 'Heavy drizzle'],
        61 => ['হালকা বৃষ্টি',     'Light rain'],
        63 => ['মাঝারি বৃষ্টি',    'Moderate rain'],
        65 => ['ভারী বৃষ্টি',      'Heavy rain'],
        71 => ['হালকা তুষার',      'Light snow'],
        73 => ['মাঝারি তুষার',     'Moderate snow'],
        75 => ['ভারী তুষার',       'Heavy snow'],
        80 => ['বৃষ্টির ঝাপটা',    'Rain showers'],
        81 => ['মাঝারি বৃষ্টি',    'Rain showers'],
        82 => ['ভারী বৃষ্টি',      'Heavy showers'],
        95 => ['বজ্রঝড়',           'Thunderstorm'],
        96 => ['শিলাসহ বজ্রঝড়',   'Thunderstorm with hail'],
        99 => ['ভারী শিলাসহ বজ্রঝড়','Thunderstorm with hail'],
    ];

    public function getCurrentAndForecast(string $cityKey, int $days = 7): ?array
    {
        $cities = config('bangladesh_cities.cities');
        $city   = $cities[$cityKey] ?? $cities['dhaka'];
        $key    = "weather_{$cityKey}_{$days}";

        return Cache::remember($key, 1800, fn() =>
            $this->fetch($city['lat'], $city['lng'], $city['name_en'], $city['name_bn'], $days)
        );
    }

    public function getCurrentAndForecastByCoords(float $lat, float $lng, int $days = 7): ?array
    {
        $nearest = $this->nearestCity($lat, $lng);
        $key     = "weather_coords_" . round($lat,2) . "_" . round($lng,2);
        return Cache::remember($key, 1800, fn() =>
            $this->fetch($lat, $lng, $nearest['name_en'], $nearest['name_bn'], $days)
        );
    }

    private function fetch(float $lat, float $lng, string $nameEn, string $nameBn, int $days): ?array
    {
        try {
            $res = Http::timeout(8)->get(self::BASE, [
                'latitude'   => $lat,
                'longitude'  => $lng,
                'current'    => 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
                'daily'      => 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
                'timezone'   => 'Asia/Dhaka',
                'forecast_days' => $days,
            ]);
            if (!$res->ok()) return null;
            $data    = $res->json();
            $current = $data['current'];
            $daily   = $data['daily'];
            $code    = (int)($current['weather_code'] ?? 0);

            return [
                'city'    => $nameEn,
                'city_bn' => $nameBn,
                'current' => [
                    'temp_c'       => round($current['temperature_2m'], 1),
                    'feels_like_c' => round($current['apparent_temperature'], 1),
                    'humidity'     => (int)$current['relative_humidity_2m'],
                    'wind_kph'     => round($current['wind_speed_10m'], 1),
                    'weather_code' => $code,
                    'condition_bn' => $this->condition($code, 'bn'),
                    'condition_en' => $this->condition($code, 'en'),
                ],
                'forecast' => collect($daily['time'])->map(fn($date, $i) => [
                    'date'         => $date,
                    'max_c'        => round($daily['temperature_2m_max'][$i], 1),
                    'min_c'        => round($daily['temperature_2m_min'][$i], 1),
                    'weather_code' => (int)($daily['weather_code'][$i] ?? 0),
                    'rain_pct'     => (int)($daily['precipitation_probability_max'][$i] ?? 0),
                ])->values()->all(),
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    private function condition(int $code, string $lang): string
    {
        $entry = $this->wmo[$code] ?? ['মেঘলা', 'Cloudy'];
        return $lang === 'bn' ? $entry[0] : $entry[1];
    }

    private function nearestCity(float $lat, float $lng): array
    {
        $cities = config('bangladesh_cities.cities');
        $nearest = null; $minDist = PHP_FLOAT_MAX;
        foreach ($cities as $city) {
            $d = $this->haversine($lat, $lng, $city['lat'], $city['lng']);
            if ($d < $minDist) { $minDist = $d; $nearest = $city; }
        }
        return $nearest ?? $cities['dhaka'];
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $r = 6371; $dL = deg2rad($lat2-$lat1); $dG = deg2rad($lng2-$lng1);
        $a = sin($dL/2)**2 + cos(deg2rad($lat1))*cos(deg2rad($lat2))*sin($dG/2)**2;
        return $r * 2 * atan2(sqrt($a), sqrt(1-$a));
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Services/WeatherService.php
git commit -m "feat: add WeatherService with Open-Meteo API, WMO code mapping, city/coords"
```

---

## Task 5: Update NewsController — Home & Prayer Page

**Files:**
- Modify: `app/Http/Controllers/NewsController.php`

- [ ] **Step 1: Add service imports at the top of NewsController**

Find the `use` statements at the top of `app/Http/Controllers/NewsController.php` and add:

```php
use App\Services\PrayerTimeService;
use App\Services\WeatherService;
```

Remove these two imports (models no longer exist):
```php
use App\Models\PrayerTime;
use App\Models\Weather;
```

- [ ] **Step 2: Rewrite the weather and prayer sections in the `home()` method**

Find the `// 7. Weather` and `// 8. Prayer times` blocks (around lines 207–229). Replace them with:

```php
        // 7. Weather (real-time, cached 30min)
        $weatherService = new WeatherService();
        $weather = $weatherService->getCurrentAndForecast('dhaka');

        // 8. Prayer times (real-time, cached 24h)
        $prayerService = new PrayerTimeService();
        $prayerTimes = $prayerService->getTimingsForCity('dhaka');
```

- [ ] **Step 3: Update the `prayerTimes()` method**

Find the `prayerTimes()` method (around line 1082) and replace it:

```php
    public function prayerTimes(Request $request)
    {
        $service  = new PrayerTimeService();
        $cityKey  = $request->query('city', config('bangladesh_cities.default', 'dhaka'));
        $today    = $service->getTimingsForCity($cityKey);
        $calendar = $service->getMonthlyCalendar($cityKey, now()->month, now()->year);
        $cities   = $service->getCities();

        return Inertia::render('PrayerTimes', [
            'today'    => $today,
            'calendar' => $calendar,
            'cities'   => $cities,
            'cityKey'  => $cityKey,
        ]);
    }
```

- [ ] **Step 4: Remove the old `apiPrayerTimes` and `apiWeather` methods**

Delete the entire `apiPrayerTimes()` method (~lines 793–809) and the entire `apiWeather()` method (~lines 697–713). These are replaced by the new controllers in Task 6.

- [ ] **Step 5: Verify build compiles (PHP syntax check)**

```bash
php artisan route:list --name=home 2>&1 | head -5
```

Expected: No PHP errors, route listed.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/NewsController.php
git commit -m "feat: NewsController uses PrayerTimeService and WeatherService for home props"
```

---

## Task 6: New Public API Controllers

**Files:**
- Create: `app/Http/Controllers/PrayerPageController.php`
- Create: `app/Http/Controllers/WeatherApiController.php`

- [ ] **Step 1: Create PrayerPageController**

```php
<?php
namespace App\Http\Controllers;

use App\Services\PrayerTimeService;
use Illuminate\Http\Request;

class PrayerPageController extends Controller
{
    public function __construct(private PrayerTimeService $service) {}

    public function api(Request $request): \Illuminate\Http\JsonResponse
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');
        $cityKey = $request->query('city', 'dhaka');

        if ($lat && $lng) {
            $data = $this->service->getTimingsByCoords((float)$lat, (float)$lng);
            if ($data) $data['is_location'] = true;
        } else {
            $data = $this->service->getTimingsForCity($cityKey);
        }

        return response()->json(['data' => $data]);
    }

    public function monthly(Request $request): \Illuminate\Http\JsonResponse
    {
        $cityKey = $request->query('city', 'dhaka');
        $month   = (int) $request->query('month', now()->month);
        $year    = (int) $request->query('year', now()->year);

        $data = $this->service->getMonthlyCalendar($cityKey, $month, $year);
        return response()->json(['data' => $data]);
    }
}
```

- [ ] **Step 2: Create WeatherApiController**

```php
<?php
namespace App\Http\Controllers;

use App\Services\WeatherService;
use Illuminate\Http\Request;

class WeatherApiController extends Controller
{
    public function __construct(private WeatherService $service) {}

    public function api(Request $request): \Illuminate\Http\JsonResponse
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');
        $cityKey = $request->query('city', 'dhaka');

        if ($lat && $lng) {
            $data = $this->service->getCurrentAndForecastByCoords((float)$lat, (float)$lng);
        } else {
            $data = $this->service->getCurrentAndForecast($cityKey);
        }

        return response()->json(['data' => $data]);
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Http/Controllers/PrayerPageController.php app/Http/Controllers/WeatherApiController.php
git commit -m "feat: add PrayerPageController and WeatherApiController for public JSON APIs"
```

---

## Task 7: Update Routes

**Files:**
- Modify: `routes/web.php`

- [ ] **Step 1: Add imports for new controllers at the top of web.php**

```php
use App\Http\Controllers\PrayerPageController;
use App\Http\Controllers\WeatherApiController;
```

- [ ] **Step 2: Update the public `/prayer-times` route**

Find:
```php
Route::get('/prayer-times', [NewsController::class, 'prayerTimes'])->name('prayer-times');
```

It stays. Also find any English equivalent:
```php
Route::get('/prayer-times', [NewsController::class, 'prayerTimes'])->name('en.prayer-times');
```

These stay pointing to `NewsController::prayerTimes` — no change needed since we updated that method in Task 5.

- [ ] **Step 3: Add new public API routes**

Find the block of `Route::get('/api/...')` public routes (around line 340) and add:

```php
Route::get('/api/prayer', [PrayerPageController::class, 'api'])->name('api.prayer');
Route::get('/api/prayer-monthly', [PrayerPageController::class, 'monthly'])->name('api.prayer.monthly');
Route::get('/api/weather', [WeatherApiController::class, 'api'])->name('api.weather');
```

- [ ] **Step 4: Verify routes registered**

```bash
php artisan route:list --name=api.prayer
php artisan route:list --name=api.weather
```

Expected: Both routes listed with GET method.

- [ ] **Step 5: Commit**

```bash
git add routes/web.php
git commit -m "feat: add public api/prayer and api/weather routes"
```

---

## Task 8: Frontend Utilities

**Files:**
- Create: `resources/js/lib/wmo.js`
- Create: `resources/js/lib/prayerUtils.js`

- [ ] **Step 1: Create wmo.js**

```js
// resources/js/lib/wmo.js
const WMO = {
  0:  { bn: 'পরিষ্কার আকাশ',      en: 'Clear sky',        emoji: '☀️'  },
  1:  { bn: 'প্রায় পরিষ্কার',     en: 'Mainly clear',     emoji: '🌤️' },
  2:  { bn: 'আংশিক মেঘলা',       en: 'Partly cloudy',    emoji: '⛅'  },
  3:  { bn: 'মেঘলা',             en: 'Overcast',         emoji: '☁️'  },
  45: { bn: 'কুয়াশা',             en: 'Fog',              emoji: '🌫️' },
  48: { bn: 'ঘন কুয়াশা',         en: 'Icy fog',          emoji: '🌫️' },
  51: { bn: 'হালকা গুঁড়ি বৃষ্টি', en: 'Light drizzle',   emoji: '🌦️' },
  53: { bn: 'গুঁড়ি বৃষ্টি',      en: 'Drizzle',          emoji: '🌦️' },
  55: { bn: 'ভারী গুঁড়ি বৃষ্টি',  en: 'Heavy drizzle',   emoji: '🌦️' },
  61: { bn: 'হালকা বৃষ্টি',      en: 'Light rain',       emoji: '🌧️' },
  63: { bn: 'মাঝারি বৃষ্টি',     en: 'Moderate rain',    emoji: '🌧️' },
  65: { bn: 'ভারী বৃষ্টি',       en: 'Heavy rain',       emoji: '🌧️' },
  71: { bn: 'হালকা তুষার',       en: 'Light snow',       emoji: '❄️'  },
  73: { bn: 'মাঝারি তুষার',      en: 'Moderate snow',    emoji: '❄️'  },
  75: { bn: 'ভারী তুষার',        en: 'Heavy snow',       emoji: '❄️'  },
  80: { bn: 'বৃষ্টির ঝাপটা',     en: 'Rain showers',     emoji: '🌦️' },
  81: { bn: 'মাঝারি বৃষ্টি',     en: 'Rain showers',     emoji: '🌧️' },
  82: { bn: 'ভারী বৃষ্টি',       en: 'Heavy showers',    emoji: '🌧️' },
  95: { bn: 'বজ্রঝড়',            en: 'Thunderstorm',     emoji: '⛈️' },
  96: { bn: 'শিলাসহ বজ্রঝড়',    en: 'Thunderstorm',     emoji: '⛈️' },
  99: { bn: 'ভারী শিলাসহ বজ্রঝড়',en: 'Thunderstorm',    emoji: '⛈️' },
};

export function wmoLabel(code, lang = 'bn') {
  const entry = WMO[code] ?? WMO[0];
  return lang === 'bn' ? entry.bn : entry.en;
}

export function wmoEmoji(code) {
  return (WMO[code] ?? WMO[0]).emoji;
}
```

- [ ] **Step 2: Create prayerUtils.js**

```js
// resources/js/lib/prayerUtils.js

const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const NAMES = {
  Imsak:   { bn: 'সেহরির শেষ সময়', en: 'Imsak (Suhoor ends)' },
  Fajr:    { bn: 'ফজর',            en: 'Fajr'     },
  Sunrise: { bn: 'সূর্যোদয়',       en: 'Sunrise'  },
  Dhuhr:   { bn: 'যোহর',           en: 'Dhuhr'    },
  Asr:     { bn: 'আসর',            en: 'Asr'      },
  Maghrib: { bn: 'মাগরিব',         en: 'Maghrib'  },
  Isha:    { bn: 'এশা',            en: 'Isha'     },
};

// Ramadan labels override normal labels
const RAMADAN_LABELS = {
  Fajr:    { bn: 'ফজর / সেহরি শেষ',  en: 'Fajr / Suhoor ends' },
  Maghrib: { bn: 'মাগরিব / ইফতার 🌙', en: 'Maghrib / Iftar 🌙' },
};

export function prayerLabel(key, lang, isRamadan) {
  if (isRamadan && RAMADAN_LABELS[key]) {
    return lang === 'bn' ? RAMADAN_LABELS[key].bn : RAMADAN_LABELS[key].en;
  }
  return lang === 'bn' ? (NAMES[key]?.bn ?? key) : (NAMES[key]?.en ?? key);
}

export function findNextPrayer(timings) {
  const now = new Date();
  for (const name of PRAYER_ORDER) {
    if (!timings[name]) continue;
    const [h, m] = timings[name].split(':').map(Number);
    const t = new Date(); t.setHours(h, m, 0, 0);
    if (t > now) return { name, epochMs: t.getTime() };
  }
  // Past Isha — next is Fajr tomorrow
  const [h, m] = (timings['Fajr'] || '04:00').split(':').map(Number);
  const t = new Date(); t.setDate(t.getDate() + 1); t.setHours(h, m, 0, 0);
  return { name: 'Fajr', epochMs: t.getTime() };
}

export function isPassed(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const t = new Date(); t.setHours(h, m, 0, 0);
  return t < new Date();
}

export function formatCountdown(epochMs) {
  const diff = Math.max(0, epochMs - Date.now());
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function toBn(str) {
  return String(str).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
}

export { PRAYER_ORDER };
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/lib/wmo.js resources/js/lib/prayerUtils.js
git commit -m "feat: add wmo.js and prayerUtils.js frontend utility modules"
```

---

## Task 9: Homepage PrayerWeatherSection Component

**Files:**
- Create: `resources/js/Components/home/PrayerWeatherSection.jsx`
- Modify: `resources/js/Pages/Home.jsx`

- [ ] **Step 1: Create PrayerWeatherSection.jsx**

```jsx
// resources/js/Components/home/PrayerWeatherSection.jsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { wmoEmoji, wmoLabel } from '../../lib/wmo';
import { prayerLabel, findNextPrayer, isPassed, formatCountdown, toBn, PRAYER_ORDER } from '../../lib/prayerUtils';

const CITIES_URL = '/api/prayer';
const WEATHER_URL = '/api/weather';

function useCountdown(epochMs) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    if (!epochMs) return;
    const tick = () => setDisplay(formatCountdown(epochMs));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [epochMs]);
  return display;
}

function CitySelector({ cities, cityKey, onChange, onLocate, lang }) {
  return (
    <div className="pws-city-row">
      <select
        className="pws-city-select"
        value={cityKey}
        onChange={e => onChange(e.target.value)}
      >
        {Object.entries(cities).map(([k, c]) => (
          <option key={k} value={k}>{lang === 'bn' ? c.name_bn : c.name_en}</option>
        ))}
      </select>
      <button className="pws-locate-btn" onClick={onLocate} title={lang === 'bn' ? 'আমার অবস্থান' : 'My location'}>
        📍
      </button>
    </div>
  );
}

function PrayerPanel({ prayer, lang }) {
  const next = prayer ? findNextPrayer(prayer.timings) : null;
  const countdown = useCountdown(next?.epochMs);
  const isRamadan = prayer?.is_ramadan;

  const displayRows = ['Imsak', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].filter(
    k => !isRamadan ? k !== 'Imsak' : true
  );

  return (
    <div className="pws-panel pws-prayer-panel">
      <div className="pws-panel-hdr">
        <span className="pws-panel-icon">🕌</span>
        <span className="pws-panel-title">{lang === 'bn' ? 'নামাজের সময়' : 'Prayer Times'}</span>
        {prayer && <span className="pws-date">{prayer.date.hijri_bn}</span>}
      </div>

      {isRamadan && (
        <div className="pws-ramadan-badge">🌙 {lang === 'bn' ? 'রমজান মোবারক' : 'Ramadan Mubarak'}</div>
      )}

      {prayer ? (
        <>
          <div className="pws-prayer-rows">
            {displayRows.map(key => {
              const time = prayer.timings[key];
              if (!time) return null;
              const isNext   = next?.name === key;
              const passed   = !isNext && isPassed(time);
              const isMaghrib = key === 'Maghrib';
              return (
                <div key={key} className={`pws-prayer-row${isNext ? ' next' : ''}${passed ? ' passed' : ''}${isRamadan && isMaghrib ? ' iftar' : ''}`}>
                  <span className="pws-prayer-name">{prayerLabel(key, lang, isRamadan)}</span>
                  <span className="pws-prayer-time">{lang === 'bn' ? toBn(time) : time}</span>
                  {isNext && <span className="pws-pulse" />}
                </div>
              );
            })}
          </div>
          <div className="pws-countdown">
            <span className="pws-countdown-label">
              {isRamadan && next?.name === 'Maghrib'
                ? (lang === 'bn' ? 'ইফতার বাকি' : 'Iftar in')
                : (lang === 'bn' ? 'পরবর্তী নামাজ' : 'Next prayer')}
            </span>
            <span className="pws-countdown-time">{countdown}</span>
          </div>
        </>
      ) : (
        <div className="pws-empty">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
      )}
    </div>
  );
}

function WeatherPanel({ weather, lang }) {
  const w = weather;
  if (!w) return <div className="pws-panel pws-weather-panel"><div className="pws-empty">...</div></div>;

  return (
    <div className="pws-panel pws-weather-panel">
      <div className="pws-panel-hdr">
        <span className="pws-panel-icon">🌤</span>
        <span className="pws-panel-title">{lang === 'bn' ? 'আবহাওয়া' : 'Weather'}</span>
        <span className="pws-date">{lang === 'bn' ? w.city_bn : w.city}</span>
      </div>

      <div className="pws-weather-main">
        <div className="pws-temp">{lang === 'bn' ? toBn(String(Math.round(w.current.temp_c))) : Math.round(w.current.temp_c)}°<span className="pws-temp-unit">C</span></div>
        <div>
          <div className="pws-condition">{wmoEmoji(w.current.weather_code)} {lang === 'bn' ? w.current.condition_bn : w.current.condition_en}</div>
          <div className="pws-weather-meta">
            💧 {lang === 'bn' ? toBn(String(w.current.humidity)) : w.current.humidity}%
            &nbsp;·&nbsp;
            💨 {lang === 'bn' ? toBn(String(w.current.wind_kph)) : w.current.wind_kph} km/h
          </div>
          <div className="pws-weather-meta">
            {lang === 'bn' ? 'অনুভূতি' : 'Feels like'} {lang === 'bn' ? toBn(String(Math.round(w.current.feels_like_c))) : Math.round(w.current.feels_like_c)}°C
          </div>
        </div>
      </div>

      <div className="pws-forecast">
        {w.forecast.slice(0, 5).map((d, i) => {
          const dayLabel = i === 0 ? (lang === 'bn' ? 'আজ' : 'Today')
            : new Date(d.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' });
          return (
            <div key={d.date} className="pws-forecast-day">
              <div className="pws-forecast-label">{dayLabel}</div>
              <div className="pws-forecast-emoji">{wmoEmoji(d.weather_code)}</div>
              <div className="pws-forecast-temp">
                {lang === 'bn' ? toBn(String(Math.round(d.max_c))) : Math.round(d.max_c)}°
                <span className="pws-forecast-min">/{lang === 'bn' ? toBn(String(Math.round(d.min_c))) : Math.round(d.min_c)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PrayerWeatherSection({ initialPrayer, initialWeather }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();
  const [cityKey, setCityKey]   = useState(() => localStorage.getItem('pws_city') || 'dhaka');
  const [prayer, setPrayer]     = useState(initialPrayer);
  const [weather, setWeather]   = useState(initialWeather);
  const [loading, setLoading]   = useState(false);

  const fetchCity = async (key) => {
    setLoading(true);
    const [pRes, wRes] = await Promise.all([
      fetch(`/api/prayer?city=${key}`).then(r => r.json()),
      fetch(`/api/weather?city=${key}`).then(r => r.json()),
    ]);
    setPrayer(pRes.data);
    setWeather(wRes.data);
    setLoading(false);
  };

  const handleCityChange = (key) => {
    setCityKey(key);
    localStorage.setItem('pws_city', key);
    if (key !== 'dhaka' || !initialPrayer) fetchCity(key);
    else { setPrayer(initialPrayer); setWeather(initialWeather); }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      setLoading(true);
      const { latitude: lat, longitude: lng } = pos.coords;
      localStorage.setItem('pws_lat', lat);
      localStorage.setItem('pws_lng', lng);
      const [pRes, wRes] = await Promise.all([
        fetch(`/api/prayer?lat=${lat}&lng=${lng}`).then(r => r.json()),
        fetch(`/api/weather?lat=${lat}&lng=${lng}`).then(r => r.json()),
      ]);
      if (pRes.data) { pRes.data.is_location = true; setPrayer(pRes.data); }
      if (wRes.data) setWeather(wRes.data);
      setCityKey('__location__');
      setLoading(false);
    }, () => {});
  };

  // On mount: if user had previously saved location, fetch it
  useEffect(() => {
    const savedCity = localStorage.getItem('pws_city');
    const savedLat  = localStorage.getItem('pws_lat');
    const savedLng  = localStorage.getItem('pws_lng');
    if (savedLat && savedLng) {
      handleLocate();
    } else if (savedCity && savedCity !== 'dhaka') {
      fetchCity(savedCity);
    }
  }, []);

  return (
    <div className={`pws-section${prayer?.is_ramadan ? ' pws-ramadan' : ''}`}>
      <div className="pws-inner">
        <div className="pws-header-row">
          <div className="pws-city-wrap">
            <select className="pws-city-select" value={cityKey === '__location__' ? '__location__' : cityKey}
              onChange={e => handleCityChange(e.target.value)} disabled={loading}>
              {cityKey === '__location__' && <option value="__location__">📍 {lang === 'bn' ? 'আপনার অবস্থান' : 'Your location'}</option>}
              <option value="dhaka">{lang === 'bn' ? 'ঢাকা' : 'Dhaka'}</option>
              <option value="chittagong">{lang === 'bn' ? 'চট্টগ্রাম' : 'Chittagong'}</option>
              <option value="sylhet">{lang === 'bn' ? 'সিলেট' : 'Sylhet'}</option>
              <option value="rajshahi">{lang === 'bn' ? 'রাজশাহী' : 'Rajshahi'}</option>
              <option value="khulna">{lang === 'bn' ? 'খুলনা' : 'Khulna'}</option>
              <option value="barisal">{lang === 'bn' ? 'বরিশাল' : 'Barisal'}</option>
              <option value="rangpur">{lang === 'bn' ? 'রংপুর' : 'Rangpur'}</option>
              <option value="mymensingh">{lang === 'bn' ? 'ময়মনসিংহ' : 'Mymensingh'}</option>
              <option value="comilla">{lang === 'bn' ? 'কুমিল্লা' : 'Comilla'}</option>
              <option value="narayanganj">{lang === 'bn' ? 'নারায়ণগঞ্জ' : 'Narayanganj'}</option>
              <option value="gazipur">{lang === 'bn' ? 'গাজীপুর' : 'Gazipur'}</option>
              <option value="jessore">{lang === 'bn' ? 'যশোর' : 'Jessore'}</option>
              <option value="bogra">{lang === 'bn' ? 'বগুড়া' : 'Bogra'}</option>
              <option value="coxsbazar">{lang === 'bn' ? "কক্সবাজার" : "Cox's Bazar"}</option>
            </select>
            <button className="pws-locate-btn" onClick={handleLocate} title={lang === 'bn' ? 'আমার অবস্থান ব্যবহার করুন' : 'Use my location'}>
              📍
            </button>
          </div>
          <button className="pws-more-btn" onClick={() => onNavigate('prayer-times')}>
            {lang === 'bn' ? 'বিস্তারিত সময়সূচি »' : 'Full timetable »'}
          </button>
        </div>

        <div className="pws-panels">
          <PrayerPanel prayer={prayer} lang={lang} />
          <WeatherPanel weather={weather} lang={lang} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update Home.jsx to accept and render PrayerWeatherSection**

In `resources/js/Pages/Home.jsx`:

Add import at the top:
```js
import PrayerWeatherSection from '../Components/home/PrayerWeatherSection';
```

Update the `Home` component signature to accept new props:
```js
export default function Home({
  leadArticles = [],
  breakingNews = [],
  sections     = [],
  opinions     = [],
  mostRead     = [],
  popularTags  = [],
  weather      = null,
  prayerTimes  = null,
}) {
```

Before the closing `</div>` of `<div className="p-body">` (after the `<TagsCloud>` line and before the bottom ad), add:

```jsx
{/* Prayer times & weather section */}
<PrayerWeatherSection initialPrayer={prayerTimes} initialWeather={weather} />
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/home/PrayerWeatherSection.jsx resources/js/Pages/Home.jsx
git commit -m "feat: add PrayerWeatherSection to homepage with city switching and geolocation"
```

---

## Task 10: Prayer Times Full Page Rebuild

**Files:**
- Modify: `resources/js/Pages/PrayerTimes.jsx` (full rewrite)

- [ ] **Step 1: Rewrite PrayerTimes.jsx**

Replace entire file content:

```jsx
import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import MetaTags from '../Components/seo/MetaTags';
import { prayerLabel, findNextPrayer, isPassed, formatCountdown, toBn, PRAYER_ORDER } from '../lib/prayerUtils';
import { wmoEmoji } from '../lib/wmo';

const DISPLAY_KEYS = ['Imsak', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function useCountdown(epochMs) {
  const [display, setDisplay] = useState('--:--:--');
  useEffect(() => {
    if (!epochMs) return;
    const tick = () => setDisplay(formatCountdown(epochMs));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [epochMs]);
  return display;
}

function useLiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2,'0');
      const m = String(now.getMinutes()).padStart(2,'0');
      const s = String(now.getSeconds()).padStart(2,'0');
      setTime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function PrayerTimes({ today: initialToday, calendar: initialCalendar, cities, cityKey: initialCityKey }) {
  const { lang } = useApp();
  const [cityKey, setCityKey]       = useState(initialCityKey || 'dhaka');
  const [today, setToday]           = useState(initialToday);
  const [calendar, setCalendar]     = useState(initialCalendar || []);
  const [calMonth, setCalMonth]     = useState(new Date().getMonth() + 1);
  const [calYear, setCalYear]       = useState(new Date().getFullYear());
  const [expandedDay, setExpandedDay] = useState(null);
  const [locating, setLocating]     = useState(false);
  const clock                       = useLiveClock();
  const next                        = today ? findNextPrayer(today.timings) : null;
  const countdown                   = useCountdown(next?.epochMs);
  const isRamadan                   = today?.is_ramadan;

  const fetchCity = async (key) => {
    const res = await fetch(`/api/prayer?city=${key}`);
    const json = await res.json();
    setToday(json.data);
  };

  const fetchCalendar = async (key, month, year) => {
    const res = await fetch(`/api/prayer-monthly?city=${key}&month=${month}&year=${year}`);
    const json = await res.json();
    setCalendar(json.data || []);
  };

  const handleCityChange = (key) => {
    setCityKey(key);
    localStorage.setItem('pws_city', key);
    fetchCity(key);
    fetchCalendar(key, calMonth, calYear);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      localStorage.setItem('pws_lat', lat);
      localStorage.setItem('pws_lng', lng);
      const res = await fetch(`/api/prayer?lat=${lat}&lng=${lng}`);
      const json = await res.json();
      if (json.data) { setToday({...json.data, is_location: true}); setCityKey('__location__'); }
      setLocating(false);
    }, () => setLocating(false));
  };

  const changeCalMonth = (delta) => {
    let m = calMonth + delta;
    let y = calYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    setCalMonth(m); setCalYear(y);
    fetchCalendar(cityKey === '__location__' ? 'dhaka' : cityKey, m, y);
  };

  const seo = { title: lang === 'bn' ? 'নামাজের সময়সূচি' : 'Prayer Times', lang };
  const displayRows = DISPLAY_KEYS.filter(k => !isRamadan ? k !== 'Imsak' : true);

  return (
    <>
      <MetaTags seo={seo} />
      <Head title={lang === 'bn' ? 'নামাজের সময়সূচি' : 'Prayer Times'} />

      <div className="pp-wrap">

        {/* ── HERO ── */}
        <div className={`pp-hero${isRamadan ? ' pp-hero-ramadan' : ''}`}>
          {isRamadan && (
            <div className="pp-ramadan-banner">
              🌙 {lang === 'bn' ? 'রমজান মোবারক — ' + today.date.hijri_bn : 'Ramadan Mubarak — ' + today.date.hijri_bn}
            </div>
          )}
          <div className="pp-hero-inner">
            <div className="pp-hero-left">
              <div className="pp-clock">{lang === 'bn' ? toBn(clock) : clock}</div>
              <div className="pp-hero-date">{today?.date.gregorian}</div>
              {today && <div className="pp-hero-hijri">{today.date.hijri_bn}</div>}
            </div>
            <div className="pp-hero-right">
              <div className="pp-city-row">
                <select className="pp-city-select" value={cityKey} onChange={e => handleCityChange(e.target.value)}>
                  {cityKey === '__location__' && <option value="__location__">📍 {lang === 'bn' ? 'আপনার অবস্থান' : 'Your location'}</option>}
                  {Object.entries(cities || {}).map(([k, c]) => (
                    <option key={k} value={k}>{lang === 'bn' ? c.name_bn : c.name_en}</option>
                  ))}
                </select>
                <button className="pp-locate-btn" onClick={handleLocate} disabled={locating}>
                  {locating ? '⏳' : '📍'}
                </button>
              </div>
              {next && (
                <div className="pp-next-prayer">
                  <div className="pp-next-label">
                    {isRamadan && next.name === 'Maghrib'
                      ? (lang === 'bn' ? 'ইফতার বাকি' : 'Iftar in')
                      : (lang === 'bn' ? 'পরবর্তী নামাজ: ' + prayerLabel(next.name, lang, isRamadan) : 'Next: ' + prayerLabel(next.name, lang, isRamadan))}
                  </div>
                  <div className="pp-next-countdown">{lang === 'bn' ? toBn(countdown) : countdown}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pp-body">

          {/* ── TODAY'S TIMETABLE ── */}
          <section className="pp-section">
            <h2 className="pp-section-title">{lang === 'bn' ? 'আজকের নামাজের সময়' : "Today's Prayer Times"}</h2>
            <div className="pp-today-grid">
              {displayRows.map(key => {
                const time = today?.timings[key];
                if (!time) return null;
                const isNext    = next?.name === key;
                const passed    = !isNext && key !== 'Imsak' && isPassed(time);
                const isIftar   = isRamadan && key === 'Maghrib';
                const isSehri   = isRamadan && key === 'Imsak';
                return (
                  <div key={key} className={`pp-prayer-card${isNext ? ' pp-next' : ''}${passed ? ' pp-passed' : ''}${isIftar ? ' pp-iftar' : ''}${isSehri ? ' pp-sehri' : ''}`}>
                    {isIftar && <div className="pp-iftar-badge">🌙 ইফতার</div>}
                    {isSehri && <div className="pp-sehri-badge">সেহরি</div>}
                    <div className="pp-prayer-name">{prayerLabel(key, lang, isRamadan)}</div>
                    <div className="pp-prayer-time">{lang === 'bn' ? toBn(time) : time}</div>
                    {isNext && <div className="pp-next-dot" />}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── WEEKLY TIMETABLE ── */}
          {calendar.length > 0 && (
            <section className="pp-section">
              <h2 className="pp-section-title">{lang === 'bn' ? 'সাপ্তাহিক সময়সূচি' : 'Weekly Timetable'}</h2>
              <div className="pp-weekly-wrap">
                <table className="pp-weekly-table">
                  <thead>
                    <tr>
                      <th>{lang === 'bn' ? 'নামাজ' : 'Prayer'}</th>
                      {calendar.slice(0, 7).map(d => {
                        const dt = new Date(d.date_gregorian.split('-').reverse().join('-'));
                        const isToday = dt.toDateString() === new Date().toDateString();
                        return (
                          <th key={d.day} className={isToday ? 'pp-today-col' : ''}>
                            {dt.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short' })}
                            <br /><span className="pp-week-day">{lang === 'bn' ? toBn(String(d.day)) : d.day}</span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {DISPLAY_KEYS.filter(k => k !== 'Imsak' || isRamadan).map(key => (
                      <tr key={key} className={isRamadan && key === 'Maghrib' ? 'pp-iftar-row' : ''}>
                        <td className="pp-row-label">{prayerLabel(key, lang, isRamadan)}</td>
                        {calendar.slice(0, 7).map(d => {
                          const dt = new Date(d.date_gregorian.split('-').reverse().join('-'));
                          const isToday = dt.toDateString() === new Date().toDateString();
                          return (
                            <td key={d.day} className={isToday ? 'pp-today-col' : ''}>
                              {lang === 'bn' ? toBn(d.timings[key] || '') : (d.timings[key] || '—')}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── MONTHLY CALENDAR ── */}
          {calendar.length > 0 && (
            <section className="pp-section">
              <div className="pp-cal-header">
                <button className="pp-cal-nav" onClick={() => changeCalMonth(-1)}>‹</button>
                <h2 className="pp-section-title" style={{ margin: 0 }}>
                  {new Date(calYear, calMonth - 1).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { month: 'long', year: 'numeric' })}
                </h2>
                <button className="pp-cal-nav" onClick={() => changeCalMonth(1)}>›</button>
              </div>
              <div className="pp-cal-grid">
                {calendar.map(d => {
                  const dt = new Date(d.date_gregorian.split('-').reverse().join('-'));
                  const isToday = dt.toDateString() === new Date().toDateString();
                  return (
                    <div key={d.day} className={`pp-cal-cell${isToday ? ' pp-cal-today' : ''}${expandedDay === d.day ? ' pp-cal-expanded' : ''}`}
                      onClick={() => setExpandedDay(expandedDay === d.day ? null : d.day)}>
                      <div className="pp-cal-day">{lang === 'bn' ? toBn(String(d.day)) : d.day}</div>
                      <div className="pp-cal-hijri">{d.hijri_day_bn}</div>
                      <div className="pp-cal-fajr">{lang === 'bn' ? toBn(d.timings.Fajr || '') : d.timings.Fajr}</div>
                      <div className={`pp-cal-maghrib${isRamadan ? ' pp-cal-iftar' : ''}`}>
                        {lang === 'bn' ? toBn(d.timings.Maghrib || '') : d.timings.Maghrib}
                      </div>
                      {expandedDay === d.day && (
                        <div className="pp-cal-expand">
                          {DISPLAY_KEYS.filter(k => k !== 'Imsak' || isRamadan).map(k => d.timings[k] && (
                            <div key={k} className="pp-cal-expand-row">
                              <span>{prayerLabel(k, lang, isRamadan)}</span>
                              <span>{lang === 'bn' ? toBn(d.timings[k]) : d.timings[k]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── ALL CITIES STRIP ── */}
          <section className="pp-section">
            <h2 className="pp-section-title">{lang === 'bn' ? 'বিভিন্ন শহরের সময়' : 'Times by City'}</h2>
            <p className="pp-cities-note">{lang === 'bn' ? 'আজকের ফজর ও মাগরিবের সময়' : "Today's Fajr & Maghrib"}</p>
            <div className="pp-cities-strip">
              {Object.entries(cities || {}).map(([k, c]) => (
                <button key={k} className={`pp-city-chip${k === cityKey ? ' active' : ''}`} onClick={() => handleCityChange(k)}>
                  <div className="pp-city-chip-name">{lang === 'bn' ? c.name_bn : c.name_en}</div>
                  <div className="pp-city-chip-label">{lang === 'bn' ? 'ফজর · মাগরিব' : 'Fajr · Maghrib'}</div>
                </button>
              ))}
            </div>
          </section>

          <div className="pp-method">
            {lang === 'bn' ? 'হিসাব পদ্ধতি: মুসলিম ওয়ার্ল্ড লীগ · উৎস: Aladhan.com' : 'Method: Muslim World League · Source: Aladhan.com'}
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/Pages/PrayerTimes.jsx
git commit -m "feat: full prayer times page with weekly, monthly calendar, geolocation, Ramadan mode"
```

---

## Task 11: CSS

**Files:**
- Modify: `resources/css/app.css`

- [ ] **Step 1: Append CSS at the end of app.css**

```css
/* ══ PRAYER WEATHER SECTION (pws-) ════════════════════════════════════════ */
.pws-section{background:linear-gradient(135deg,#1a2632 0%,#0f3460 60%,#1a2632 100%);padding:28px 0;margin-top:24px;border-top:3px solid var(--primary);}
.pws-section.pws-ramadan{background:linear-gradient(135deg,#1a1200 0%,#3d2800 60%,#1a1200 100%);border-top-color:#c9a227;}
.pws-inner{max-width:1200px;margin:0 auto;padding:0 16px;}
.pws-header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;}
.pws-city-wrap{display:flex;gap:8px;align-items:center;}
.pws-city-select{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:6px 12px;font-family:'SolaimanLipi',sans-serif;font-size:16px;cursor:pointer;outline:none;}
.pws-city-select option{background:#1a2632;color:#fff;}
.pws-locate-btn{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:6px 10px;cursor:pointer;font-size:16px;transition:background .15s;}
.pws-locate-btn:hover{background:rgba(255,255,255,.25);}
.pws-more-btn{background:transparent;border:1px solid rgba(255,255,255,.3);color:rgba(255,255,255,.8);border-radius:8px;padding:6px 14px;font-family:'SolaimanLipi',sans-serif;font-size:15px;cursor:pointer;transition:all .15s;}
.pws-more-btn:hover{border-color:#fff;color:#fff;}
.pws-panels{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
.pws-panel{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:18px;}
.pws-panel-hdr{display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.12);}
.pws-panel-icon{font-size:20px;}
.pws-panel-title{font-family:'SolaimanLipi',sans-serif;font-size:18px;font-weight:700;color:#fff;flex:1;}
.pws-date{font-size:13px;color:rgba(255,255,255,.6);}
.pws-ramadan-badge{background:#c9a227;color:#1a0d00;font-family:'SolaimanLipi',sans-serif;font-size:14px;font-weight:700;padding:4px 12px;border-radius:20px;text-align:center;margin-bottom:10px;}
.pws-prayer-rows{display:flex;flex-direction:column;gap:2px;}
.pws-prayer-row{display:flex;align-items:center;padding:7px 10px;border-radius:7px;transition:background .12s;}
.pws-prayer-row.next{background:rgba(var(--primary-rgb,232,0,30),.2);border:1px solid rgba(var(--primary-rgb,232,0,30),.4);}
.pws-prayer-row.passed{opacity:.45;}
.pws-prayer-row.iftar{background:rgba(201,162,39,.2);border:1px solid rgba(201,162,39,.4);}
.pws-prayer-name{flex:1;font-family:'SolaimanLipi',sans-serif;font-size:16px;color:#fff;}
.pws-prayer-time{font-size:15px;font-weight:700;color:#fff;}
.pws-pulse{width:8px;height:8px;border-radius:50%;background:var(--primary);margin-left:8px;animation:pws-pulse 1.2s ease-in-out infinite;}
@keyframes pws-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.8);}}
.pws-countdown{margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center;}
.pws-countdown-label{font-family:'SolaimanLipi',sans-serif;font-size:14px;color:rgba(255,255,255,.7);}
.pws-countdown-time{font-size:22px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;letter-spacing:.02em;}
.pws-weather-main{display:flex;gap:16px;align-items:flex-start;margin-bottom:14px;}
.pws-temp{font-size:52px;font-weight:800;color:#fff;line-height:1;}
.pws-temp-unit{font-size:24px;font-weight:400;vertical-align:top;margin-top:8px;display:inline-block;}
.pws-condition{font-family:'SolaimanLipi',sans-serif;font-size:17px;color:#fff;margin-bottom:4px;}
.pws-weather-meta{font-size:13px;color:rgba(255,255,255,.7);margin-bottom:2px;}
.pws-forecast{display:flex;gap:6px;margin-top:8px;}
.pws-forecast-day{flex:1;text-align:center;background:rgba(255,255,255,.06);border-radius:8px;padding:8px 4px;}
.pws-forecast-label{font-size:12px;color:rgba(255,255,255,.6);margin-bottom:4px;}
.pws-forecast-emoji{font-size:20px;margin-bottom:4px;}
.pws-forecast-temp{font-size:13px;font-weight:700;color:#fff;}
.pws-forecast-min{font-weight:400;color:rgba(255,255,255,.6);}
.pws-empty{color:rgba(255,255,255,.5);font-size:15px;text-align:center;padding:20px 0;}

/* ══ PRAYER TIMES PAGE (pp-) ════════════════════════════════════════════ */
.pp-wrap{max-width:1100px;margin:0 auto;padding:0 16px 40px;}
.pp-hero{background:linear-gradient(135deg,#1a2632,#0f3460);border-radius:12px;padding:24px;margin:16px 0 24px;}
.pp-hero-ramadan{background:linear-gradient(135deg,#2d1a00,#4a2800);}
.pp-ramadan-banner{background:#c9a227;color:#1a0d00;font-family:'SolaimanLipi',sans-serif;font-size:16px;font-weight:700;padding:8px 16px;border-radius:8px;text-align:center;margin-bottom:16px;}
.pp-hero-inner{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;}
.pp-clock{font-size:42px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;line-height:1;}
.pp-hero-date{font-size:15px;color:rgba(255,255,255,.7);margin-top:4px;}
.pp-hero-hijri{font-family:'SolaimanLipi',sans-serif;font-size:15px;color:rgba(255,255,255,.6);}
.pp-city-row{display:flex;gap:8px;margin-bottom:12px;}
.pp-city-select{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:8px 14px;font-family:'SolaimanLipi',sans-serif;font-size:16px;cursor:pointer;outline:none;}
.pp-city-select option{background:#1a2632;color:#fff;}
.pp-locate-btn{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:8px 12px;cursor:pointer;font-size:16px;}
.pp-next-prayer{text-align:right;}
.pp-next-label{font-family:'SolaimanLipi',sans-serif;font-size:15px;color:rgba(255,255,255,.7);margin-bottom:4px;}
.pp-next-countdown{font-size:36px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;}
.pp-section{margin-bottom:32px;}
.pp-section-title{font-family:'SolaimanLipi',sans-serif;font-size:22px;font-weight:700;color:var(--black);margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid var(--primary);}
.pp-today-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;}
.pp-prayer-card{background:#fff;border:1px solid #e8e8e8;border-radius:10px;padding:16px;text-align:center;position:relative;transition:box-shadow .15s;}
.pp-prayer-card.pp-next{border-color:var(--primary);box-shadow:0 2px 12px rgba(232,0,30,.15);}
.pp-prayer-card.pp-passed{opacity:.5;}
.pp-prayer-card.pp-iftar{border-color:#c9a227;background:#fffbf0;}
.pp-prayer-card.pp-sehri{border-color:#6b8cba;background:#f0f5ff;}
.pp-iftar-badge,.pp-sehri-badge{font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;margin-bottom:6px;display:inline-block;}
.pp-iftar-badge{background:#c9a227;color:#fff;}
.pp-sehri-badge{background:#6b8cba;color:#fff;}
.pp-prayer-name{font-family:'SolaimanLipi',sans-serif;font-size:16px;color:#555;margin-bottom:6px;}
.pp-prayer-time{font-size:22px;font-weight:800;color:#222;}
.pp-next-dot{width:8px;height:8px;border-radius:50%;background:var(--primary);margin:6px auto 0;animation:pws-pulse 1.2s ease-in-out infinite;}
.pp-weekly-wrap{overflow-x:auto;}
.pp-weekly-table{width:100%;border-collapse:collapse;font-size:15px;}
.pp-weekly-table th,.pp-weekly-table td{border:1px solid #e8e8e8;padding:8px 12px;text-align:center;}
.pp-weekly-table th{background:#f8f8f8;font-family:'SolaimanLipi',sans-serif;font-size:15px;}
.pp-today-col{background:#fff5f5;font-weight:700;}
.pp-week-day{font-size:11px;color:#888;}
.pp-row-label{text-align:left;font-family:'SolaimanLipi',sans-serif;font-weight:600;}
.pp-iftar-row td{background:#fffbf0;}
.pp-cal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.pp-cal-nav{background:none;border:1px solid var(--border);border-radius:6px;padding:4px 14px;font-size:20px;cursor:pointer;}
.pp-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}
.pp-cal-cell{border:1px solid #e8e8e8;border-radius:6px;padding:6px;cursor:pointer;min-height:64px;transition:background .12s;}
.pp-cal-cell:hover,.pp-cal-cell.pp-cal-expanded{background:#fff5f5;border-color:var(--primary);}
.pp-cal-today{background:#fff0f0;border-color:var(--primary);}
.pp-cal-day{font-size:15px;font-weight:700;color:#222;}
.pp-cal-hijri{font-size:10px;color:#aaa;margin-bottom:3px;}
.pp-cal-fajr{font-size:11px;color:#555;}
.pp-cal-maghrib{font-size:11px;color:#555;}
.pp-cal-iftar{color:#c9a227;font-weight:700;}
.pp-cal-expand{margin-top:8px;border-top:1px solid #f0f0f0;padding-top:6px;}
.pp-cal-expand-row{display:flex;justify-content:space-between;font-size:11px;padding:1px 0;}
.pp-cities-note{font-size:14px;color:#888;margin:-10px 0 12px;}
.pp-cities-strip{display:flex;flex-wrap:wrap;gap:8px;}
.pp-city-chip{border:1px solid #e8e8e8;background:#fff;border-radius:8px;padding:8px 14px;cursor:pointer;text-align:left;transition:all .15s;}
.pp-city-chip.active,.pp-city-chip:hover{border-color:var(--primary);background:#fff5f5;}
.pp-city-chip-name{font-family:'SolaimanLipi',sans-serif;font-size:15px;font-weight:700;color:#222;}
.pp-city-chip-label{font-size:11px;color:#999;}
.pp-method{font-size:12px;color:#aaa;text-align:center;margin-top:16px;}

/* Mobile */
@media(max-width:767px){
  .pws-panels{grid-template-columns:1fr;}
  .pp-hero-inner{flex-direction:column;}
  .pp-next-prayer{text-align:left;}
  .pp-today-grid{grid-template-columns:repeat(3,1fr);}
  .pp-cal-grid{grid-template-columns:repeat(4,1fr);}
}
```

- [ ] **Step 2: Build to verify no errors**

```bash
npm run build 2>&1 | tail -5
```

Expected: `✓ built in ...` with no errors.

- [ ] **Step 3: Commit**

```bash
git add resources/css/app.css
git commit -m "feat: add prayer weather section and prayer page CSS"
```

---

## Task 12: Final Build & Smoke Test

- [ ] **Step 1: Clear Laravel cache and test APIs**

```bash
php artisan cache:clear
php artisan config:clear
```

Then in a browser or curl:

```bash
curl "http://localhost/api/prayer?city=dhaka" | head -c 500
curl "http://localhost/api/weather?city=dhaka" | head -c 300
```

Expected: JSON responses with `data` containing prayer timings and weather current/forecast.

- [ ] **Step 2: Test geolocation API path**

```bash
curl "http://localhost/api/prayer?lat=23.8103&lng=90.4125" | head -c 500
```

Expected: Same structure with city name (nearest to Dhaka coords).

- [ ] **Step 3: Test monthly calendar**

```bash
php artisan tinker --execute="echo json_encode(app(App\Services\PrayerTimeService::class)->getMonthlyCalendar('dhaka', 5, 2026)[0]);"
```

Expected: JSON object with day, timings, hijri_day_bn fields.

- [ ] **Step 4: Test Ramadan detection**

```bash
php artisan tinker --execute="
  \$s = app(App\Services\PrayerTimeService::class);
  \$t = \$s->getTimingsForCity('dhaka');
  echo 'isRamadan: ' . (\$t['is_ramadan'] ? 'YES' : 'NO') . PHP_EOL;
  echo 'hijri_month: ' . \$t['date']['hijri_month_number'] . PHP_EOL;
"
```

Expected: `isRamadan: NO` (or YES if currently Ramadan), hijri month number printed.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: real-time prayer times and weather — complete implementation"
```
