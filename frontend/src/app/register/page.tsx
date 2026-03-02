'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { setAuth } from '@/lib/auth';
import type { AuthResponse } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
      });
      setAuth(data.token, data.user);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card animate-scale-in">
          <h1 className="text-2xl font-bold text-center mb-2">Create account</h1>
          <p className="text-[var(--color-text-secondary)] text-center mb-8">
            Join GOSIPSS and start writing. Publish your first post in minutes.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field transition-all duration-200 focus:scale-[1.01]"
                placeholder="Your name"
                required
                minLength={2}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field transition-all duration-200 focus:scale-[1.01]"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field transition-all duration-200 focus:scale-[1.01]"
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--color-primary)] font-medium hover:underline transition-opacity hover:opacity-80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
