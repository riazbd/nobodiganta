<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/api/ads?position=home_top', 'GET');
$response = $kernel->handle($request);
echo $response->getContent();
