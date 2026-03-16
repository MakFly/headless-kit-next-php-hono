<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\User;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ListUsers
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $paginator = User::with('roles')->paginate(15);

        return $this->paginated(
            $paginator->items(),
            $paginator->currentPage(),
            $paginator->perPage(),
            $paginator->total()
        );
    }
}
