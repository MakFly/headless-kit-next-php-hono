<?php

declare(strict_types=1);

namespace App\Shared\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsageRecord extends Model
{
    use HasUuids;

    protected $fillable = [
        'organization_id',
        'metric',
        'value',
        'limit_value',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'integer',
            'limit_value' => 'integer',
            'recorded_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
