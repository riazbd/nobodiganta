<?php

namespace App\Services;

use App\Models\Article;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ArticleStatusWorkflow
{
    /**
     * Valid status transitions
     */
    const TRANSITIONS = [
        'draft' => ['pending', 'scheduled', 'published'],
        'pending' => ['draft', 'published', 'archived'],
        'scheduled' => ['draft', 'published', 'archived'],
        'published' => ['archived', 'draft'],
        'archived' => ['published', 'draft'],
    ];

    /**
     * Role permissions for status transitions
     * Format: role => allowed transitions
     */
    const ROLE_PERMISSIONS = [
        'reporter' => [
            'draft' => ['pending'], // Can only submit for review
            'pending' => [], // Cannot change once submitted
            'scheduled' => [],
            'published' => [],
            'archived' => [],
        ],
        'editor_in_chief' => [
            'draft' => ['pending', 'published', 'scheduled'],
            'pending' => ['published', 'draft'],
            'scheduled' => ['published', 'draft'],
            'published' => ['archived', 'draft'],
            'archived' => ['published'],
        ],
        'managing_editor' => [
            'draft' => ['pending', 'published', 'scheduled'],
            'pending' => ['published', 'draft'],
            'scheduled' => ['published', 'draft'],
            'published' => ['archived', 'draft'],
            'archived' => ['published'],
        ],
        'section_editor' => [
            'draft' => ['pending', 'published', 'scheduled'],
            'pending' => ['published', 'draft'],
            'scheduled' => ['published', 'draft'],
            'published' => ['archived'],
            'archived' => ['published'],
        ],
        'photographer' => [
            'draft' => ['pending'],
            'pending' => [],
            'scheduled' => [],
            'published' => [],
            'archived' => [],
        ],
        'super_admin' => null, // null = all transitions allowed
    ];

    /**
     * Check if user can transition article to new status
     */
    public static function canTransition(Article $article, string $newStatus, ?User $user = null): bool
    {
        $user = $user ?? Auth::user();
        if (!$user) {
            return false;
        }

        $currentStatus = $article->status;
        $role = $user->role ?? 'reporter';

        // Check if transition is valid
        if (!self::isValidTransition($currentStatus, $newStatus)) {
            return false;
        }

        // Super admin can do anything
        if ($role === 'super_admin') {
            return true;
        }

        // Check role permissions
        $allowedTransitions = self::ROLE_PERMISSIONS[$role][$currentStatus] ?? [];
        return in_array($newStatus, $allowedTransitions);
    }

    /**
     * Check if transition is valid (regardless of role)
     */
    public static function isValidTransition(string $fromStatus, string $toStatus): bool
    {
        return in_array($toStatus, self::TRANSITIONS[$fromStatus] ?? []);
    }

    /**
     * Get allowed transitions for a user and article
     */
    public static function getAllowedTransitions(Article $article, ?User $user = null): array
    {
        $user = $user ?? Auth::user();
        if (!$user) {
            return [];
        }

        $currentStatus = $article->status;
        $role = $user->role ?? 'reporter';

        // Super admin gets all transitions
        if ($role === 'super_admin') {
            return self::TRANSITIONS[$currentStatus] ?? [];
        }

        // Get role-specific transitions
        return self::ROLE_PERMISSIONS[$role][$currentStatus] ?? [];
    }

    /**
     * Transition article status
     */
    public static function transition(Article $article, string $newStatus, ?User $user = null): array
    {
        $user = $user ?? Auth::user();
        if (!$user) {
            return ['success' => false, 'message' => 'User not authenticated'];
        }

        // Check permissions
        if (!self::canTransition($article, $newStatus, $user)) {
            return ['success' => false, 'message' => 'Permission denied or invalid transition'];
        }

        // Prepare update data
        $updateData = ['status' => $newStatus];

        // Handle published_at
        if ($newStatus === 'published' && !$article->published_at) {
            $updateData['published_at'] = now();
        } elseif ($newStatus === 'draft' || $newStatus === 'pending') {
            // Don't clear published_at if re-publishing later
            if ($article->published_at && $newStatus === 'draft') {
                $updateData['published_at'] = null;
            }
        }

        // Handle scheduled_at
        if ($newStatus !== 'scheduled') {
            $updateData['scheduled_at'] = null;
        }

        // Update article
        $article->update($updateData);

        return [
            'success' => true,
            'message' => "Article status changed to {$newStatus}",
            'old_status' => $article->getOriginal('status'),
            'new_status' => $newStatus,
        ];
    }

    /**
     * Get human-readable status label
     */
    public static function getStatusLabel(string $status, string $lang = 'bn'): string
    {
        $labels = [
            'bn' => [
                'draft' => 'ড্রাফট',
                'pending' => 'অনুমোদন অপেক্ষায়',
                'scheduled' => 'নির্ধারিত',
                'published' => 'প্রকাশিত',
                'archived' => 'সংরক্ষিত',
            ],
            'en' => [
                'draft' => 'Draft',
                'pending' => 'Pending Approval',
                'scheduled' => 'Scheduled',
                'published' => 'Published',
                'archived' => 'Archived',
            ],
        ];

        return $labels[$lang][$status] ?? $status;
    }

    /**
     * Get status color for UI
     */
    public static function getStatusColor(string $status): string
    {
        $colors = [
            'draft' => '#6b7280', // Gray
            'pending' => '#f59e0b', // Yellow/Orange
            'scheduled' => '#3b82f6', // Blue
            'published' => '#10b981', // Green
            'archived' => '#8b5cf6', // Purple
        ];

        return $colors[$status] ?? '#6b7280';
    }
}
