<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Horoscope;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HoroscopeController extends Controller
{
    public function index()
    {
        if (!auth()->user()->hasPermission('widgets.horoscope.manage')) abort(403);
        $horoscopes = Horoscope::latest('date')->get();
        return Inertia::render('features/admin/pages/operations/HoroscopeManagement', ['horoscopes' => $horoscopes]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('widgets.horoscope.manage')) abort(403);
        
        $validated = $request->validate([
            'sign' => 'required|string',
            'sign_bn' => 'required|string',
            'date' => 'required|date',
            'prediction_en' => 'required|string',
            'prediction_bn' => 'required|string',
        ]);

        Horoscope::updateOrCreate(
            ['sign' => $validated['sign'], 'date' => $validated['date']],
            $validated
        );

        return back()->with('success', 'Horoscope saved');
    }

    public function destroy(Horoscope $horoscope)
    {
        if (!auth()->user()->hasPermission('widgets.horoscope.manage')) abort(403);
        $horoscope->delete();
        return back()->with('success', 'Horoscope deleted');
    }
}
