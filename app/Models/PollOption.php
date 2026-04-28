<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PollOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'poll_id',
        'option_bn',
        'option_en',
        'votes',
    ];

    public function poll()
    {
        return $this->belongsTo(Poll::class);
    }

    public function getOption(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->option_en : $this->option_bn;
    }
}
