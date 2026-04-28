<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Newsletter extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_bn',
        'subject_en',
        'content_bn',
        'content_en',
        'sent_at',
        'recipients',
        'opened',
        'clicked',
        'status',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function getSubject(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->subject_en : $this->subject_bn;
    }
}
