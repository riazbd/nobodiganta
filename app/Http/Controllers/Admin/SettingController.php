<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('system.settings')) {
            abort(403);
        }

        $settings = Setting::all()->groupBy('group');

        return Inertia::render('features/admin/pages/system/Settings', [
            'settings' => $settings,
            'groups' => $settings->keys(),
        ]);
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        if (!auth()->user()->hasPermission('system.settings')) {
            abort(403);
        }

        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string', 'exists:settings,key'],
            'settings.*.value' => ['nullable'],
        ]);

        foreach ($validated['settings'] as $item) {
            Setting::where('key', $item['key'])->update([
                'value' => is_bool($item['value']) ? ($item['value'] ? 'true' : 'false') : $item['value']
            ]);
        }

        return back()->with('success', 'Settings updated successfully.');
    }

    /**
     * Upload an image setting (logo, favicon, etc.)
     */
    public function uploadImage(Request $request)
    {
        if (!auth()->user()->hasPermission('system.settings')) {
            abort(403);
        }

        $request->validate([
            'key'  => ['required', 'string', 'exists:settings,key'],
            'file' => ['required', 'file', 'image', 'max:2048'],
        ]);

        $key = $request->input('key');

        // Delete old file if it was stored locally
        $existing = Setting::where('key', $key)->value('value');
        if ($existing && str_starts_with($existing, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $existing));
        }

        $path = $request->file('file')->store("settings", 'public');
        $url  = '/storage/' . $path;

        Setting::where('key', $key)->update(['value' => $url]);

        return response()->json(['url' => $url]);
    }

    /**
     * Delete an image setting (revert to null)
     */
    public function deleteImage(Request $request)
    {
        if (!auth()->user()->hasPermission('system.settings')) {
            abort(403);
        }

        $request->validate([
            'key' => ['required', 'string', 'exists:settings,key'],
        ]);

        $key      = $request->input('key');
        $existing = Setting::where('key', $key)->value('value');

        if ($existing && str_starts_with($existing, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $existing));
        }

        Setting::where('key', $key)->update(['value' => null]);

        return response()->json(['url' => null]);
    }
}
