<?php
namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class WeatherService
{
    private const BASE = 'https://api.open-meteo.com/v1/forecast';

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
                'latitude'      => $lat,
                'longitude'     => $lng,
                'current'       => 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
                'daily'         => 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
                'timezone'      => 'Asia/Dhaka',
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
        $cities  = config('bangladesh_cities.cities');
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
