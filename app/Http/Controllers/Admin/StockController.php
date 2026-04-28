<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('widgets.stocks.manage')) {
            abort(403);
        }

        $stocks = Stock::orderBy('sort_order')->get();

        return Inertia::render('features/admin/pages/operations/StockManagement', [
            'stocks' => $stocks,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('widgets.stocks.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'name_bn' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'value' => 'required|string',
            'change' => 'required|string',
            'is_up' => 'nullable|boolean',
            'sort_order' => 'integer',
        ]);

        Stock::create($validated);

        return back()->with('success', 'Stock updated successfully');
    }

    public function update(Request $request, Stock $stock)
    {
        if (!auth()->user()->hasPermission('widgets.stocks.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'name_bn' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'value' => 'required|string',
            'change' => 'required|string',
            'is_up' => 'nullable|boolean',
            'sort_order' => 'integer',
        ]);

        $stock->update($validated);

        return back()->with('success', 'Stock updated successfully');
    }

    public function destroy(Stock $stock)
    {
        if (!auth()->user()->hasPermission('widgets.stocks.manage')) {
            abort(403);
        }

        $stock->delete();

        return back()->with('success', 'Stock deleted');
    }
}
