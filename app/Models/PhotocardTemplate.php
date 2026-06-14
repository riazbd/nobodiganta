<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhotocardTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_bn',
        'name_en',
        'slug',
        'canvas_preset',
        'config',
        'thumbnail',
        'is_active',
        'sort_order',
        'created_by',
    ];

    protected $casts = [
        'config'    => 'array',
        'is_active' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
