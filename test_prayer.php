<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/api/prayer-times', 'GET');
$kernelHttp = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernelHttp->handle($request);
echo $response->getContent();
