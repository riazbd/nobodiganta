<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Price extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'title_bn',
        'title_en',
        'amount',
        'currency',
        'unit',
        'trend',
        'change',
        'sort_order',
    ];

    public function getTitle(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->title_en : $this->title_bn;
    }
}
