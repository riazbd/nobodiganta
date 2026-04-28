<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CricketMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'series_bn',
        'series_en',
        'status',
        'status_text_bn',
        'status_text_en',
        'teams',
        'sort_order',
    ];

    protected $casts = [
        'teams' => 'array',
    ];

    public function getSeries(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->series_en : $this->series_bn;
    }

    public function getStatusText(string $lang = 'bn'): ?string
    {
        return $lang === 'en' ? $this->status_text_en : $this->status_text_bn;
    }
}
