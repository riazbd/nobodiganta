<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminRole
{
    /**
     * Fallback levels for the built-in roles, used only to resolve the required
     * floor (the $minRole argument) without a DB hit. The USER's own rank is
     * always read from their assigned role record so that custom roles created
     * in the Roles UI (which carry their own `level`) are respected too.
     */
    private const BUILTIN_LEVELS = [
        'supreme_admin'   => 8,
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
     * Usage in routes: ->middleware('admin.role:reporter')
     *
     * @param string $minRole  Minimum role required (default: reporter)
     */
    public function handle(Request $request, Closure $next, string $minRole = 'reporter'): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Rank the user by their assigned role record's level. This covers the
        // eight built-in roles AND any custom role created in the Roles UI
        // (e.g. executive_editor), since those all carry a `level`. An account
        // with no role record (a role-less registration, or the legacy public
        // 'user') ranks 0 and is kept out of the CMS.
        $role = $user->roleRelation;
        $userLevel = $role?->level
            ?? self::BUILTIN_LEVELS[$user->role]
            ?? 0;

        $requiredLevel = self::BUILTIN_LEVELS[$minRole] ?? 1;

        if ($userLevel < $requiredLevel) {
            abort(403, 'Insufficient permissions.');
        }

        return $next($request);
    }
}
