<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_bn',
        'name_en',
        'value',
        'change',
        'is_up',
        'sort_order',
    ];

    protected $casts = [
        'is_up' => 'boolean',
    ];

    public function getName(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->name_en : $this->name_bn;
    }
}
