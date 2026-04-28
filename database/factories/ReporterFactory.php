<?php

namespace Database\Factories;

use App\Models\Reporter;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Reporter>
 */
class ReporterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->name();
        return [
            'user_id' => User::factory(),
            'name_bn' => $name, // For fake data, we'll just use English name for both
            'name_en' => $name,
            'slug' => Str::slug($name),
            'designation_bn' => $this->faker->jobTitle(),
            'designation_en' => $this->faker->jobTitle(),
            'bio_bn' => $this->faker->paragraph(),
            'bio_en' => $this->faker->paragraph(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'is_active' => true,
            'is_featured' => $this->faker->boolean(20),
            'sort_order' => 0,
        ];
    }
}
