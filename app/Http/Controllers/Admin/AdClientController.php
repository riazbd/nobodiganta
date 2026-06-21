<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdClient;
use Illuminate\Http\Request;

class AdClientController extends Controller
{
    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        AdClient::create($this->validated($request));

        return back()->with('success', 'Client created successfully');
    }

    public function update(Request $request, AdClient $client)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        $client->update($this->validated($request));

        return back()->with('success', 'Client updated successfully');
    }

    public function destroy(AdClient $client)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        // ads.client_id is null-on-delete, so campaigns survive (just unlinked).
        $client->delete();

        return back()->with('success', 'Client deleted successfully');
    }

    private function validated(Request $request): array
    {
        $v = $request->validate([
            'name' => 'required|string|max:255',
            'contactPerson' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'logo' => 'nullable|string',
            'notes' => 'nullable|string',
            'isActive' => 'boolean',
        ]);

        return [
            'name' => $v['name'],
            'contact_person' => $v['contactPerson'] ?? null,
            'email' => $v['email'] ?? null,
            'phone' => $v['phone'] ?? null,
            'website' => $v['website'] ?? null,
            'logo' => $v['logo'] ?? null,
            'notes' => $v['notes'] ?? null,
            'is_active' => $v['isActive'] ?? true,
        ];
    }
}
