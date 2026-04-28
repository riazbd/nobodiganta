<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Google AdSense
    |--------------------------------------------------------------------------
    */
    'adsense' => [
        'client_id' => env('GOOGLE_ADSENSE_CLIENT_ID'), // ca-pub-XXXXXXXXXXXXXXXX
    ],

    /*
    |--------------------------------------------------------------------------
    | bKash Payment Gateway
    |--------------------------------------------------------------------------
    */
    'bkash' => [
        'base_url' => env('BKASH_BASE_URL', 'https://tokenized.pay.bka.sh/v1.2.0-beta'),
        'app_key' => env('BKASH_APP_KEY'),
        'app_secret' => env('BKASH_APP_SECRET'),
        'username' => env('BKASH_USERNAME'),
        'password' => env('BKASH_PASSWORD'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Nagad Payment Gateway
    |--------------------------------------------------------------------------
    */
    'nagad' => [
        'base_url' => env('NAGAD_BASE_URL', 'https://sandbox.mynagad.com'),
        'merchant_id' => env('NAGAD_MERCHANT_ID'),
        'merchant_number' => env('NAGAD_MERCHANT_NUMBER'),
        'callback_url' => env('NAGAD_CALLBACK_URL'),
    ],

    /*
    |--------------------------------------------------------------------------
    | SSLCommerz Payment Gateway
    |--------------------------------------------------------------------------
    */
    'sslcommerz' => [
        'store_id' => env('SSLCOMMERZ_STORE_ID'),
        'store_password' => env('SSLCOMMERZ_STORE_PASSWORD'),
    ],

    /*
    |--------------------------------------------------------------------------
    | WebPush (Push Notifications)
    |--------------------------------------------------------------------------
    */
    'webpush' => [
        'vapid_subject' => env('WEBPACK_VAPID_SUBJECT', 'mailto:admin@provati.com'),
        'vapid_public_key' => env('WEBPACK_VAPID_PUBLIC_KEY'),
        'vapid_private_key' => env('WEBPACK_VAPID_PRIVATE_KEY'),
    ],

];
