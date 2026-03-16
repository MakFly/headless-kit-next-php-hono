import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {'{{PROJECT_NAME}}'}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your Headless Kit app is ready. Get started by logging in or creating an account.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
          >
            Register
          </Link>
        </div>
        <div className="mt-12 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
