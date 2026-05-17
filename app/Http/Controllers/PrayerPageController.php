<?php

namespace App\Http\Controllers;

use App\Services\PrayerTimeService;
use Illuminate\Http\Request;

class PrayerPageController extends Controller
{
    public function __construct(private PrayerTimeService $service) {}

    public function api(Request $request): \Illuminate\Http\JsonResponse
    {
        $lat     = $request->query('lat');
        $lng     = $request->query('lng');
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
