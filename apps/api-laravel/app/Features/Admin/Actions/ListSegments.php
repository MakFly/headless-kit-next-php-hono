<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Customer;
use App\Shared\Models\Segment;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ListSegments
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $segments = Segment::all()->map(function ($segment) {
            $count = Customer::where('segment', $segment->slug)->count();

            return array_merge($segment->toArray(), ['customerCount' => $count]);
        });

        return $this->success($segments);
    }
}
