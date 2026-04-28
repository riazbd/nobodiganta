<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Payment gateway service supporting bKash, Nagad, and SSLCommerz.
 * 
 * NOTE: This is a scaffold for production integration.
 * Replace placeholder credentials and endpoints with real API credentials.
 */
class PaymentGateway
{
    /**
     * Process payment through selected gateway
     *
     * @param string $gateway bKash, nagad, sslcommerz
     * @param float $amount Amount in BDT
     * @param string $reference Order/subscription reference
     * @param array $customer Customer details
     * @return array Payment result
     */
    public static function process(string $gateway, float $amount, string $reference, array $customer): array
    {
        return match ($gateway) {
            'bkash' => self::processBkash($amount, $reference, $customer),
            'nagad' => self::processNagad($amount, $reference, $customer),
            'sslcommerz' => self::processSslcommerz($amount, $reference, $customer),
            default => throw new \InvalidArgumentException("Unsupported gateway: {$gateway}"),
        };
    }

    /**
     * bKash Payment (Checkout API)
     * 
     * @see https://developer.bkash.com/
     */
    protected static function processBkash(float $amount, string $reference, array $customer): array
    {
        // TODO: Replace with real bKash API credentials
        $baseUrl = config('services.bkash.base_url', 'https://tokenized.pay.bka.sh/v1.2.0-beta');
        $appKey = config('services.bkash.app_key');
        $appSecret = config('services.bkash.app_secret');
        $username = config('services.bkash.username');
        $password = config('services.bkash.password');

        // Step 1: Get auth token
        // $tokenResponse = Http::withHeaders([
        //     'username' => $username,
        //     'password' => $password,
        // ])->post("{$baseUrl}/tokenized/checkout/token");
        
        // $token = $tokenResponse->json('id_token');

        // Step 2: Create payment
        // $paymentResponse = Http::withToken($token)->post("{$baseUrl}/tokenized/checkout/create", [
        //     'mode' => '0011',
        //     'payerReference' => $customer['phone'] ?? '',
        //     'callbackURL' => route('payment.callback', ['gateway' => 'bkash']),
        //     'amount' => $amount,
        //     'currency' => 'BDT',
        //     'intent' => 'sale',
        //     'merchantInvoiceNumber' => $reference,
        // ]);

        // For now, return mock success response
        return [
            'success' => true,
            'gateway' => 'bkash',
            'transaction_id' => 'BKASH' . time() . rand(1000, 9999),
            'amount' => $amount,
            'currency' => 'BDT',
            'status' => 'completed',
            'reference' => $reference,
            'raw_response' => null,
        ];
    }

    /**
     * Nagad Payment
     * 
     * @see https://www.nagad.com.bd/
     */
    protected static function processNagad(float $amount, string $reference, array $customer): array
    {
        // TODO: Replace with real Nagad API credentials
        $baseUrl = config('services.nagad.base_url', 'https://sandbox.mynagad.com');
        $merchantId = config('services.nagad.merchant_id');
        $callbackUrl = route('payment.callback', ['gateway' => 'nagad']);

        // Step 1: Create payment request
        // $response = Http::post("{$baseUrl}/merchant-api/checkout", [
        //     'merchantId' => $merchantId,
        //     'amount' => $amount,
        //     'orderId' => $reference,
        //     'callbackUrl' => $callbackUrl,
        //     'customerMobile' => $customer['phone'] ?? '',
        // ]);

        // For now, return mock success response
        return [
            'success' => true,
            'gateway' => 'nagad',
            'transaction_id' => 'NAGAD' . time() . rand(1000, 9999),
            'amount' => $amount,
            'currency' => 'BDT',
            'status' => 'completed',
            'reference' => $reference,
            'raw_response' => null,
        ];
    }

    /**
     * SSLCommerz Payment
     * 
     * @see https://developer.sslcommerz.com/
     */
    protected static function processSslcommerz(float $amount, string $reference, array $customer): array
    {
        // TODO: Replace with real SSLCommerz credentials
        $storeId = config('services.sslcommerz.store_id');
        $storePassword = config('services.sslcommerz.store_password');
        $isSandbox = config('app.env') === 'local';
        $baseUrl = $isSandbox 
            ? 'https://sandbox.sslcommerz.com' 
            : 'https://securepay.sslcommerz.com';

        // Step 1: Initiate session
        // $response = Http::asForm()->post("{$baseUrl}/gwprocess/v4/api.php", [
        //     'store_id' => $storeId,
        //     'store_passwd' => $storePassword,
        //     'total_amount' => $amount,
        //     'currency' => 'BDT',
        //     'tran_id' => $reference,
        //     'success_url' => route('payment.success', ['gateway' => 'sslcommerz']),
        //     'fail_url' => route('payment.fail', ['gateway' => 'sslcommerz']),
        //     'cancel_url' => route('payment.cancel', ['gateway' => 'sslcommerz']),
        //     'cus_name' => $customer['name'] ?? '',
        //     'cus_email' => $customer['email'] ?? '',
        //     'cus_phone' => $customer['phone'] ?? '',
        //     'cus_add1' => $customer['address'] ?? '',
        //     'shipping_method' => 'NO',
        //     'product_name' => 'Subscription',
        //     'product_category' => 'Service',
        // ]);

        // For now, return mock success response
        return [
            'success' => true,
            'gateway' => 'sslcommerz',
            'transaction_id' => 'SSLC' . time() . rand(1000, 9999),
            'amount' => $amount,
            'currency' => 'BDT',
            'status' => 'completed',
            'reference' => $reference,
            'raw_response' => null,
        ];
    }

    /**
     * Verify payment transaction
     */
    public static function verify(string $gateway, string $transactionId): array
    {
        return match ($gateway) {
            'bkash' => self::verifyBkash($transactionId),
            'nagad' => self::verifyNagad($transactionId),
            'sslcommerz' => self::verifySslcommerz($transactionId),
            default => ['success' => false, 'message' => 'Unsupported gateway'],
        };
    }

    protected static function verifyBkash(string $transactionId): array
    {
        // TODO: Implement bKash payment verification API
        return ['success' => true, 'status' => 'completed'];
    }

    protected static function verifyNagad(string $transactionId): array
    {
        // TODO: Implement Nagad payment verification API
        return ['success' => true, 'status' => 'completed'];
    }

    protected static function verifySslcommerz(string $transactionId): array
    {
        // TODO: Implement SSLCommerz validation API
        return ['success' => true, 'status' => 'completed'];
    }
}
