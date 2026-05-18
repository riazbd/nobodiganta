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

    private array $hijriMonthsEn = [
        1=>'Muharram',2=>'Safar',3=>"Rabi' al-Awwal",4=>"Rabi' al-Thani",
        5=>"Jumada al-Awwal",6=>"Jumada al-Thani",7=>'Rajab',8=>"Sha'ban",
        9=>'Ramadan',10=>'Shawwal',11=>"Dhul Qi'dah",12=>'Dhul Hijjah',
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
            $res = Http::timeout(8)->withoutVerifying()->get($url, [
                'latitude'  => $city['lat'],
                'longitude' => $city['lng'],
                'method'    => self::METHOD,
            ]);
            if (!$res->ok()) return [];
            $days = $res->json('data') ?? [];
            return collect($days)->map(fn($d) => [
                'day'                => (int) $d['date']['gregorian']['day'],
                'date_gregorian'     => $d['date']['gregorian']['date'],
                'hijri_day'          => (int) ($d['date']['hijri']['day'] ?? 0),
                'hijri_day_bn'       => $this->toBn((string)($d['date']['hijri']['day'] ?? '')),
                'hijri_month_number' => (int) ($d['date']['hijri']['month']['number'] ?? 0),
                'hijri_month_bn'     => $this->hijriMonthsBn[(int)($d['date']['hijri']['month']['number'] ?? 0)] ?? '',
                'hijri_month_en'     => $this->hijriMonthsEn[(int)($d['date']['hijri']['month']['number'] ?? 0)] ?? '',
                'hijri_year'         => (int) ($d['date']['hijri']['year'] ?? 0),
                'hijri_year_bn'      => $this->toBn((string)($d['date']['hijri']['year'] ?? '')),
                'timings'            => $this->filterTimings($d['timings']),
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
            $res = Http::timeout(8)->withoutVerifying()->get($url, [
                'latitude'  => $lat,
                'longitude' => $lng,
                'method'    => self::METHOD,
            ]);
            if (!$res->ok()) return null;
            $data   = $res->json('data');
            $hijri  = $data['date']['hijri'] ?? [];
            $mNum   = (int) ($hijri['month']['number'] ?? 0);
            $mBn    = $this->hijriMonthsBn[$mNum] ?? '';
            $mEn    = $this->hijriMonthsEn[$mNum] ?? '';
            $day    = (string)($hijri['day'] ?? '');
            $year   = (string)($hijri['year'] ?? '');
            $dayBn  = $this->toBn($day);
            $yearBn = $this->toBn($year);

            return [
                'city'       => $nameEn,
                'city_bn'    => $nameBn,
                'is_location'=> false,
                'timings'    => $this->filterTimings($data['timings']),
                'date'       => [
                    'gregorian'          => $data['date']['readable'] ?? $date,
                    'hijri_bn'           => "{$dayBn} {$mBn} {$yearBn}",
                    'hijri_en'           => "{$day} {$mEn} {$year}",
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
