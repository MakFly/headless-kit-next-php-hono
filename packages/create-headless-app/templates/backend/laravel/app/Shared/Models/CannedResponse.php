<?php

declare(strict_types=1);

namespace App\Shared\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CannedResponse extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'content',
        'category',
        'shortcut',
        'created_by',
    ];
}
