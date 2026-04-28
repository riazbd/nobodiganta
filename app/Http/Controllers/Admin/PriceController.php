<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Price;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PriceController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('widgets.prices.manage')) {
            abort(403);
        }

        $prices = Price::orderBy('sort_order')->get();

        return Inertia::render('features/admin/pages/operations/PriceManagement', [
            'prices' => $prices,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('widgets.prices.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'key' => 'required|string|unique:prices,key',
            'title_bn' => 'required|string|max:255',
            'title_en' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|max:10',
            'unit' => 'nullable|string|max:20',
            'trend' => 'required|in:up,down,neutral',
            'change' => 'nullable|numeric',
            'sort_order' => 'integer',
        ]);

        Price::create($validated);

        return back()->with('success', 'Price created successfully');
    }

    public function update(Request $request, Price $price)
    {
        if (!auth()->user()->hasPermission('widgets.prices.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'title_bn' => 'required|string|max:255',
            'title_en' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|max:10',
            'unit' => 'nullable|string|max:20',
            'trend' => 'required|in:up,down,neutral',
            'change' => 'nullable|numeric',
            'sort_order' => 'integer',
        ]);

        $price->update($validated);

        return back()->with('success', 'Price updated successfully');
    }

    public function destroy(Price $price)
    {
        if (!auth()->user()->hasPermission('widgets.prices.manage')) {
            abort(403);
        }

        $price->delete();

        return back()->with('success', 'Price deleted');
    }
}
