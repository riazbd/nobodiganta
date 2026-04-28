<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Weather extends Model
{
    use HasFactory;

    protected $fillable = [
        'city_bn',
        'city_en',
        'date',
        'temp_c',
        'condition_bn',
        'condition_en',
        'humidity',
        'wind_kph',
        'max_temp_c',
        'min_temp_c',
        'icon',
    ];

    public function scopeToday($query)
    {
        return $query->where('date', now()->toDateString());
    }

    public function getCity(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->city_en : $this->city_bn;
    }

    public function getCondition(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->condition_en : $this->condition_bn;
    }
}
