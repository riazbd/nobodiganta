<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Setting::get('maintenance_mode', false)) {
            // Allow access to admin and authorized users
            if ($request->is('admin*') || ($request->user() && $request->user()->hasPermission('system.settings'))) {
                return $next($request);
            }

            // Otherwise, show maintenance page or abort
            return response('The site is under maintenance. Please check back later.', 503);
        }

        return $next($request);
    }
}
