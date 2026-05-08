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

        $stories = Story::published()
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

        $stories = Story::published()
            ->forEdition($edition)
            ->with(['coverMedia', 'slides.media', 'slides.linkedArticle.category'])
            ->withCount('slides')
            ->latest('published_at')
            ->limit($limit)
            ->get()
            ->map(fn($s) => $s->toAPIArray($edition));

        return response()->json(['stories' => $stories]);
    }

    protected function getEdition(Request $request): string
    {
        if (str_starts_with($request->path(), 'en/')) return 'en';
        return $request->query('edition') === 'en' ? 'en' : 'bn';
    }
}
