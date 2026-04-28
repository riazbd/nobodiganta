<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Epaper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EpaperController extends Controller
{
    public function index()
    {
        if (!auth()->user()->hasPermission('system.settings')) abort(403);
        $editions = Epaper::latest('date')->get();
        return Inertia::render('features/admin/pages/EPaperManager', ['editions' => $editions]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('system.settings')) abort(403);
        
        $validated = $request->validate([
            'date' => 'required|date',
            'edition' => 'required|in:bn,en',
            'pdf_url' => 'required|url',
            'thumbnail_url' => 'nullable|url',
            'label_bn' => 'required|string',
            'label_en' => 'required|string',
        ]);

        Epaper::updateOrCreate(
            ['date' => $validated['date'], 'edition' => $validated['edition']],
            $validated
        );

        return back()->with('success', 'E-Paper edition saved');
    }

    public function destroy(Epaper $epaper)
    {
        if (!auth()->user()->hasPermission('system.settings')) abort(403);
        $epaper->delete();
        return back()->with('success', 'E-Paper edition deleted');
    }
}
