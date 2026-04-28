<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CricketMatch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CricketMatchController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('widgets.cricket.manage')) {
            abort(403);
        }

        $matches = CricketMatch::orderBy('sort_order')->get();

        return Inertia::render('features/admin/pages/operations/CricketManagement', [
            'matches' => $matches,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('widgets.cricket.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'series_bn' => 'required|string|max:255',
            'series_en' => 'required|string|max:255',
            'status' => 'required|in:live,upcoming,completed',
            'status_text_bn' => 'nullable|string',
            'status_text_en' => 'nullable|string',
            'teams' => 'required|array',
            'sort_order' => 'integer',
        ]);

        CricketMatch::create($validated);

        return back()->with('success', 'Match created successfully');
    }

    public function update(Request $request, CricketMatch $match)
    {
        if (!auth()->user()->hasPermission('widgets.cricket.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'series_bn' => 'required|string|max:255',
            'series_en' => 'required|string|max:255',
            'status' => 'required|in:live,upcoming,completed',
            'status_text_bn' => 'nullable|string',
            'status_text_en' => 'nullable|string',
            'teams' => 'required|array',
            'sort_order' => 'integer',
        ]);

        $match->update($validated);

        return back()->with('success', 'Match updated successfully');
    }

    public function destroy(CricketMatch $match)
    {
        if (!auth()->user()->hasPermission('widgets.cricket.manage')) {
            abort(403);
        }

        $match->delete();

        return back()->with('success', 'Match deleted');
    }
}
