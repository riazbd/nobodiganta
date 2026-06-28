<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ArticleFactory extends Factory
{
    protected $model = Article::class;

    public function definition(): array
    {
        $title = $this->faker->sentence();

        return [
            'title_bn'     => $title,
            'body_bn'      => $this->faker->paragraph(),
            'slug_bn'      => Str::slug($title) . '-' . uniqid(),
            'edition'      => 'both',
            'article_type' => 'news',
            'status'       => 'published',
            'category_id'  => fn () => Category::firstOrCreate(
                ['slug' => 'test-category'],
                ['name_bn' => 'টেস্ট বিভাগ']
            )->id,
            'author_id'    => User::factory(),
            'published_at' => now(),
        ];
    }

    public function archived(): static
    {
        return $this->state(fn () => ['status' => 'archived']);
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => 'draft', 'published_at' => null]);
    }
}
