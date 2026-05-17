<?php

namespace App\Http\Controllers;

use App\Services\WeatherService;
use Illuminate\Http\Request;

class WeatherApiController extends Controller
{
    public function __construct(private WeatherService $service) {}

    public function api(Request $request): \Illuminate\Http\JsonResponse
    {
        $lat     = $request->query('lat');
        $lng     = $request->query('lng');
        $cityKey = $request->query('city', 'dhaka');

        if ($lat && $lng) {
            $data = $this->service->getCurrentAndForecastByCoords((float)$lat, (float)$lng);
        } else {
            $data = $this->service->getCurrentAndForecast($cityKey);
        }

        return response()->json(['data' => $data]);
    }
}
