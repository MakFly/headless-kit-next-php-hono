<?php

declare(strict_types=1);

namespace App\Shared\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleMiddleware
{
    private const SUPPORTED_LOCALES = ['en', 'fr'];

    private const DEFAULT_LOCALE = 'en';

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->parseLocale($request->header('Accept-Language', ''));

        app()->setLocale($locale);

        return $next($request);
    }

    private function parseLocale(string $header): string
    {
        if (empty($header)) {
            return self::DEFAULT_LOCALE;
        }

        // Parse "fr-FR,fr;q=0.9,en;q=0.8" → extract primary language tags
        $parts = explode(',', $header);

        foreach ($parts as $part) {
            // Strip quality values like ";q=0.9"
            $tag = trim(explode(';', $part)[0]);
            // Normalize "fr-FR" → "fr"
            $lang = strtolower(explode('-', $tag)[0]);

            if (in_array($lang, self::SUPPORTED_LOCALES, true)) {
                return $lang;
            }
        }

        return self::DEFAULT_LOCALE;
    }
}
