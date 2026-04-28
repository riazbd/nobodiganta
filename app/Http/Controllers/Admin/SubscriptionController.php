<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of subscriptions
     */
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('business.subscriptions.view')) {
            abort(403);
        }

        $query = Subscription::with('user');

        if ($request->search) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            })->orWhere('payment_reference', 'like', "%{$request->search}%");
        }

        if ($request->plan && $request->plan !== 'all') {
            $query->where('plan', $request->plan);
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }

        $subscriptions = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('features/admin/pages/Subscriptions', [
            'subscriptions' => $subscriptions,
            'filters' => $request->only(['search', 'plan', 'status']),
            'users' => User::where('role', 'user')->orderBy('name')->get(['id', 'name', 'email']),
            'stats' => [
                'total_active' => Subscription::active()->notExpired()->count(),
                'total_revenue' => Subscription::active()->sum('price_bdt'),
                'premium_count' => Subscription::premium()->active()->count(),
            ]
        ]);
    }

    /**
     * Store a newly created subscription
     */
    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('business.subscriptions.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan' => 'required|in:free,digital,premium,annual_digital,annual_premium',
            'price_bdt' => 'required|numeric|min:0',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'payment_method' => 'nullable|string',
            'payment_reference' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Subscription::create($validated);

        return back()->with('success', 'Subscription created successfully');
    }

    /**
     * Update the specified subscription
     */
    public function update(Request $request, Subscription $subscription)
    {
        if (!auth()->user()->hasPermission('business.subscriptions.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'plan' => 'required|in:free,digital,premium,annual_digital,annual_premium',
            'price_bdt' => 'required|numeric|min:0',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'payment_method' => 'nullable|string',
            'payment_reference' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $subscription->update($validated);

        return back()->with('success', 'Subscription updated successfully');
    }

    /**
     * Remove the specified subscription
     */
    public function destroy(Subscription $subscription)
    {
        if (!auth()->user()->hasPermission('business.subscriptions.manage')) {
            abort(403);
        }

        $subscription->delete();

        return back()->with('success', 'Subscription deleted successfully');
    }

    /**
     * Toggle active status
     */
    public function toggleStatus(Subscription $subscription)
    {
        if (!auth()->user()->hasPermission('business.subscriptions.manage')) {
            abort(403);
        }

        $subscription->update(['is_active' => !$subscription->is_active]);

        return back()->with('success', 'Subscription status updated');
    }
}
