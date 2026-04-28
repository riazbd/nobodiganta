<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$edition = 'bn';
$data = App\Models\Ad::active()->get()->groupBy('position')->map(function($group) use ($edition) {
    return $group->map(fn($ad) => [
        'id' => $ad->id,
        'title' => $ad->getTitle($edition),
    ]);
});
echo $data->toJson();
