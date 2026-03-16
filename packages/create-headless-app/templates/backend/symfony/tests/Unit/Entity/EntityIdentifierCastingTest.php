<?php

declare(strict_types=1);

use App\Entity\RefreshToken;
use App\Entity\Session;
use App\Entity\User;

describe('entity identifier casting', function () {
    it('casts user id to string', function () {
        $user = new User();

        $result = $user->setId(12345);

        expect($result)->toBe($user)
            ->and($user->getId())->toBe('12345');
    });

    it('casts refresh token user id to string', function () {
        $token = new RefreshToken();

        $result = $token->setUserId(67890);

        expect($result)->toBe($token)
            ->and($token->getUserId())->toBe('67890');
    });

    it('casts session user id to string', function () {
        $session = new Session();

        $result = $session->setUserId(42);

        expect($result)->toBe($session)
            ->and($session->getUserId())->toBe('42');
    });
});

