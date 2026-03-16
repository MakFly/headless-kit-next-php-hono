<?php

declare(strict_types=1);

use App\Features\Support\Actions\AgentAssigned;
use App\Features\Support\Actions\AgentQueue;
use App\Features\Support\Actions\AssignConversation;
use App\Features\Support\Actions\CreateCannedResponse;
use App\Features\Support\Actions\CreateConversation;
use App\Features\Support\Actions\DeleteCannedResponse;
use App\Features\Support\Actions\ListCannedResponses;
use App\Features\Support\Actions\ListConversations;
use App\Features\Support\Actions\RateConversation;
use App\Features\Support\Actions\RatingsStats;
use App\Features\Support\Actions\SendMessage;
use App\Features\Support\Actions\ShowConversation;
use App\Features\Support\Actions\UpdateCannedResponse;
use App\Features\Support\Actions\UpdateConversationStatus;
use Illuminate\Support\Facades\Route;

// User endpoints
Route::middleware('auth:betterauth')->prefix('support')->group(function (): void {
    Route::get('/conversations', ListConversations::class);
    Route::post('/conversations', CreateConversation::class);
    Route::get('/conversations/{id}', ShowConversation::class);
    Route::post('/conversations/{id}/messages', SendMessage::class);
    Route::post('/conversations/{id}/rate', RateConversation::class);
});

// Agent endpoints (auth:betterauth + role:admin)
Route::middleware(['auth:betterauth', 'role:admin'])->prefix('support/agent')->group(function (): void {
    Route::get('/queue', AgentQueue::class);
    Route::get('/assigned', AgentAssigned::class);
    Route::patch('/conversations/{id}/assign', AssignConversation::class);
    Route::patch('/conversations/{id}/status', UpdateConversationStatus::class);
    Route::get('/canned', ListCannedResponses::class);
    Route::post('/canned', CreateCannedResponse::class);
    Route::put('/canned/{id}', UpdateCannedResponse::class);
    Route::delete('/canned/{id}', DeleteCannedResponse::class);
    Route::get('/ratings', RatingsStats::class);
});
