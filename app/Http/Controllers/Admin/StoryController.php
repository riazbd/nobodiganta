<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Story;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoryController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('stories.view_any')) abort(403);

        $query = Story::with(['coverMedia', 'creator'])
            ->withCount('slides');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title_bn', 'like', '%' . $request->search . '%')
                  ->orWhere('title_en', 'like', '%' . $request->search . '%');
            });
        }

        $stories = $query->latest()->paginate(20)->through(fn($s) => [
            'id' => $s->id,
            'title_bn' => $s->title_bn,
            'title_en' => $s->title_en,
            'slug' => $s->slug,
            'status' => $s->status,
            'edition' => $s->edition,
            'slides_count' => $s->slides_count,
            'expires_at' => $s->expires_at?->toIso8601String(),
            'published_at' => $s->published_at?->toIso8601String(),
            'cover_thumbnail' => $s->coverMedia?->getThumbnailUrl(),
            'creator_name' => $s->creator?->name,
        ]);

        return Inertia::render('features/admin/pages/stories/Index', [
            'stories' => $stories,
            'filters' => $request->only(['status', 'search']),
            'can' => [
                'create' => auth()->user()->hasPermission('stories.create'),
                'publish' => auth()->user()->hasPermission('stories.publish'),
                'restore' => auth()->user()->hasPermission('stories.restore_expired'),
            ],
        ]);
    }

    public function create()
    {
        if (!auth()->user()->hasPermission('stories.create')) abort(403);

        return Inertia::render('features/admin/pages/stories/Form', [
            'story' => null,
            'can' => [
                'publish' => auth()->user()->hasPermission('stories.publish'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('stories.create')) abort(403);

        $validated = $request->validate([
            'title_bn' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'cover_media_id' => 'nullable|exists:media,id',
            'edition' => 'required|in:bn,en,both',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $slug = $this->generateSlug($validated['title_bn']);

        $story = Story::create([
            ...$validated,
            'slug' => $slug,
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        if ($request->expectsJson()) {
            return response()->json(['story' => $story->toAPIArray()], 201);
        }

        return redirect()->route('admin.stories.edit', $story);
    }

    public function edit(Story $story)
    {
        if (!auth()->user()->hasPermission('stories.edit') &&
            !($story->created_by === auth()->id() && auth()->user()->hasPermission('stories.create'))) {
            abort(403);
        }

        $story->load(['coverMedia', 'slides.media', 'slides.linkedArticle.category']);

        return Inertia::render('features/admin/pages/stories/Form', [
            'story' => $story->toAPIArray(),
            'can' => [
                'publish' => auth()->user()->hasPermission('stories.publish'),
                'restore' => auth()->user()->hasPermission('stories.restore_expired'),
            ],
        ]);
    }

    public function update(Request $request, Story $story)
    {
        if (!auth()->user()->hasPermission('stories.edit') &&
            !($story->created_by === auth()->id() && auth()->user()->hasPermission('stories.create'))) {
            abort(403);
        }

        $validated = $request->validate([
            'title_bn' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'cover_media_id' => 'nullable|exists:media,id',
            'edition' => 'required|in:bn,en,both',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $story->update($validated);

        return response()->json(['story' => $story->fresh()->toAPIArray()]);
    }

    public function destroy(Story $story)
    {
        if (!auth()->user()->hasPermission('stories.delete')) abort(403);
        $story->delete();
        return response()->json(['ok' => true]);
    }

    public function publish(Story $story)
    {
        if (!auth()->user()->hasPermission('stories.publish')) abort(403);
        $story->publish(auth()->user());
        return response()->json(['story' => $story->toAPIArray()]);
    }

    public function restore(Story $story)
    {
        if (!auth()->user()->hasPermission('stories.restore_expired')) abort(403);
        $story->restore(auth()->user());
        return response()->json(['story' => $story->toAPIArray()]);
    }

    private function generateSlug(string $title, ?int $excludeId = null): string
    {
        $base = preg_replace('/[^\p{L}\p{N}\s-]+/u', '', $title);
        $base = preg_replace('/\s+/', '-', trim($base));
        $base = strtolower($base);
        if ($base === '') {
            $base = 'story-' . \Illuminate\Support\Str::random(6);
        }
        $slug = $base;
        $counter = 1;

        while (Story::where('slug', $slug)->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))->exists()) {
            $slug = $base . '-' . $counter++;
        }

        return $slug;
    }
}
