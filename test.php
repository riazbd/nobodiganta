<?php

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\ReporterController;

$data = [
    'nameBn' => 'Test Reporter',
    'nameEn' => 'Test Reporter',
    'email' => 'reporter77@test.com',
    'createLogin' => true,
    'password' => 'password123',
    'password_confirmation' => 'password123'
];

$req = Request::create('/admin/reporters', 'POST', $data);
$req->setUserResolver(function() { 
    return User::where('role', 'supreme_admin')->first(); 
});

$controller = new ReporterController();
$response = $controller->store($req);

echo 'Response status: ' . $response->getStatusCode() . "\n";
if ($response->getStatusCode() == 302) {
    echo "Errors: \n";
    print_r(session()->get('errors')?->getMessages());
}
