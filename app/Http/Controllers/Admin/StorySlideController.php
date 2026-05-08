<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Models\StorySlide;
use Illuminate\Http\Request;

class StorySlideController extends Controller
{
    private function canEdit(Story $story): bool
    {
        return auth()->user()->hasPermission('stories.edit') ||
               ($story->created_by === auth()->id() && auth()->user()->hasPermission('stories.create'));
    }

    public function store(Request $request, Story $story)
    {
        if (!$this->canEdit($story)) abort(403);

        $validated = $request->validate([
            'media_id' => 'required|exists:media,id',
            'text_overlay_bn' => 'nullable|string|max:255',
            'text_overlay_en' => 'nullable|string|max:255',
            'linked_article_id' => 'nullable|exists:articles,id',
            'duration' => 'nullable|integer|min:1|max:30',
        ]);

        $maxOrder = $story->slides()->max('sort_order') ?? -1;

        $slide = $story->slides()->create([
            ...$validated,
            'sort_order' => $maxOrder + 1,
            'duration' => $validated['duration'] ?? 5,
        ]);

        $slide->load(['media', 'linkedArticle.category']);

        return response()->json(['slide' => $slide->toAPIArray()], 201);
    }

    public function update(Request $request, Story $story, StorySlide $slide)
    {
        if (!$this->canEdit($story)) abort(403);
        abort_unless($slide->story_id === $story->id, 404);

        $validated = $request->validate([
            'media_id' => 'sometimes|exists:media,id',
            'text_overlay_bn' => 'nullable|string|max:255',
            'text_overlay_en' => 'nullable|string|max:255',
            'linked_article_id' => 'nullable|exists:articles,id',
            'duration' => 'nullable|integer|min:1|max:30',
        ]);

        $slide->update($validated);
        $slide->load(['media', 'linkedArticle.category']);

        return response()->json(['slide' => $slide->toAPIArray()]);
    }

    public function destroy(Story $story, StorySlide $slide)
    {
        if (!$this->canEdit($story)) abort(403);
        abort_unless($slide->story_id === $story->id, 404);

        $slide->delete();

        // Re-index sort_order to keep sequential
        $story->slides()->orderBy('sort_order')->get()
            ->each(fn($s, $i) => $s->update(['sort_order' => $i]));

        return response()->json(['ok' => true]);
    }

    public function reorder(Request $request, Story $story)
    {
        if (!$this->canEdit($story)) abort(403);

        $validated = $request->validate([
            'slide_ids' => 'required|array',
            'slide_ids.*' => 'integer|exists:story_slides,id',
        ]);

        foreach ($validated['slide_ids'] as $order => $slideId) {
            StorySlide::where('id', $slideId)
                ->where('story_id', $story->id)
                ->update(['sort_order' => $order]);
        }

        return response()->json(['ok' => true]);
    }
}
