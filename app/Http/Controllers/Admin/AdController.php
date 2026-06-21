<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdClient;
use App\Models\AdSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdController extends Controller
{
    /**
     * The Ad Panel — campaigns, clients, slot inventory and analytics.
     */
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('business.ads.view')) {
            abort(403);
        }

        $query = Ad::with(['client', 'slot']);
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title_bn', 'like', "%{$search}%")
                  ->orWhere('title_en', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%")
                  ->orWhereHas('client', fn($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }
        $ads = $query->orderBy('sort_order')->orderBy('created_at', 'desc')->get();

        $clients = AdClient::orderBy('name')->withCount('ads')->get();
        $slots = AdSlot::orderBy('sort_order')->orderBy('name_en')->get();

        return Inertia::render('features/admin/pages/AdsManagement', [
            'ads'       => $ads->map(fn($ad) => $this->mapAd($ad)),
            'clients'   => $clients->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'contactPerson' => $c->contact_person,
                'email' => $c->email,
                'phone' => $c->phone,
                'website' => $c->website,
                'logo' => $c->logo,
                'notes' => $c->notes,
                'isActive' => $c->is_active,
                'adsCount' => $c->ads_count,
            ]),
            'slots'     => $slots->map(fn($s) => $this->mapSlot($s)),
            'analytics' => $this->analytics($slots),
            'filters'   => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        $validated = $this->validateAd($request);
        Ad::create($this->adAttributes($validated));

        return back()->with('success', 'Ad created successfully');
    }

    public function update(Request $request, Ad $ad)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        $validated = $this->validateAd($request);
        $ad->update($this->adAttributes($validated, $ad));

        return back()->with('success', 'Ad updated successfully');
    }

    public function destroy(Ad $ad)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        $ad->delete();

        return back()->with('success', 'Ad deleted successfully');
    }

    public function toggleStatus(Ad $ad)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        $ad->update(['is_active' => !$ad->is_active]);

        return back()->with('success', 'Ad status updated');
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private function validateAd(Request $request): array
    {
        return $request->validate([
            'titleBn' => 'required|string|max:255',
            'titleEn' => 'required|string|max:255',
            'image' => 'nullable|string',
            'video_url' => 'nullable|string',
            'link' => 'nullable|url',
            'position' => 'nullable|string',
            'type' => 'required|in:image,google_ad,html,video,script',
            'code' => 'nullable|string',
            'startDate' => 'nullable|date',
            'endDate' => 'nullable|date|after_or_equal:startDate',
            'isActive' => 'boolean',
            'sortOrder' => 'integer',
            'clientId' => 'nullable|exists:ad_clients,id',
            'slotId' => 'nullable|exists:ad_slots,id',
            'pricingModel' => 'nullable|in:flat,cpm',
            'price' => 'nullable|numeric|min:0',
            'cpmRate' => 'nullable|numeric|min:0',
        ]);
    }

    private function adAttributes(array $v, ?Ad $ad = null): array
    {
        // The chosen slot drives the serving position so the public site keeps working.
        $position = $v['position'] ?? $ad?->position;
        if (!empty($v['slotId'])) {
            $position = AdSlot::find($v['slotId'])?->key ?? $position;
        }

        return [
            'client_id' => $v['clientId'] ?? null,
            'slot_id' => $v['slotId'] ?? null,
            'title_bn' => $v['titleBn'],
            'title_en' => $v['titleEn'],
            'image' => $v['image'] ?? null,
            'video_url' => $v['video_url'] ?? null,
            'link' => $v['link'] ?? null,
            'position' => $position ?: 'home_top',
            'type' => $v['type'],
            'code' => $v['code'] ?? null,
            'pricing_model' => $v['pricingModel'] ?? 'flat',
            'price' => $v['price'] ?? null,
            'cpm_rate' => $v['cpmRate'] ?? null,
            'start_date' => $v['startDate'] ?? null,
            'end_date' => $v['endDate'] ?? null,
            'is_active' => $v['isActive'] ?? ($ad->is_active ?? true),
            'sort_order' => $v['sortOrder'] ?? ($ad->sort_order ?? 0),
        ];
    }

    private function mapAd(Ad $ad): array
    {
        return [
            'id' => $ad->id,
            'title' => $ad->title_bn,
            'titleEn' => $ad->title_en,
            'image' => $ad->image,
            'video_url' => $ad->video_url,
            'link' => $ad->link,
            'position' => $ad->position,
            'type' => $ad->type,
            'code' => $ad->code,
            'isActive' => $ad->is_active,
            'impressions' => $ad->impressions,
            'clicks' => $ad->clicks,
            'ctr' => $ad->impressions > 0 ? round(($ad->clicks / $ad->impressions) * 100, 2) : 0,
            'startDate' => $ad->start_date?->format('Y-m-d'),
            'endDate' => $ad->end_date?->format('Y-m-d'),
            'sortOrder' => $ad->sort_order,
            'clientId' => $ad->client_id,
            'clientName' => $ad->client?->name,
            'slotId' => $ad->slot_id,
            'slotName' => $ad->slot?->name_bn,
            'slotKey' => $ad->slot?->key,
            'pricingModel' => $ad->pricing_model,
            'price' => $ad->price !== null ? (float) $ad->price : null,
            'cpmRate' => $ad->cpm_rate !== null ? (float) $ad->cpm_rate : null,
            'value' => $ad->bookingValue(),
        ];
    }

    private function mapSlot(AdSlot $s): array
    {
        $occupied = $s->occupiedCount();
        return [
            'id' => $s->id,
            'key' => $s->key,
            'name' => $s->name_bn,
            'nameEn' => $s->name_en,
            'description' => $s->description,
            'size' => $s->size,
            'dimensions' => $s->dimensions,
            'rate' => $s->rate !== null ? (float) $s->rate : null,
            'rateCpm' => $s->rate_cpm !== null ? (float) $s->rate_cpm : null,
            'capacity' => $s->capacity,
            'occupied' => $occupied,
            'available' => max(0, $s->capacity - $occupied),
            'pct' => $s->capacity > 0 ? (int) round($occupied / $s->capacity * 100) : 0,
            'isActive' => $s->is_active,
            'sortOrder' => $s->sort_order,
        ];
    }

    private function analytics($slots): array
    {
        $activeAds = Ad::active()->with(['client', 'slot'])->get();

        $activeContractValue = round($activeAds->sum(fn($a) => $a->bookingValue()), 2);

        $bookedThisMonth = round(
            Ad::where(function ($q) {
                $q->whereBetween('start_date', [now()->startOfMonth(), now()->endOfMonth()])
                  ->orWhere(function ($q2) {
                      $q2->whereNull('start_date')
                         ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
                  });
            })->get()->sum(fn($a) => $a->bookingValue()),
            2
        );

        $totalImpressions = (int) Ad::sum('impressions');
        $totalClicks = (int) Ad::sum('clicks');

        $totalCapacity = (int) $slots->sum('capacity');
        $totalOccupied = $slots->sum(fn($s) => $s->occupiedCount());

        $revenueBySlot = $activeAds->groupBy('slot_id')->map(function ($group) {
            return [
                'name' => $group->first()->slot?->name_bn ?? '—',
                'value' => round($group->sum(fn($a) => $a->bookingValue()), 2),
            ];
        })->sortByDesc('value')->values();

        $revenueByClient = $activeAds->whereNotNull('client_id')->groupBy('client_id')->map(function ($group) {
            return [
                'name' => $group->first()->client?->name ?? '—',
                'value' => round($group->sum(fn($a) => $a->bookingValue()), 2),
            ];
        })->sortByDesc('value')->take(6)->values();

        $topAds = Ad::orderByDesc('clicks')->limit(5)->get()->map(fn($a) => [
            'title' => $a->title_bn,
            'impressions' => $a->impressions,
            'clicks' => $a->clicks,
            'ctr' => $a->impressions > 0 ? round(($a->clicks / $a->impressions) * 100, 2) : 0,
        ]);

        $expiringSoon = Ad::active()
            ->whereNotNull('end_date')
            ->whereBetween('end_date', [now(), now()->addDays(7)])
            ->orderBy('end_date')
            ->with('client')
            ->get()
            ->map(fn($a) => [
                'title' => $a->title_bn,
                'client' => $a->client?->name,
                'endDate' => $a->end_date->format('Y-m-d'),
                'daysLeft' => (int) ceil(now()->diffInDays($a->end_date, false)),
            ]);

        return [
            'activeContractValue' => $activeContractValue,
            'bookedThisMonth' => $bookedThisMonth,
            'totalImpressions' => $totalImpressions,
            'totalClicks' => $totalClicks,
            'avgCtr' => $totalImpressions > 0 ? round($totalClicks / $totalImpressions * 100, 2) : 0,
            'activeCampaigns' => $activeAds->count(),
            'clientsCount' => AdClient::count(),
            'totalCapacity' => $totalCapacity,
            'totalOccupied' => $totalOccupied,
            'overallOccupancy' => $totalCapacity > 0 ? (int) round($totalOccupied / $totalCapacity * 100) : 0,
            'revenueBySlot' => $revenueBySlot,
            'revenueByClient' => $revenueByClient,
            'topAds' => $topAds,
            'expiringSoon' => $expiringSoon,
        ];
    }
}
