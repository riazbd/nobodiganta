<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Weather;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WeatherController extends Controller
{
    public function index()
    {
        if (!auth()->user()->hasPermission('widgets.weather.manage')) abort(403);
        $weathers = Weather::latest('date')->get();
        return Inertia::render('features/admin/pages/operations/WeatherManagement', ['weathers' => $weathers]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('widgets.weather.manage')) abort(403);
        
        $validated = $request->validate([
            'city_bn' => 'required|string',
            'city_en' => 'required|string',
            'date' => 'required|date',
            'temp_c' => 'required|integer',
            'condition_bn' => 'required|string',
            'condition_en' => 'required|string',
            'humidity' => 'required|integer',
            'wind_kph' => 'required|integer',
            'max_temp_c' => 'required|integer',
            'min_temp_c' => 'required|integer',
            'icon' => 'required|string',
        ]);

        Weather::updateOrCreate(
            ['city_en' => $validated['city_en'], 'date' => $validated['date']],
            $validated
        );

        return back()->with('success', 'Weather record saved');
    }

    public function destroy(Weather $weather)
    {
        if (!auth()->user()->hasPermission('widgets.weather.manage')) abort(403);
        $weather->delete();
        return back()->with('success', 'Weather record deleted');
    }
}
