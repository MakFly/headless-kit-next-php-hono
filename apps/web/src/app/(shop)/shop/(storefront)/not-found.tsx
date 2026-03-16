import Link from 'next/link';

export default function StorefrontNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="select-none font-serif text-8xl text-stone-200">
        404
      </span>

      <h2 className="mt-6 font-serif text-2xl text-stone-900">
        Item Not Found
      </h2>

      <p className="mt-4 max-w-sm text-sm text-stone-500">
        The product or page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/shop"
        className="mt-10 inline-flex h-11 items-center bg-stone-900 px-10 text-[11px] uppercase tracking-[0.15em] text-white transition-colors hover:bg-stone-800"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
