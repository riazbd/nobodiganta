<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdClient extends Model
{
    protected $fillable = [
        'name', 'contact_person', 'email', 'phone',
        'website', 'logo', 'notes', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function ads(): HasMany
    {
        return $this->hasMany(Ad::class, 'client_id');
    }
}
