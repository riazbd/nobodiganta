<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrayerTime extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'fajr',
        'sunrise',
        'dhuhr',
        'asr',
        'maghrib',
        'sunset',
        'isha',
        'isha_end',
    ];

    public function scopeToday($query)
    {
        return $query->where('date', now()->toDateString());
    }
}
