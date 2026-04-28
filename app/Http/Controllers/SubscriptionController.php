<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Services\ArticleMeter;
use App\Services\PaymentGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    /**
     * Plan pricing
     */
    const PRICING = [
        'digital' => ['monthly' => 99, 'annual' => 999],
        'premium' => ['monthly' => 149, 'annual' => 1499],
    ];

    /**
     * Process subscription purchase
     */
    public function process(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return back()->withErrors(['auth' => 'Please login to subscribe']);
        }

        $validated = $request->validate([
            'plan' => 'required|in:digital,premium',
            'payment_method' => 'required|in:bkash,nagad,sslcommerz',
            'is_annual' => 'boolean',
        ]);

        // Calculate price
        $plan = $validated['plan'];
        $isAnnual = $validated['is_annual'] ?? false;
        $price = $isAnnual 
            ? self::PRICING[$plan]['annual'] 
            : self::PRICING[$plan]['monthly'];

        // Process payment through selected gateway
        $customer = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? '',
        ];

        $reference = 'SUB' . time() . rand(1000, 9999);

        try {
            $paymentResult = PaymentGateway::process(
                $validated['payment_method'],
                $price,
                $reference,
                $customer
            );

            if (!$paymentResult['success']) {
                return back()->withErrors(['payment' => 'Payment failed. Please try again.']);
            }

            $paymentReference = $paymentResult['transaction_id'];
        } catch (\Exception $e) {
            Log::error('Payment failed: ' . $e->getMessage());
            return back()->withErrors(['payment' => 'Payment processing error. Please try again.']);
        }

        // Calculate subscription period
        $startsAt = now();
        $endsAt = $isAnnual ? now()->addYear() : now()->addMonth();

        // Cancel existing subscription if any
        $existingSub = $user->activeSubscription();
        if ($existingSub) {
            $existingSub->update([
                'is_active' => false,
                'cancelled_at' => now(),
            ]);
        }

        // Create new subscription
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan' => $plan,
            'price_bdt' => $price,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'is_active' => true,
            'payment_method' => $validated['payment_method'],
            'payment_reference' => $paymentReference,
        ]);

        // Reset article meter
        ArticleMeter::reset();

        return redirect()->route('subscribe')
            ->with('success', 'Subscription activated successfully!');
    }

    /**
     * Cancel subscription
     */
    public function cancel()
    {
        $user = Auth::user();
        $subscription = $user->activeSubscription();

        if (!$subscription) {
            return back()->withErrors(['subscription' => 'No active subscription found']);
        }

        $subscription->update([
            'is_active' => false,
            'cancelled_at' => now(),
        ]);

        return back()->with('success', 'Subscription cancelled. Access continues until end of billing period.');
    }

    /**
     * Reactivate cancelled subscription
     */
    public function reactivate()
    {
        $user = Auth::user();
        $subscription = $user->subscriptions()
            ->where('is_active', false)
            ->where('cancelled_at', '>', now()->subDays(30))
            ->latest()
            ->first();

        if (!$subscription) {
            return back()->withErrors(['subscription' => 'No recent cancelled subscription found']);
        }

        $subscription->update([
            'is_active' => true,
            'cancelled_at' => null,
        ]);

        return back()->with('success', 'Subscription reactivated!');
    }

    /**
     * Payment callback from gateway
     */
    public function paymentCallback(Request $request, string $gateway)
    {
        // Verify payment with gateway
        $transactionId = $request->input('transaction_id');
        $verification = PaymentGateway::verify($gateway, $transactionId);

        if ($verification['success']) {
            return redirect()->route('payment.success', ['gateway' => $gateway])
                ->with('transaction_id', $transactionId);
        }

        return redirect()->route('payment.fail', ['gateway' => $gateway]);
    }

    /**
     * Payment success page
     */
    public function paymentSuccess(string $gateway)
    {
        return Inertia::render('PaymentSuccess', [
            'gateway' => $gateway,
            'transaction_id' => session('transaction_id'),
        ]);
    }

    /**
     * Payment fail page
     */
    public function paymentFail(string $gateway)
    {
        return Inertia::render('PaymentFail', [
            'gateway' => $gateway,
        ]);
    }

    /**
     * Payment cancel page
     */
    public function paymentCancel(string $gateway)
    {
        return Inertia::render('PaymentCancel', [
            'gateway' => $gateway,
        ]);
    }
}
