<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\PhotocardTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PhotocardTemplateController extends Controller
{
    private const PERMISSION = 'photocard.manage';            // build / edit templates (admin)
    private const DOWNLOAD_PERMISSION = 'photocard.download'; // download a card from a saved template

    /** Full studio access (create/edit/delete templates). */
    private function authorizeAccess(): void
    {
        if (!auth()->user()->hasPermission(self::PERMISSION)) {
            abort(403);
        }
    }

    /** Read-only consumer access (download from the news list). Studio managers qualify too. */
    private function authorizeDownload(): void
    {
        $user = auth()->user();
        if (!$user->hasPermission(self::DOWNLOAD_PERMISSION) && !$user->hasPermission(self::PERMISSION)) {
            abort(403);
        }
    }

    /** The Studio page (template list + builder). */
    public function index()
    {
        $this->authorizeAccess();

        return Inertia::render('features/admin/pages/photocard/PhotocardStudio', $this->indexProps());
    }

    private function indexProps(): array
    {
        return [
            'templates' => PhotocardTemplate::orderBy('sort_order')->orderByDesc('id')->get(),
        ];
    }

    /** Lightweight JSON list of active templates — consumed by the PhotoCard modal. */
    public function apiList()
    {
        $this->authorizeDownload();

        return response()->json([
            'templates' => PhotocardTemplate::active()
                ->orderBy('sort_order')->orderByDesc('id')
                ->get(['id', 'name_bn', 'name_en', 'slug', 'canvas_preset', 'config']),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeAccess();

        $validated = $this->validateTemplate($request);
        $validated['slug']       = $this->uniqueSlug($validated['name_en'] ?: $validated['name_bn']);
        $validated['created_by'] = auth()->id();
        $validated['sort_order'] = $validated['sort_order'] ?? ((PhotocardTemplate::max('sort_order') ?? 0) + 1);

        PhotocardTemplate::create($validated);

        // Redirect to the clean index URL so the address bar stays /admin/photocard-templates
        // (a direct Inertia::render here would leave the URL at the PUT/POST resource URL,
        //  which has no GET route → 404 on reload).
        return redirect()->route('admin.photocard-templates');
    }

    public function update(Request $request, PhotocardTemplate $template)
    {
        $this->authorizeAccess();

        $validated = $this->validateTemplate($request);
        $template->update($validated);

        return redirect()->route('admin.photocard-templates');
    }

    public function destroy(PhotocardTemplate $template)
    {
        $this->authorizeAccess();
        $template->delete();

        return redirect()->route('admin.photocard-templates');
    }

    public function duplicate(PhotocardTemplate $template)
    {
        $this->authorizeAccess();

        $copy = $template->replicate(['slug']);
        $copy->name_bn    = $template->name_bn . ' (কপি)';
        $copy->name_en    = $template->name_en ? $template->name_en . ' (copy)' : null;
        $copy->slug       = $this->uniqueSlug($template->name_en ?: $template->name_bn);
        $copy->sort_order = (PhotocardTemplate::max('sort_order') ?? 0) + 1;
        $copy->created_by = auth()->id();
        $copy->save();

        return redirect()->route('admin.photocard-templates');
    }

    /** Active image ads from the Ad Manager — for the photocard ad-banner picker. */
    public function ads()
    {
        $this->authorizeDownload();

        // Active image-banner ads. The active() scope treats a missing (NULL) start/end
        // date as "no limit", so date-less ads are included; only real out-of-range excluded.
        $imageAds = Ad::active()
            ->where('type', 'image')
            ->whereNotNull('image')->where('image', '!=', '')
            ->orderBy('sort_order')
            ->get(['id', 'title_bn', 'title_en', 'image', 'position', 'link']);

        return response()->json([
            'ads' => $imageAds,
            // position => active ad image, for the dynamic {{ad:position}} token
            'byPosition' => $imageAds->groupBy('position')->map(fn($g) => $g->first()->image),
        ]);
    }

    /** Copy an external image URL onto our own server (avoids canvas CORS taint). */
    public function importUrl(Request $request)
    {
        $this->authorizeAccess();
        $request->validate(['url' => ['required', 'url', 'max:2000']]);

        try {
            $resp = Http::timeout(15)->get($request->input('url'));
            if (!$resp->ok()) return response()->json(['error' => 'fetch_failed'], 422);

            $ct  = (string) $resp->header('Content-Type');
            if (!str_starts_with($ct, 'image/')) return response()->json(['error' => 'not_an_image'], 422);
            $ext = match (true) {
                str_contains($ct, 'png')  => 'png',
                str_contains($ct, 'webp') => 'webp',
                str_contains($ct, 'gif')  => 'gif',
                str_contains($ct, 'svg')  => 'svg',
                default                   => 'jpg',
            };
            $path = 'photocard/' . Str::lower(Str::random(16)) . '.' . $ext;
            Storage::disk('public')->put($path, $resp->body());

            return response()->json(['url' => '/storage/' . $path]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'import_failed'], 422);
        }
    }

    /** Upload an asset (background / logo / ad banner image) used inside a config. */
    public function uploadAsset(Request $request)
    {
        $this->authorizeAccess();

        $request->validate([
            'file' => ['required', 'file', 'image', 'max:8192'],
        ]);

        $path = $request->file('file')->store('photocard', 'public');

        return response()->json(['url' => '/storage/' . $path]);
    }

    private function validateTemplate(Request $request): array
    {
        return $request->validate([
            'name_bn'       => ['required', 'string', 'max:200'],
            'name_en'       => ['nullable', 'string', 'max:200'],
            'canvas_preset' => ['required', 'string', 'max:50'],
            'config'        => ['required', 'array'],
            'is_active'     => ['boolean'],
            'sort_order'    => ['nullable', 'integer'],
        ]);
    }

    private function uniqueSlug(string $base): string
    {
        $slug = Str::slug($base) ?: 'photocard';
        return $slug . '-' . Str::lower(Str::random(6));
    }
}
