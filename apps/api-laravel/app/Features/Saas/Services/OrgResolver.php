<?php

declare(strict_types=1);

namespace App\Features\Saas\Services;

use App\Shared\Models\Organization;
use App\Shared\Models\TeamMember;
use App\Shared\Models\User;

class OrgResolver
{
    /**
     * Resolve the user's active org: owned org first, then any org they're a member of.
     */
    public static function resolveUserOrg(User $user): ?Organization
    {
        // Prefer owned org
        $owned = Organization::where('owner_id', $user->id)->first();
        if ($owned !== null) {
            return $owned;
        }

        // Fallback: first org where user is a team member
        $membership = TeamMember::where('user_id', $user->id)->first();
        if ($membership !== null) {
            return Organization::find($membership->organization_id);
        }

        return null;
    }
}
