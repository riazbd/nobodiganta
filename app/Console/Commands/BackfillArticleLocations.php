<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Console\Command;

class BackfillArticleLocations extends Command
{
    protected $signature = 'articles:backfill-locations {--dry-run : Show what would change without saving}';
    protected $description = 'Expand location category ancestors in pivot, then re-derive division/district/upazila strings';

    public function handle(): int
    {
        $dryRun  = $this->option('dry-run');
        $updated = 0;
        $skipped = 0;

        Article::with(['categories'])->chunkById(200, function ($articles) use ($dryRun, &$updated, &$skipped) {
            foreach ($articles as $article) {
                // Find the location categories this article already has in the pivot
                $locationCatIds = $article->categories
                    ->filter(fn($c) => str_starts_with($c->slug, 'upazila-')
                        || str_starts_with($c->slug, 'district-')
                        || str_starts_with($c->slug, 'division-'))
                    ->pluck('id')
                    ->toArray();

                if (empty($locationCatIds)) {
                    // No location categories — clear string columns if set
                    if ($article->division || $article->district || $article->upazila) {
                        $this->line("Article #{$article->id}: clearing stale location strings (no location categories)");
                        if (!$dryRun) {
                            $article->update(['division' => null, 'district' => null, 'upazila' => null]);
                        }
                        $updated++;
                    } else {
                        $skipped++;
                    }
                    continue;
                }

                // Expand to include all ancestors (district, division, saradesh)
                $expandedIds = $this->expandWithAncestors($locationCatIds);

                // Derive the string values from the expanded set
                $expandedCats = Category::whereIn('id', $expandedIds)->get(['id', 'slug']);
                $division = null;
                $district = null;
                $upazila  = null;

                foreach ($expandedCats as $cat) {
                    if (str_starts_with($cat->slug, 'upazila-')) {
                        $upazila = substr($cat->slug, 8);
                    } elseif (str_starts_with($cat->slug, 'district-')) {
                        $district = substr($cat->slug, 9);
                    } elseif (str_starts_with($cat->slug, 'division-')) {
                        $division = substr($cat->slug, 9);
                    }
                }

                $stringsChanged = $article->division !== $division
                    || $article->district !== $district
                    || $article->upazila  !== $upazila;

                // Check which ancestor IDs are missing from the current pivot
                $existingCatIds = $article->categories->pluck('id')->toArray();
                $missingIds     = array_diff($expandedIds, $existingCatIds);

                if (!$stringsChanged && empty($missingIds)) {
                    $skipped++;
                    continue;
                }

                $this->line("Article #{$article->id}: division={$division} district={$district} upazila={$upazila}" .
                    (!empty($missingIds) ? ' [+' . count($missingIds) . ' ancestor cats]' : ''));

                if (!$dryRun) {
                    // Add missing ancestor categories to pivot (without detaching existing ones)
                    if (!empty($missingIds)) {
                        $pivotData = [];
                        foreach ($missingIds as $catId) {
                            $pivotData[$catId] = ['is_primary' => false, 'sort_order' => 999];
                        }
                        $article->categories()->syncWithoutDetaching($pivotData);
                    }

                    if ($stringsChanged) {
                        $article->update([
                            'division' => $division,
                            'district' => $district,
                            'upazila'  => $upazila,
                        ]);
                    }
                }

                $updated++;
            }
        });

        $this->info("Done. Updated: {$updated}, unchanged: {$skipped}" . ($dryRun ? ' (dry run — nothing saved)' : ''));

        return 0;
    }

    private function expandWithAncestors(array $categoryIds): array
    {
        $allIds    = array_values(array_unique($categoryIds));
        $toProcess = $allIds;

        while (!empty($toProcess)) {
            $parentIds = Category::whereIn('id', $toProcess)
                ->whereNotNull('parent_id')
                ->pluck('parent_id')
                ->unique()
                ->toArray();

            $newParents = array_values(array_diff($parentIds, $allIds));
            if (empty($newParents)) break;

            $allIds    = array_values(array_unique(array_merge($allIds, $newParents)));
            $toProcess = $newParents;
        }

        return $allIds;
    }
}
