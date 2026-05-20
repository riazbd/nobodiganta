<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\Division;
use App\Models\District;
use App\Models\Upazila;
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
        return Division::withCount('districts')->orderBy('name_en')->get()->toArray();
    }

    protected function loadDistricts(string $divisionSlug): array
    {
        $div = Division::where('slug', $divisionSlug)->first();
        if (!$div) return [];
        return $div->districts()->orderBy('name_en')
            ->get(['id', 'slug', 'name_bn', 'name_en'])
            ->map(fn($d) => $d->toArray())->toArray();
    }

    protected function loadUpazilas(string $divisionSlug, string $districtSlug): array
    {
        $dist = District::whereHas('division', fn($q) => $q->where('slug', $divisionSlug))
            ->where('slug', $districtSlug)->first();
        if (!$dist) return [];
        return $dist->upazilas()->orderBy('name_en')
            ->get(['id', 'slug', 'name_bn', 'name_en'])
            ->map(fn($u) => $u->toArray())->toArray();
    }

    // Builds the sidebar tree widget — counts come from the category pivot, not string columns
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

    // Returns article counts keyed by division slug (e.g. ['dhaka' => 12, 'chittagong' => 8])
    protected function divisionCounts(string $edition): array
    {
        return Category::where('slug', 'like', 'division-%')
            ->withCount(['articles as total' => fn($q) => $q->published()->forEdition($edition)])
            ->get()
            ->mapWithKeys(fn($c) => [str_replace('division-', '', $c->slug) => $c->total])
            ->toArray();
    }

    // Returns article counts keyed by district slug for districts within the given division
    protected function districtCounts(string $division, string $edition): array
    {
        return Category::whereHas('parent', fn($q) => $q->where('slug', 'division-' . $division))
            ->withCount(['articles as total' => fn($q) => $q->published()->forEdition($edition)])
            ->get()
            ->mapWithKeys(fn($c) => [str_replace('district-', '', $c->slug) => $c->total])
            ->toArray();
    }

    // Returns article counts keyed by upazila slug for upazilas within the given district
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
            ->whereHas('categories', fn($q) => $q->where('slug', 'saradesh'))
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

        $articles = Article::published()
            ->forEdition($edition)
            ->whereHas('categories', fn($q) => $q->where('slug', 'division-' . $division))
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
            ->whereHas('categories', fn($q) => $q->where('slug', 'district-' . $district))
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
            ->whereHas('categories', fn($q) => $q->where('slug', 'upazila-' . $upazila))
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
