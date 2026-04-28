<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Epaper extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'edition',
        'pdf_url',
        'thumbnail_url',
        'label_bn',
        'label_en',
    ];

    public function getLabel(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->label_en : $this->label_bn;
    }
}
