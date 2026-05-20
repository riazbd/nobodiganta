<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Upazila extends Model
{
    protected $fillable = ['district_id', 'slug', 'name_bn', 'name_en'];

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }
}
