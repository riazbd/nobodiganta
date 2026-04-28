<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PushController extends Controller
{
    /**
     * Get VAPID public key for client subscription
     */
    public function getVapidPublicKey()
    {
        return response()->json([
            'publicKey' => config('services.webpush.vapid_public_key'),
        ]);
    }

    /**
     * Store push notification subscription
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'subscription' => 'required|array',
            'subscription.endpoint' => 'required|string',
            'subscription.keys.p256dh' => 'required|string',
            'subscription.keys.auth' => 'required|string',
        ]);

        $subscription = $validated['subscription'];

        // Upsert subscription (update if exists, create if new)
        PushSubscription::updateOrCreate(
            [
                'endpoint' => $subscription['endpoint'],
                'public_key' => $subscription['keys']['p256dh'],
            ],
            [
                'user_id' => Auth::id(),
                'auth_token' => $subscription['keys']['auth'],
                'user_agent' => $request->userAgent(),
                'is_active' => true,
                'last_used_at' => now(),
            ]
        );

        return response()->json(['success' => true]);
    }

    /**
     * Unsubscribe from push notifications
     */
    public function unsubscribe(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|string',
        ]);

        PushSubscription::where('endpoint', $validated['endpoint'])
            ->update(['is_active' => false]);

        return response()->json(['success' => true]);
    }

    /**
     * Send push notification for breaking news
     */
    public function sendBreakingNews(Request $request, Article $article)
    {
        $validated = $request->validate([
            'title_bn' => 'required|string',
            'title_en' => 'nullable|string',
            'body_bn' => 'nullable|string',
            'body_en' => 'nullable|string',
            'url' => 'required|string',
        ]);

        // Get all active subscriptions
        $subscriptions = PushSubscription::active()->get();

        if ($subscriptions->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscriptions',
            ]);
        }

        // Initialize WebPush
        $webPush = new WebPush([
            'VAPID' => [
                'subject' => config('services.webpush.vapid_subject'),
                'publicKey' => config('services.webpush.vapid_public_key'),
                'privateKey' => config('services.webpush.vapid_private_key'),
            ],
        ]);

        $sent = 0;
        $failed = 0;

        foreach ($subscriptions as $sub) {
            // Determine language for notification
            $isEnglish = $sub->user_agent && stripos($sub->user_agent, 'en') !== false;
            
            $title = $isEnglish && $validated['title_en'] 
                ? $validated['title_en'] 
                : $validated['title_bn'];
            
            $body = $isEnglish && $validated['body_en'] 
                ? $validated['body_en'] 
                : ($validated['body_bn'] ?? '');

            // Create subscription object
            $pushSubscription = Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->public_key,
                'authToken' => $sub->auth_token,
            ]);

            // Queue notification
            $webPush->queueNotification(
                $pushSubscription,
                json_encode([
                    'title' => '🔴 ' . $title,
                    'body' => $body,
                    'icon' => '/icons/icon-192.png',
                    'url' => $validated['url'],
                    'tag' => 'breaking-' . $article->id,
                    'requireInteraction' => true,
                ])
            );

            $sub->markAsUsed();
        }

        // Send all queued notifications
        foreach ($webPush->flush() as $report) {
            $endpoint = $report->getEndpoint();
            
            if ($report->isSuccess()) {
                $sent++;
            } else {
                $failed++;
                
                // Deactivate invalid subscriptions
                if ($report->isSubscriptionExpired()) {
                    PushSubscription::where('endpoint', $endpoint)
                        ->update(['is_active' => false]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'sent' => $sent,
            'failed' => $failed,
            'total' => $subscriptions->count(),
        ]);
    }

    /**
     * Get subscription stats (for admin)
     */
    public function stats()
    {
        return response()->json([
            'total_subscriptions' => PushSubscription::count(),
            'active_subscriptions' => PushSubscription::active()->count(),
            'subscriptions_by_day' => PushSubscription::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->limit(30)
                ->get(),
        ]);
    }
}
