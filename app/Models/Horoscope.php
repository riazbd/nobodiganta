<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Horoscope extends Model
{
    use HasFactory;

    protected $fillable = [
        'sign',
        'sign_bn',
        'date',
        'prediction_en',
        'prediction_bn',
    ];

    public function scopeToday($query)
    {
        return $query->where('date', now()->toDateString());
    }

    public function getSign(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->sign : $this->sign_bn;
    }

    public function getPrediction(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->prediction_en : $this->prediction_bn;
    }
}
