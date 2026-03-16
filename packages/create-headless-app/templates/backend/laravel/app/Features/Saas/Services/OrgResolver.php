<?php

declare(strict_types=1);

namespace App\Features\Saas\Services;

use App\Shared\Models\Organization;
use App\Shared\Models\User;

class OrgResolver
{
    public static function resolveUserOrg(User $user): ?Organization
    {
        return Organization::where('owner_id', $user->id)->first();
    }
}
