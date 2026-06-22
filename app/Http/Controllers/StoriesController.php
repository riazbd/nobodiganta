<?php
namespace App\Http\Controllers;

use App\Models\Story;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoriesController extends Controller
{
    public function index(Request $request)
    {
        $edition = $this->getEdition($request);

        $stories = Story::live()
            ->forEdition($edition)
            ->with(['coverMedia', 'slides.media', 'slides.linkedArticle.category'])
            ->withCount('slides')
            ->latest('published_at')
            ->paginate(24)
            ->through(fn($s) => $s->toAPIArray($edition));

        return Inertia::render('Stories', [
            'stories' => $stories,
            'edition' => $edition,
        ]);
    }

    public function apiIndex(Request $request)
    {
        $edition = $this->getEdition($request);
        $limit = min((int) $request->get('limit', 10), 20);

        $stories = Story::live()
            ->forEdition($edition)
            ->with(['coverMedia', 'slides.media', 'slides.linkedArticle.category'])
            ->withCount('slides')
            ->latest('published_at')
            ->limit($limit)
            ->get()
            ->map(fn($s) => $s->toAPIArray($edition));

        return response()->json(['stories' => $stories]);
    }

    /**
     * Count a story view — once per browser session (so refreshes/replays don't
     * inflate it), and only for published stories. Fire-and-forget from the viewer.
     */
    public function trackView(Request $request, Story $story)
    {
        if ($story->status !== 'published') {
            return response()->noContent();
        }

        $viewed = $request->session()->get('viewed_stories', []);
        if (! in_array($story->id, $viewed, true)) {
            $story->increment('view_count');
            $viewed[] = $story->id;
            $request->session()->put('viewed_stories', $viewed);
        }

        return response()->noContent();
    }

    protected function getEdition(Request $request): string
    {
        if (str_starts_with($request->path(), 'en/')) return 'en';
        return $request->query('edition') === 'en' ? 'en' : 'bn';
    }
}
