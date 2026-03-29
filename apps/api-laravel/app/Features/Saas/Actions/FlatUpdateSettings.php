<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Features\Saas\Services\OrgResolver;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlatUpdateSettings
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $org = OrgResolver::resolveUserOrg($request->user());

        if ($org === null) {
            return $this->error('NOT_FOUND', __('api.org.not_found'), 404);
        }

        $validated = $request->validate([
            'organizationName' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'regex:/^[a-z0-9-]+$/', 'unique:organizations,slug,'.$org->id],
        ]);

        $update = [];
        if (isset($validated['organizationName'])) {
            $update['name'] = $validated['organizationName'];
        }
        if (isset($validated['slug'])) {
            $update['slug'] = $validated['slug'];
        }

        if (! empty($update)) {
            $org->update($update);
            $org->refresh();
        }

        return $this->success([
            'organizationName' => $org->name,
            'slug' => $org->slug,
        ]);
    }
}
