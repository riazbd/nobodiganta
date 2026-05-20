<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\District;
use App\Models\Upazila;
use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        $divisions = Division::withCount('districts')
            ->with(['districts' => function ($q) {
                $q->withCount('upazilas')->orderBy('name_en');
            }])
            ->orderBy('name_en')
            ->get()
            ->map(function ($div) {
                $div->article_count = Article::where('division', $div->slug)->count();
                $div->districts->each(function ($dist) {
                    $dist->article_count = Article::where('division', $dist->division->slug)
                        ->where('district', $dist->slug)
                        ->count();
                    $dist->upazilas->each(function ($upa) use ($dist) {
                        $upa->article_count = Article::where('division', $dist->division->slug)
                            ->where('district', $dist->slug)
                            ->where('upazila', $upa->slug)
                            ->count();
                    });
                });
                return $div;
            });

        return Inertia::render('features/admin/pages/operations/LocationManager', [
            'divisions' => $divisions,
        ]);
    }

    public function storeDivision(Request $request)
    {
        $data = $request->validate([
            'slug'    => 'required|string|max:100|unique:divisions,slug',
            'name_bn' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
        ]);

        $division = Division::create($data);

        return redirect()->back()->with('success', 'Division created successfully.');
    }

    public function updateDivision(Request $request, Division $division)
    {
        $data = $request->validate([
            'slug'    => 'required|string|max:100|unique:divisions,slug,' . $division->id,
            'name_bn' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
        ]);

        $division->update($data);

        return redirect()->back()->with('success', 'Division updated successfully.');
    }

    public function destroyDivision(Division $division)
    {
        $articleCount = Article::where('division', $division->slug)->count();
        if ($articleCount > 0) {
            return redirect()->back()->with('error', 'Cannot delete division — ' . $articleCount . ' articles reference it.');
        }

        $division->delete();

        return redirect()->back()->with('success', 'Division deleted successfully.');
    }

    public function storeDistrict(Request $request)
    {
        $data = $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'slug'        => 'required|string|max:100|unique:districts,slug,NULL,id,division_id,' . $request->division_id,
            'name_bn'     => 'required|string|max:255',
            'name_en'     => 'required|string|max:255',
        ]);

        District::create($data);

        return redirect()->back()->with('success', 'District created successfully.');
    }

    public function updateDistrict(Request $request, District $district)
    {
        $data = $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'slug'        => 'required|string|max:100|unique:districts,slug,' . $district->id . ',id,division_id,' . $request->division_id,
            'name_bn'     => 'required|string|max:255',
            'name_en'     => 'required|string|max:255',
        ]);

        $district->update($data);

        return redirect()->back()->with('success', 'District updated successfully.');
    }

    public function destroyDistrict(District $district)
    {
        $division = $district->division;
        $articleCount = Article::where('division', $division->slug)
            ->where('district', $district->slug)
            ->count();
        if ($articleCount > 0) {
            return redirect()->back()->with('error', 'Cannot delete district — ' . $articleCount . ' articles reference it.');
        }

        $district->delete();

        return redirect()->back()->with('success', 'District deleted successfully.');
    }

    public function storeUpazila(Request $request)
    {
        $data = $request->validate([
            'district_id' => 'required|exists:districts,id',
            'slug'        => 'required|string|max:100|unique:upazilas,slug,NULL,id,district_id,' . $request->district_id,
            'name_bn'     => 'required|string|max:255',
            'name_en'     => 'required|string|max:255',
        ]);

        Upazila::create($data);

        return redirect()->back()->with('success', 'Upazila created successfully.');
    }

    public function updateUpazila(Request $request, Upazila $upazila)
    {
        $data = $request->validate([
            'district_id' => 'required|exists:districts,id',
            'slug'        => 'required|string|max:100|unique:upazilas,slug,' . $upazila->id . ',id,district_id,' . $request->district_id,
            'name_bn'     => 'required|string|max:255',
            'name_en'     => 'required|string|max:255',
        ]);

        $upazila->update($data);

        return redirect()->back()->with('success', 'Upazila updated successfully.');
    }

    public function destroyUpazila(Upazila $upazila)
    {
        $divisionSlug = $upazila->district->division->slug;
        $districtSlug = $upazila->district->slug;
        $articleCount = Article::where('division', $divisionSlug)
            ->where('district', $districtSlug)
            ->where('upazila', $upazila->slug)
            ->count();
        if ($articleCount > 0) {
            return redirect()->back()->with('error', 'Cannot delete upazila — ' . $articleCount . ' articles reference it.');
        }

        $upazila->delete();

        return redirect()->back()->with('success', 'Upazila deleted successfully.');
    }

    // ── API for cascading dropdowns ─────────────────────────────────────

    public function apiDivisions()
    {
        return response()->json(
            Division::orderBy('name_en')->get(['id', 'slug', 'name_bn', 'name_en'])
        );
    }

    public function apiDistricts(Division $division)
    {
        return response()->json(
            $division->districts()->orderBy('name_en')->get(['id', 'slug', 'name_bn', 'name_en'])
        );
    }

    public function apiUpazilas(District $district)
    {
        return response()->json(
            $district->upazilas()->orderBy('name_en')->get(['id', 'slug', 'name_bn', 'name_en'])
        );
    }
}
