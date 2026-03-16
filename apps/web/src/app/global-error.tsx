'use client';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="bg-white">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
            Error
          </p>

          <h1 className="mt-6 font-serif text-3xl text-stone-900">
            Something went wrong
          </h1>

          {error.message && (
            <p className="mt-4 max-w-md text-sm text-stone-500">
              {error.message}
            </p>
          )}

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={reset}
              className="inline-flex h-11 items-center bg-stone-900 px-10 text-[11px] uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800"
            >
              Try Again
            </button>

            <a
              href="/"
              className="text-[11px] uppercase tracking-[0.15em] text-stone-500 underline-offset-4 hover:underline"
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
