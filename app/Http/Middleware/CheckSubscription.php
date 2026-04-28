<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $plan = 'premium'): Response
    {
        // If user is not authenticated, redirect to login/subscribe
        if (!Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subscription required',
                    'paywall' => true,
                    'redirect' => route('subscribe'),
                ], 403);
            }

            // For Inertia requests, pass paywall flag to frontend
            $request->merge(['paywall_required' => true]);
            return $next($request);
        }

        $user = Auth::user();
        $subscription = $user->activeSubscription();

        // Check if user has required plan level
        $hasAccess = false;

        if ($plan === 'premium') {
            $hasAccess = $subscription && $subscription->isPremium();
        } elseif ($plan === 'digital') {
            $hasAccess = $subscription && $subscription->hasDigitalAccess();
        } elseif ($plan === 'any') {
            $hasAccess = $subscription && $subscription->plan !== 'free';
        }

        if (!$hasAccess) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Upgrade your subscription to access this content',
                    'paywall' => true,
                    'current_plan' => $subscription?->plan ?? 'free',
                    'required_plan' => $plan,
                ], 403);
            }

            // For Inertia requests, pass paywall flag
            $request->merge([
                'paywall_required' => true,
                'current_plan' => $subscription?->plan ?? 'free',
                'required_plan' => $plan,
            ]);
        }

        return $next($request);
    }
}
