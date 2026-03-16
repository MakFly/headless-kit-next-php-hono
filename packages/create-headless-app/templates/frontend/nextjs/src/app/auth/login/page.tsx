'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testAccounts, setTestAccounts] = useState<{ email: string; name: string; password: string; role: string }[]>([]);

  useEffect(() => {
    fetch('/api/v1/auth/test-accounts')
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setTestAccounts(json.data ?? []))
      .catch(() => setTestAccounts([]));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const body = {
      email: form.get('email') as string,
      password: form.get('password') as string,
    };

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Login failed');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" name="email" type="email" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input id="password" name="password" type="password" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {testAccounts.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500">Quick test accounts</p>
            <div className="flex flex-wrap gap-2">
              {testAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="h-7 px-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => {
                    const emailInput = document.getElementById('email') as HTMLInputElement;
                    const passwordInput = document.getElementById('password') as HTMLInputElement;
                    if (emailInput) emailInput.value = account.email;
                    if (passwordInput) passwordInput.value = account.password;
                  }}
                >
                  {account.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account? <Link href="/auth/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
