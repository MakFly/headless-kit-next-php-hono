<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Features\Saas\Services\OrgResolver;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlatGetSettings
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $org = OrgResolver::resolveUserOrg($request->user());

        if ($org === null) {
            return $this->error('NOT_FOUND', __('api.org.not_found'), 404);
        }

        return $this->success([
            'organizationName' => $org->name,
            'slug'             => $org->slug,
        ]);
    }
}
