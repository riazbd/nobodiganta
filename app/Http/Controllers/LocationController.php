<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    protected function getEdition(Request $request): string
    {
        $path = $request->path();
        if ($path === 'en' || str_starts_with($path, 'en/')) {
            return 'en';
        }
        return $request->query('edition') === 'en' ? 'en' : 'bn';
    }

    /**
     * Root level — shows all divisions. No article filtering here, just the map.
     */
    public function index(Request $request)
    {
        $edition = $this->getEdition($request);

        // Count articles per division so UI can show badge counts
        $divisionCounts = Article::published()
            ->forEdition($edition)
            ->selectRaw('division, count(*) as total')
            ->whereNotNull('division')
            ->groupBy('division')
            ->pluck('total', 'division');

        return Inertia::render('Location', [
            'level'          => 'country',
            'division'       => null,
            'district'       => null,
            'upazila'        => null,
            'articles'       => null,
            'divisionCounts' => $divisionCounts,
            'edition'        => $edition,
        ]);
    }

    /**
     * Division level — shows districts within the division + articles.
     */
    public function division(Request $request, string $division)
    {
        $edition = $this->getEdition($request);

        $articles = Article::published()
            ->forEdition($edition)
            ->where('division', $division)
            ->withRelations()
            ->latest('published_at')
            ->paginate(20)
            ->through(fn($a) => $a->toAPIArray($edition));

        $districtCounts = Article::published()
            ->forEdition($edition)
            ->where('division', $division)
            ->selectRaw('district, count(*) as total')
            ->whereNotNull('district')
            ->groupBy('district')
            ->pluck('total', 'district');

        return Inertia::render('Location', [
            'level'          => 'division',
            'division'       => $division,
            'district'       => null,
            'upazila'        => null,
            'articles'       => $articles,
            'districtCounts' => $districtCounts,
            'edition'        => $edition,
        ]);
    }

    /**
     * District level — shows upazilas within the district + articles.
     */
    public function district(Request $request, string $division, string $district)
    {
        $edition = $this->getEdition($request);

        $articles = Article::published()
            ->forEdition($edition)
            ->where('division', $division)
            ->where('district', $district)
            ->withRelations()
            ->latest('published_at')
            ->paginate(20)
            ->through(fn($a) => $a->toAPIArray($edition));

        $upazilaCounts = Article::published()
            ->forEdition($edition)
            ->where('division', $division)
            ->where('district', $district)
            ->selectRaw('upazila, count(*) as total')
            ->whereNotNull('upazila')
            ->groupBy('upazila')
            ->pluck('total', 'upazila');

        return Inertia::render('Location', [
            'level'         => 'district',
            'division'      => $division,
            'district'      => $district,
            'upazila'       => null,
            'articles'      => $articles,
            'upazilaCounts' => $upazilaCounts,
            'edition'       => $edition,
        ]);
    }

    /**
     * Upazila level — shows articles for this specific upazila.
     */
    public function upazila(Request $request, string $division, string $district, string $upazila)
    {
        $edition = $this->getEdition($request);

        $articles = Article::published()
            ->forEdition($edition)
            ->where('division', $division)
            ->where('district', $district)
            ->where('upazila', $upazila)
            ->withRelations()
            ->latest('published_at')
            ->paginate(20)
            ->through(fn($a) => $a->toAPIArray($edition));

        return Inertia::render('Location', [
            'level'    => 'upazila',
            'division' => $division,
            'district' => $district,
            'upazila'  => $upazila,
            'articles' => $articles,
            'edition'  => $edition,
        ]);
    }
}
