<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
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

    protected function loadDivisions(): array
    {
        return Category::whereHas('parent', fn($q) => $q->where('slug', 'saradesh'))
            ->withCount('children as districts_count')
            ->orderBy('sort_order')
            ->get()
            ->map(fn($c) => [
                'slug'            => str_replace('division-', '', $c->slug),
                'name_bn'         => $c->name_bn,
                'name_en'         => $c->name_en,
                'districts_count' => $c->districts_count,
            ])
            ->toArray();
    }

    protected function loadDistricts(string $divisionSlug): array
    {
        return Category::whereHas('parent', fn($q) => $q->where('slug', 'division-' . $divisionSlug))
            ->orderBy('sort_order')
            ->get()
            ->map(fn($c) => [
                'slug'    => str_replace('district-', '', $c->slug),
                'name_bn' => $c->name_bn,
                'name_en' => $c->name_en,
            ])
            ->toArray();
    }

    protected function loadUpazilas(string $divisionSlug, string $districtSlug): array
    {
        return Category::whereHas('parent', fn($q) => $q->where('slug', 'district-' . $districtSlug))
            ->orderBy('sort_order')
            ->get()
            ->map(fn($c) => [
                'slug'    => str_replace('upazila-', '', $c->slug),
                'name_bn' => $c->name_bn,
                'name_en' => $c->name_en,
            ])
            ->toArray();
    }

    // Public API for filter widget — reads from categories, not location tables
    public function apiDistricts(string $division)
    {
        $districts = Category::whereHas('parent', fn($q) => $q->where('slug', 'division-' . $division))
            ->orderBy('sort_order')
            ->get()
            ->map(fn($c) => [
                'slug'    => str_replace('district-', '', $c->slug),
                'name_bn' => $c->name_bn,
                'name_en' => $c->name_en,
            ]);

        return response()->json($districts);
    }

    public function apiUpazilas(string $district)
    {
        $upazilas = Category::whereHas('parent', fn($q) => $q->where('slug', 'district-' . $district))
            ->orderBy('sort_order')
            ->get()
            ->map(fn($c) => [
                'slug'    => str_replace('upazila-', '', $c->slug),
                'name_bn' => $c->name_bn,
                'name_en' => $c->name_en,
            ]);

        return response()->json($upazilas);
    }

    protected function loadLocationTree(): ?array
    {
        $cat = Category::where('slug', 'saradesh')
            ->withCount(['articles as articles_count' => fn($q) => $q->where('status', 'published')])
            ->with(['children' => function ($q) {
                $q->withCount(['articles as articles_count' => fn($q2) => $q2->where('status', 'published')])
                  ->orderBy('sort_order');
            }])
            ->first();

        return $cat?->toArray();
    }

    protected function divisionCounts(string $edition): array
    {
        return Category::whereHas('parent', fn($q) => $q->where('slug', 'saradesh'))
            ->withCount(['articles as total' => fn($q) => $q->published()->forEdition($edition)])
            ->get()
            ->mapWithKeys(fn($c) => [str_replace('division-', '', $c->slug) => $c->total])
            ->toArray();
    }

    protected function districtCounts(string $division, string $edition): array
    {
        return Category::whereHas('parent', fn($q) => $q->where('slug', 'division-' . $division))
            ->withCount(['articles as total' => fn($q) => $q->published()->forEdition($edition)])
            ->get()
            ->mapWithKeys(fn($c) => [str_replace('district-', '', $c->slug) => $c->total])
            ->toArray();
    }

    protected function upazilaCounts(string $district, string $edition): array
    {
        return Category::whereHas('parent', fn($q) => $q->where('slug', 'district-' . $district))
            ->withCount(['articles as total' => fn($q) => $q->published()->forEdition($edition)])
            ->get()
            ->mapWithKeys(fn($c) => [str_replace('upazila-', '', $c->slug) => $c->total])
            ->toArray();
    }

    public function index(Request $request)
    {
        $edition = $this->getEdition($request);

        $articles = Article::published()
            ->forEdition($edition)
            ->where(function ($q) {
                $q->whereHas('categories', fn($q2) => $q2->where('slug', 'saradesh'))
                  ->orWhereNotNull('division');
            })
            ->withRelations()
            ->latest('published_at')
            ->paginate(20)
            ->through(fn($a) => $a->toAPIArray($edition));

        return Inertia::render('Location', [
            'level'          => 'country',
            'divisions'      => $this->loadDivisions(),
            'division'       => null,
            'district'       => null,
            'upazila'        => null,
            'articles'       => $articles,
            'locationTree'   => $this->loadLocationTree(),
            'divisionCounts' => $this->divisionCounts($edition),
            'edition'        => $edition,
        ]);
    }

    public function division(Request $request, string $division)
    {
        $edition = $this->getEdition($request);

        // The /saradesh/{x} URL space is shared: location divisions live at
        // /saradesh/{division}, but articles whose primary category is সারাদেশ
        // live at /saradesh/{slug}. This route is declared before the article
        // catch-all, so it wins for BOTH. If {division} is not a real division
        // category, treat it as an article slug and hand off to the article page.
        $isRealDivision = Category::whereHas('parent', fn($q) => $q->where('slug', 'saradesh'))
            ->where('slug', 'division-' . $division)
            ->exists();

        if (! $isRealDivision) {
            return app(NewsController::class)->article($request, 'saradesh', $division);
        }

        $articles = Article::published()
            ->forEdition($edition)
            ->where(function ($q) use ($division) {
                $q->whereHas('categories', fn($q2) => $q2->where('slug', 'division-' . $division))
                  ->orWhere('division', $division);
            })
            ->withRelations()
            ->latest('published_at')
            ->paginate(20)
            ->through(fn($a) => $a->toAPIArray($edition));

        return Inertia::render('Location', [
            'level'          => 'division',
            'divisions'      => $this->loadDivisions(),
            'districts'      => $this->loadDistricts($division),
            'locationTree'   => $this->loadLocationTree(),
            'division'       => $division,
            'district'       => null,
            'upazila'        => null,
            'articles'       => $articles,
            'districtCounts' => $this->districtCounts($division, $edition),
            'edition'        => $edition,
        ]);
    }

    public function district(Request $request, string $division, string $district)
    {
        $edition = $this->getEdition($request);

        $articles = Article::published()
            ->forEdition($edition)
            ->where(function ($q) use ($district) {
                $q->whereHas('categories', fn($q2) => $q2->where('slug', 'district-' . $district))
                  ->orWhere('district', $district);
            })
            ->withRelations()
            ->latest('published_at')
            ->paginate(20)
            ->through(fn($a) => $a->toAPIArray($edition));

        return Inertia::render('Location', [
            'level'         => 'district',
            'divisions'     => $this->loadDivisions(),
            'districts'     => $this->loadDistricts($division),
            'upazilas'      => $this->loadUpazilas($division, $district),
            'locationTree'  => $this->loadLocationTree(),
            'division'      => $division,
            'district'      => $district,
            'upazila'       => null,
            'articles'      => $articles,
            'upazilaCounts' => $this->upazilaCounts($district, $edition),
            'edition'       => $edition,
        ]);
    }

    public function upazila(Request $request, string $division, string $district, string $upazila)
    {
        $edition = $this->getEdition($request);

        $articles = Article::published()
            ->forEdition($edition)
            ->where(function ($q) use ($upazila) {
                $q->whereHas('categories', fn($q2) => $q2->where('slug', 'upazila-' . $upazila))
                  ->orWhere('upazila', $upazila);
            })
            ->withRelations()
            ->latest('published_at')
            ->paginate(20)
            ->through(fn($a) => $a->toAPIArray($edition));

        return Inertia::render('Location', [
            'level'        => 'upazila',
            'divisions'    => $this->loadDivisions(),
            'districts'    => $this->loadDistricts($division),
            'upazilas'     => $this->loadUpazilas($division, $district),
            'locationTree' => $this->loadLocationTree(),
            'division'     => $division,
            'district'     => $district,
            'upazila'      => $upazila,
            'articles'     => $articles,
            'edition'      => $edition,
        ]);
    }
}
