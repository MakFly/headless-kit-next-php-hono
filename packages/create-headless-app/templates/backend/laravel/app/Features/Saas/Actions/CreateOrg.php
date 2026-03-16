<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Shared\Models\Organization;
use App\Shared\Models\TeamMember;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CreateOrg
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Shared\Models\User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'regex:/^[a-z0-9-]+$/', 'unique:organizations,slug'],
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']) . '-' . Str::lower(Str::random(6));

        if (! isset($validated['slug'])) {
            while (Organization::where('slug', $slug)->exists()) {
                $slug = Str::slug($validated['name']) . '-' . Str::lower(Str::random(6));
            }
        }

        $org = Organization::create([
            'name'     => $validated['name'],
            'slug'     => $slug,
            'owner_id' => $user->id,
        ]);

        TeamMember::create([
            'organization_id' => $org->id,
            'user_id'         => $user->id,
            'role'            => 'owner',
            'joined_at'       => now(),
        ]);

        return $this->created([
            'id'   => $org->id,
            'name' => $org->name,
            'slug' => $org->slug,
            'role' => 'owner',
            'plan' => null,
        ]);
    }
}
