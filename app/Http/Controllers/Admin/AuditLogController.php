<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    /**
     * Display a listing of the audit logs.
     */
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('system.audit.view')) {
            abort(403);
        }

        $query = AuditLog::with('user');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('description', 'like', "%{$request->search}%")
                  ->orWhere('event', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function($uq) use ($request) {
                      $uq->where('name', 'like', "%{$request->search}%")
                        ->orWhere('email', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->event && $request->event !== 'all') {
            $query->where('event', $request->event);
        }

        if ($request->user_id && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        $logs = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('features/admin/pages/system/AuditLog', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'event', 'user_id']),
            'users' => User::whereIn('role', ['super_admin', 'editor_in_chief', 'managing_editor', 'reporter'])
                        ->orderBy('name')
                        ->get(['id', 'name']),
            'events' => AuditLog::select('event')->distinct()->pluck('event'),
        ]);
    }

    /**
     * Clear old logs (e.g., older than 30 days).
     */
    public function clear(Request $request)
    {
        if (!auth()->user()->hasPermission('system.settings')) {
            abort(403);
        }

        $days = (int) $request->input('days', 30);
        
        if ($days === 0) {
            AuditLog::truncate();
            return back()->with('success', "All audit logs cleared.");
        }

        AuditLog::where('created_at', '<', now()->subDays($days))->delete();

        return back()->with('success', "Logs older than {$days} days cleared.");
    }
}
