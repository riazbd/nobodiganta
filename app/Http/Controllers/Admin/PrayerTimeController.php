<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PrayerTime;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PrayerTimeController extends Controller
{
    public function index()
    {
        if (!auth()->user()->hasPermission('widgets.prayer_times.manage')) abort(403);
        $times = PrayerTime::latest('date')->get();
        return Inertia::render('features/admin/pages/operations/PrayerTimeManagement', ['times' => $times]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('widgets.prayer_times.manage')) abort(403);
        
        $validated = $request->validate([
            'date' => 'required|date',
            'fajr' => 'required|string',
            'sunrise' => 'required|string',
            'dhuhr' => 'required|string',
            'asr' => 'required|string',
            'maghrib' => 'required|string',
            'sunset' => 'required|string',
            'isha' => 'required|string',
            'isha_end' => 'nullable|string',
        ]);

        PrayerTime::updateOrCreate(
            ['date' => $validated['date']],
            $validated
        );

        return back()->with('success', 'Prayer Times saved');
    }

    public function destroy(PrayerTime $prayerTime)
    {
        if (!auth()->user()->hasPermission('widgets.prayer_times.manage')) abort(403);
        $prayerTime->delete();
        return back()->with('success', 'Prayer Times deleted');
    }
}
