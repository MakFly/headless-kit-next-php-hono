<?php

declare(strict_types=1);

namespace App\Shared\Middleware;

use App\Shared\Helpers\ApiResponse;
use App\Shared\Models\Organization;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OrgRbacMiddleware
{
    private const ROLE_HIERARCHY = [
        'viewer' => 1,
        'member' => 2,
        'admin'  => 3,
        'owner'  => 4,
    ];

    public function handle(Request $request, Closure $next, string $minRole = 'viewer'): Response
    {
        $orgId = $request->route('orgId');

        $org = Organization::find($orgId);
        if ($org === null) {
            return ApiResponse::error('NOT_FOUND', __('api.org.not_found'), 404);
        }

        /** @var \App\Shared\Models\User $user */
        $user = $request->user();

        $membership = $org->teamMembers()
            ->where('user_id', $user->id)
            ->first();

        if ($membership === null) {
            return ApiResponse::error('ACCESS_DENIED', __('api.org.forbidden'), 403);
        }

        $userLevel     = self::ROLE_HIERARCHY[$membership->role] ?? 0;
        $requiredLevel = self::ROLE_HIERARCHY[$minRole] ?? 0;

        if ($userLevel < $requiredLevel) {
            return ApiResponse::error('ACCESS_DENIED', __('api.org.forbidden'), 403);
        }

        $request->attributes->set('org', $org);
        $request->attributes->set('orgMembership', $membership);

        return $next($request);
    }
}
