<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Poll extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_bn',
        'question_en',
        'is_active',
        'start_date',
        'end_date',
        'total_votes',
        'featured_image',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'total_votes' => 'integer',
    ];

    public function options()
    {
        return $this->hasMany(PollOption::class);
    }

    public function getQuestion(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->question_en : $this->question_bn;
    }
}
