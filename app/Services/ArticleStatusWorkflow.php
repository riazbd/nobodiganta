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
        'draft' => ['pending', 'published'],
        'pending' => ['draft', 'published', 'archived'],
        'published' => ['archived', 'draft'],
        'archived' => ['published', 'draft'],
    ];

    /**
     * Permission(s) required to move an article INTO each status. A user needs
     * ANY one of the listed permissions. This is the single source of truth for
     * status-change authorization and is driven by the real permission system
     * (role_id -> role -> permissions), NOT the user's role string — so custom
     * roles work the same as built-in ones, consistent with the edit page
     * (ArticleController::authorizeStatus) and the bulk actions.
     */
    const STATUS_PERMISSIONS = [
        'draft'     => ['news.publish', 'news.edit', 'news.edit.own'], // unpublish / send back
        'pending'   => ['news.submit', 'news.edit', 'news.edit.own'],  // submit for review
        'published' => ['news.publish', 'news.approve'],               // approve / publish
        'archived'  => ['news.archive'],
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

        // Check if transition is valid (state-machine rule)
        if (!self::isValidTransition($article->status, $newStatus)) {
            return false;
        }

        // Authorize via permissions — hasPermission() already grants everything
        // to the supreme admin and to roles synced with the full permission set.
        foreach (self::STATUS_PERMISSIONS[$newStatus] ?? [] as $permission) {
            if ($user->hasPermission($permission)) {
                return true;
            }
        }

        return false;
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

        // Every valid transition the user is actually permitted to make.
        return array_values(array_filter(
            self::TRANSITIONS[$article->status] ?? [],
            fn (string $status) => self::canTransition($article, $status, $user)
        ));
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

        // Approver = whoever approves/publishes (the logged-in user); keep the
        // original once set, and clear it when sent back to draft.
        if ($newStatus === 'published') {
            $updateData['approver_id'] = $article->approver_id ?? $user->id;
        } elseif ($newStatus === 'draft') {
            $updateData['approver_id'] = null;
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
                'published' => 'প্রকাশিত',
                'archived' => 'সংরক্ষিত',
            ],
            'en' => [
                'draft' => 'Draft',
                'pending' => 'Pending Approval',
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
            'published' => '#10b981', // Green
            'archived' => '#8b5cf6', // Purple
        ];

        return $colors[$status] ?? '#6b7280';
    }
}
