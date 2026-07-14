<?php

use App\Models\Article;
use App\Models\Reporter;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

/**
 * One-off data repair for the unified author model.
 *
 * The public byline (Article::getAuthorData) resolves an author's name from the
 * reporter profile linked to the authoring account (reporters.user_id). Where
 * that link was missing, the byline fell back to the account and showed the
 * wrong text (e.g. the code name). This backfill guarantees that every account
 * that has authored an article owns exactly one linked reporter profile:
 *
 *   1. If a matching unlinked reporter already exists (same email, else same
 *      display name), adopt it — this reunites split records like the two
 *      "Lifestyle Desk" entries without creating a duplicate.
 *   2. Otherwise create a reporter profile from the account.
 *
 * Additive and idempotent: accounts that already have a linked profile are
 * skipped, so it is safe to run more than once.
 */
return new class extends Migration
{
    public function up(): void
    {
        $authorIds = Article::whereNotNull('author_id')->distinct()->pluck('author_id');

        foreach ($authorIds as $userId) {
            $user = User::find($userId);
            if (! $user) {
                continue;
            }

            // Already has a linked profile — nothing to do.
            if (Reporter::where('user_id', $user->id)->exists()) {
                continue;
            }

            // Prefer adopting an existing unlinked reporter by email, then name.
            $reporter = null;
            if ($user->email) {
                $reporter = Reporter::whereNull('user_id')->where('email', $user->email)->first();
            }
            if (! $reporter) {
                $reporter = Reporter::whereNull('user_id')
                    ->where(fn ($q) => $q->where('name_en', $user->name)->orWhere('name_bn', $user->name))
                    ->first();
            }

            if ($reporter) {
                $reporter->update(['user_id' => $user->id]);
                continue;
            }

            // No profile to adopt — create one from the account. The code name is
            // intentionally NOT used as a name here; it is only an approver credit.
            Reporter::create([
                'user_id'   => $user->id,
                'name_bn'   => $user->name,
                'name_en'   => $user->name,
                'slug'      => $this->uniqueSlug($user->name),
                'email'     => $user->email,
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 0,
            ]);
        }
    }

    public function down(): void
    {
        // Non-reversible: we cannot safely tell which links/profiles were created
        // by this backfill versus set up by hand, so we leave the data in place.
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'author';
        $slug = $base;
        $i = 1;
        while (Reporter::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
};
