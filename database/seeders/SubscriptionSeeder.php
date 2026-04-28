<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'user')->get();
        
        if ($users->isEmpty()) {
            return;
        }

        $plans = [
            'digital' => [
                'price' => 100.00,
                'duration' => 30, // days
            ],
            'premium' => [
                'price' => 200.00,
                'duration' => 30,
            ],
            'annual_digital' => [
                'price' => 1000.00,
                'duration' => 365,
            ],
            'annual_premium' => [
                'price' => 2000.00,
                'duration' => 365,
            ],
        ];

        $paymentMethods = ['bkash', 'nagad', 'sslcommerz', 'card'];

        foreach ($users as $user) {
            // Give 70% of users a subscription
            if (rand(1, 10) > 3) {
                $planKey = array_rand($plans);
                $planData = $plans[$planKey];
                
                $isActive = (bool)rand(0, 10) > 1; // 90% active
                $startDate = now()->subDays(rand(0, 60));
                $endDate = (clone $startDate)->addDays($planData['duration']);
                
                Subscription::create([
                    'user_id' => $user->id,
                    'plan' => $planKey,
                    'price_bdt' => $planData['price'],
                    'starts_at' => $startDate,
                    'ends_at' => $endDate,
                    'is_active' => $isActive,
                    'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                    'payment_reference' => 'TRX' . strtoupper(bin2hex(random_bytes(4))),
                    'cancelled_at' => $isActive ? null : now()->subDays(rand(1, 5)),
                ]);
            }
        }
    }
}
