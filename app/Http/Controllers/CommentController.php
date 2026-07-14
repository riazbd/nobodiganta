<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Article;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CommentController extends Controller
{
    /**
     * Display comment moderation queue (admin)
     */
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('comment.view')) {
            abort(403);
        }

        $status = $request->input('status', 'pending');
        $articleId = $request->input('article_id');
        $search = $request->input('search');

        $query = Comment::with(['article', 'user', 'replies'])
            ->latest();

        // Filter by status
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Filter by article
        if ($articleId) {
            $query->where('article_id', $articleId);
        }

        // Search in comment body or name
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('body', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $comments = $query->paginate(50)->through(fn($comment) => [
            'id' => $comment->id,
            'article' => [
                'id' => $comment->article->id,
                'title' => $comment->article->title_bn,
                'slug' => $comment->article->slug_bn,
            ],
            'user' => $comment->user ? [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
            ] : null,
            'name' => $comment->commenter_name,
            'email' => $comment->email,
            'body' => $comment->body,
            'status' => $comment->status,
            'is_flagged' => $comment->is_flagged,
            'flag_reason' => $comment->flag_reason,
            'upvotes' => $comment->upvotes,
            'parent_id' => $comment->parent_id,
            'replies_count' => $comment->replies()->count(),
            'created_at' => $comment->created_at->toIso8601String(),
            'moderated_at' => $comment->moderated_at?->toIso8601String(),
        ]);

        return Inertia::render('features/admin/pages/Comments', [
            'comments' => $comments,
            'filters' => $request->only(['status', 'article_id', 'search']),
        ]);
    }

    /**
     * Store a new comment (public)
     */
    public function store(Request $request, Article $article)
    {
        $validated = $request->validate([
            'name' => 'required_without:user_id|string|max:100',
            'email' => 'required_without:user_id|email|max:200',
            'body' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        // Check for banned words
        $bannedWords = $this->getBannedWords();
        $bodyLower = strtolower($validated['body']);
        
        foreach ($bannedWords as $word) {
            if (strpos($bodyLower, $word) !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Comment contains inappropriate language',
                ], 422);
            }
        }

        // Check for URLs (reduce spam)
        if (preg_match('/https?:\/\//i', $validated['body'])) {
            return response()->json([
                'success' => false,
                'message' => 'Comments cannot contain URLs',
            ], 422);
        }

        // Rate limiting: max 3 comments per hour per IP
        $recentComments = Comment::where('ip_address', $request->ip())
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($recentComments >= 3) {
            return response()->json([
                'success' => false,
                'message' => 'Rate limit exceeded. Maximum 3 comments per hour.',
            ], 429);
        }

        // Determine status
        $requiresApproval = Setting::get('comment_approval', true);
        $status = $requiresApproval ? 'pending' : 'approved';
        
        // Auto-approve if user is registered and has good history
        if ($requiresApproval && $request->user()) {
            $userApprovedCount = Comment::where('user_id', $request->user()->id)
                ->where('status', 'approved')
                ->count();
            
            if ($userApprovedCount >= 5) {
                $status = 'approved';
            }
        }

        $comment = Comment::create([
            'article_id' => $article->id,
            'user_id' => $request->user()?->id,
            'parent_id' => $validated['parent_id'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'ip_address' => $request->ip(),
            'body' => $validated['body'],
            'status' => $status,
        ]);

        return response()->json([
            'success' => true,
            'comment' => $comment->load('replies'),
            'requires_moderation' => $status === 'pending',
        ], 201);
    }

    /**
     * Approve comment
     */
    public function approve(Comment $comment)
    {
        if (!auth()->user()->hasPermission('comment.approve')) {
            abort(403);
        }

        $comment->approve(Auth::user());

        return back();
    }

    /**
     * Mark comment as spam
     */
    public function markSpam(Comment $comment)
    {
        if (!auth()->user()->hasPermission('comment.reject')) {
            abort(403);
        }

        $comment->markAsSpam(Auth::user());

        return back();
    }

    /**
     * Delete comment
     */
    public function destroy(Comment $comment)
    {
        if (!auth()->user()->hasPermission('comment.reject')) {
            abort(403);
        }

        $comment->update([
            'status' => 'deleted',
            'moderated_at' => now(),
            'moderated_by' => Auth::id(),
        ]);

        return back();
    }

    /**
     * Bulk approve
     */
    public function bulkApprove(Request $request)
    {
        if (!auth()->user()->hasPermission('comment.approve')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'comment_ids' => 'required|array',
            'comment_ids.*' => 'exists:comments,id',
        ]);

        Comment::whereIn('id', $validated['comment_ids'])
            ->update([
                'status' => 'approved',
                'moderated_at' => now(),
                'moderated_by' => Auth::id(),
                'is_flagged' => false,
                'flag_reason' => null,
            ]);

        return back()->with('success', count($validated['comment_ids']) . ' comments approved');
    }

    /**
     * Bulk delete/spam
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'comment_ids' => 'required|array',
            'comment_ids.*' => 'exists:comments,id',
            'action' => 'required|in:approve,spam,delete',
        ]);

        // Approving needs comment.approve; rejecting (spam/delete) needs comment.reject.
        $required = $validated['action'] === 'approve' ? 'comment.approve' : 'comment.reject';
        if (!auth()->user()->hasPermission($required)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $updateData = [
            'moderated_at' => now(),
            'moderated_by' => Auth::id(),
        ];

        switch ($validated['action']) {
            case 'approve':
                $updateData['status'] = 'approved';
                $updateData['is_flagged'] = false;
                break;
            case 'spam':
                $updateData['status'] = 'spam';
                break;
            case 'delete':
                $updateData['status'] = 'deleted';
                break;
        }

        Comment::whereIn('id', $validated['comment_ids'])->update($updateData);

        return back()->with('success', count($validated['comment_ids']) . ' comments updated');
    }

    /**
     * Flag comment for review (public)
     */
    public function flag(Request $request, Comment $comment)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $comment->flag($validated['reason']);

        return response()->json([
            'success' => true,
            'message' => 'Comment flagged for review',
        ]);
    }

    /**
     * Get comments for an article (public API)
     */
    public function getArticleComments(Article $article, Request $request)
    {
        $sortBy = $request->input('sort', 'newest'); // newest, oldest, popular

        $query = Comment::approved()
            ->where('article_id', $article->id)
            ->with(['user', 'replies' => function ($q) {
                $q->approved()->with('user');
            }]);

        if ($sortBy === 'popular') {
            $query->mostUpvoted();
        } else {
            $query->latest();
        }

        // Only get top-level comments (replies loaded via relationship)
        $comments = $query->parents()
            ->paginate(20)
            ->through(fn($comment) => $this->formatComment($comment));

        return response()->json($comments);
    }

    /**
     * Get banned words list
     */
    protected function getBannedWords(): array
    {
        // Store in config or database in production
        return [
            // English profanity
            'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard',
            // Bangla profanity (common)
            'শালা', 'চুদা', 'বেশ্যা', 'হারামি',
            // Spam indicators
            'buy now', 'click here', 'free money', 'viagra', 'casino',
        ];
    }

    /**
     * Format comment for API response
     */
    protected function formatComment(Comment $comment): array
    {
        return [
            'id' => $comment->id,
            'user' => $comment->user ? [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
            ] : null,
            'name' => $comment->commenter_name,
            'body' => $comment->body,
            'upvotes' => $comment->upvotes,
            'created_at' => $comment->created_at->toIso8601String(),
            'replies' => $comment->replies->map(fn($reply) => [
                'id' => $reply->id,
                'user' => $reply->user ? [
                    'id' => $reply->user->id,
                    'name' => $reply->user->name,
                ] : null,
                'name' => $reply->commenter_name,
                'body' => $reply->body,
                'upvotes' => $reply->upvotes,
                'created_at' => $reply->created_at->toIso8601String(),
            ]),
        ];
    }
}
