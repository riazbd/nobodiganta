<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminRole
{
    /**
     * Role hierarchy: each role has access to all roles below it.
     */
    private const HIERARCHY = [
        'super_admin'     => 7,
        'editor_in_chief' => 6,
        'managing_editor' => 5,
        'section_editor'  => 4,
        'seo_manager'     => 3,
        'photographer'    => 2,
        'reporter'        => 1,
    ];

    /**
     * Handle an incoming request.
     * Usage in routes: ->middleware('admin.role:editor')
     *
     * @param string $minRole  Minimum role required (default: reporter)
     */
    public function handle(Request $request, Closure $next, string $minRole = 'reporter'): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $userLevel = self::HIERARCHY[$user->role ?? 'reporter'] ?? 0;
        $requiredLevel = self::HIERARCHY[$minRole] ?? 1;

        if ($userLevel < $requiredLevel) {
            abort(403, 'Insufficient permissions.');
        }

        return $next($request);
    }
}
