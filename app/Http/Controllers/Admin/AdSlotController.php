<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdSlotController extends Controller
{
    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        $v = $this->validated($request);
        $v['key'] = $v['key'] ?: Str::slug($v['name_en'], '_');
        AdSlot::create($v);

        return back()->with('success', 'Slot created successfully');
    }

    public function update(Request $request, AdSlot $slot)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        $v = $this->validated($request, $slot);
        $slot->update($v);

        return back()->with('success', 'Slot updated successfully');
    }

    public function destroy(AdSlot $slot)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        // ads.slot_id is null-on-delete; existing campaigns keep their position string.
        $slot->delete();

        return back()->with('success', 'Slot deleted successfully');
    }

    private function validated(Request $request, ?AdSlot $slot = null): array
    {
        $v = $request->validate([
            'key' => 'nullable|string|max:100|unique:ad_slots,key' . ($slot ? ',' . $slot->id : ''),
            'nameBn' => 'required|string|max:255',
            'nameEn' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'size' => 'required|string|max:50',
            'dimensions' => 'nullable|string|max:50',
            'rate' => 'nullable|numeric|min:0',
            'rateCpm' => 'nullable|numeric|min:0',
            'capacity' => 'required|integer|min:1',
            'isActive' => 'boolean',
            'sortOrder' => 'integer',
        ]);

        return [
            'key' => $v['key'] ?? null,
            'name_bn' => $v['nameBn'],
            'name_en' => $v['nameEn'],
            'description' => $v['description'] ?? null,
            'size' => $v['size'],
            'dimensions' => $v['dimensions'] ?? null,
            'rate' => $v['rate'] ?? null,
            'rate_cpm' => $v['rateCpm'] ?? null,
            'capacity' => $v['capacity'],
            'is_active' => $v['isActive'] ?? true,
            'sort_order' => $v['sortOrder'] ?? 0,
        ];
    }
}
