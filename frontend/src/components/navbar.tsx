'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser, clearAuth, isAuthenticated } from '@/lib/auth';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push('/feed');
    router.refresh();
  };

  return (
    <header className="border-b border-[var(--color-border)]/60 bg-white/70 sticky top-0 z-50 backdrop-blur-md supports-[backdrop-filter]:bg-white/40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/feed"
          className="text-xl font-semibold tracking-tight text-[var(--color-primary)] hover:opacity-90 transition-opacity"
        >
          Zodex
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/feed"
            className={`text-sm font-medium transition-colors ${
              mounted && pathname === '/feed'
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            Feed
          </Link>

          {mounted && user ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  mounted && pathname?.startsWith('/dashboard')
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-3 ml-2">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {user.name}
                </span>
                <button onClick={handleLogout} className="btn-secondary text-sm !py-1.5 !px-3">
                  Logout
                </button>
              </div>
            </>
          ) : mounted ? (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary text-sm !py-1.5 !px-3">
                Login
              </Link>
              <Link href="/register" className="btn-primary text-sm !py-1.5 !px-3">
                Sign Up
              </Link>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
