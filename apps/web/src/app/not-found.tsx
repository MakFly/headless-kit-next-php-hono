import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="select-none font-serif text-8xl text-stone-200">
        404
      </span>

      <h1 className="mt-6 font-serif text-2xl text-stone-900">
        Page Not Found
      </h1>

      <p className="mt-4 max-w-sm text-sm text-stone-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        className="mt-10 inline-flex h-11 items-center bg-stone-900 px-10 text-[11px] uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800"
      >
        Return Home
      </Link>
    </div>
  );
}
