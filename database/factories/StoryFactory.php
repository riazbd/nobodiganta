<?php
namespace Database\Factories;

use App\Models\Story;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class StoryFactory extends Factory
{
    protected $model = Story::class;

    public function definition(): array
    {
        $title = $this->faker->sentence(4);
        return [
            'title_bn' => 'পরীক্ষা ' . $this->faker->word(),
            'title_en' => $title,
            'slug' => Str::slug($title) . '-' . $this->faker->unique()->numberBetween(1, 9999),
            'status' => 'draft',
            'edition' => 'bn',
            'expires_at' => null,
            'published_at' => null,
            'created_by' => User::factory(),
            'published_by' => null,
            'view_count' => 0,
        ];
    }

    public function published(): static
    {
        return $this->state(['status' => 'published', 'published_at' => now()]);
    }

    public function expired(): static
    {
        return $this->state(['status' => 'expired', 'expires_at' => now()->subHour()]);
    }
}
