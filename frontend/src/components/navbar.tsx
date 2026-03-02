'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { getUser, clearAuth, isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { AVATAR_IMAGES, FALLBACK_AVATAR, getAvatarUrlForUser } from '@/lib/avatars';
import { api } from '@/lib/api';
import type { FeedResponse } from '@/lib/types';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Contact', href: '/contact' },
  { label: 'Blog', href: '/feed' },
  { label: 'About Us', href: '/about' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  // Fetch latest blogs when search opens
  useEffect(() => {
    if (!searchOpen) return;
    let cancelled = false;
    setFeedLoading(true);
    api
      .get<FeedResponse>('/public/feed?page=1&limit=20')
      .then((data) => {
        if (!cancelled) setFeed(data);
      })
      .catch(() => {
        if (!cancelled) setFeed(null);
      })
      .finally(() => {
        if (!cancelled) setFeedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchOpen]);

  const searchResults = useMemo(() => {
    if (!feed?.blogs) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return [...feed.blogs].sort((a, b) => {
        const aDate = a.publishedAt ?? a.createdAt;
        const bDate = b.publishedAt ?? b.createdAt;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
    }
    return feed.blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.summary?.toLowerCase().includes(q)) ||
        (b.excerpt?.toLowerCase().includes(q)) ||
        b.author?.name?.toLowerCase().includes(q),
    );
  }, [feed, searchQuery]);
  const closeNotifications = useCallback(() => setNotificationsOpen(false), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && closeSearch();
    if (searchOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && closeNotifications();
    if (notificationsOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notificationsOpen, closeNotifications]);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, [pathname]);

  useEffect(() => {
    if (!mounted || !user) {
      setAvatarUrl(null);
      return;
    }

    const updateAvatar = () => {
      try {
        const src = getAvatarUrlForUser(user.name);
        setAvatarUrl(src);
      } catch {
        setAvatarUrl(FALLBACK_AVATAR);
      }
    };

    updateAvatar();

    if (typeof window !== 'undefined') {
      const handler = () => updateAvatar();
      window.addEventListener('zodex-avatar-updated', handler);
      return () => {
        window.removeEventListener('zodex-avatar-updated', handler);
      };
    }

    return;
  }, [mounted, user]);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    closeMobileMenu();
    router.push('/feed');
    router.refresh();
  };

  // Close mobile menu on route change and lock body scroll when open
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Search popup overlay - blur + glass morphism */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 animate-fade-in"
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        >
          <div
            className="absolute inset-0 bg-black/20"
            onClick={closeSearch}
            aria-hidden
          />
          <div
            className="relative w-full max-w-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl border border-white/10 bg-slate-800/40 shadow-2xl shadow-black/20 backdrop-blur-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                <svg className="w-5 h-5 shrink-0 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Start typing..."
                  className="w-full bg-transparent text-white placeholder:text-white/60 text-base focus:outline-none"
                  autoComplete="off"
                  onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                />
              </div>
              <div className="max-h-[min(60vh,400px)] overflow-y-auto">
                {feedLoading ? (
                  <div className="px-5 py-8 text-center text-white/60 text-sm">
                    Loading articles...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-5 py-8 text-center text-white/60 text-sm">
                    {searchQuery.trim() ? 'No articles match your search.' : 'No articles yet.'}
                  </div>
                ) : (
                  <div className="py-2">
                    <p className="px-5 py-1.5 text-xs font-medium text-white/50 uppercase tracking-wider">
                      {searchQuery.trim() ? 'Search results' : 'Latest articles'}
                    </p>
                    {searchResults.map((blog) => {
                      const desc = blog.excerpt || blog.summary || '';
                      const snippet = desc ? `${desc.slice(0, 60)}${desc.length > 60 ? '...' : ''}` : '';
                      return (
                        <Link
                          key={blog.id}
                          href={`/blog/${blog.slug}`}
                          onClick={closeSearch}
                          className="flex flex-col gap-0.5 px-5 py-3 hover:bg-white/10 transition-colors"
                        >
                          <span className="text-white font-medium truncate">{blog.title}</span>
                          <span className="text-xs text-white/60 truncate">
                            {blog.author?.name || blog.author?.email}
                            {snippet && ` · ${snippet}`}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={closeMobileMenu}
          aria-hidden
        />
      )}

      {/* Notifications panel */}
      {notificationsOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-end pt-20 pr-4 bg-black/10 backdrop-blur-sm animate-fade-in"
          onClick={closeNotifications}
          aria-hidden
        >
          <div
            className="w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl border border-[var(--color-border)] bg-white shadow-xl animate-slide-in-right">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]/70">
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  Notifications
                </span>
                <button
                  type="button"
                  onClick={closeNotifications}
                  className="p-1 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                  aria-label="Close notifications"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                No new notifications.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile slide-out drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[min(100vw-3rem,320px)] bg-white border-l border-[var(--color-border)] shadow-2xl md:hidden transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!mobileMenuOpen}
        aria-modal="true"
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-[var(--color-border)]/50">
            <span className="text-lg font-bold text-[var(--color-text)]">Menu</span>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="p-2.5 -mr-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-4">
            <ul className="space-y-0.5">
              {navItems.map((item, i) => (
                <li
                  key={item.label}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
                >
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-colors ${
                      mounted && pathname === item.href
                        ? 'text-[var(--color-text)] bg-[var(--color-bg-secondary)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]/70'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-[var(--color-border)]/50 space-y-2">
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  setSearchOpen(true);
                }}
                className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]/70 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
              {mounted && user ? (
                <>
                  <Link
                    href="/dashboard/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]/70 font-medium transition-colors"
                  >
                    <span className="w-9 h-9 rounded-full overflow-hidden border border-[var(--color-border)] bg-amber-100 flex items-center justify-center text-sm shrink-0">
                      <Image
                        src={avatarUrl || FALLBACK_AVATAR}
                        alt={user.name ? `${user.name} avatar` : 'Profile avatar'}
                        width={36}
                        height={36}
                        className="w-9 h-9 object-cover"
                      />
                    </span>
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-[var(--color-text-secondary)] hover:text-red-600 hover:bg-red-50 font-medium transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : mounted ? (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center px-4 py-3 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text)] border border-[var(--color-border)] font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      </div>

      <header className="border-b border-[var(--color-border)]/50 bg-white/95 backdrop-blur-sm sticky top-0 z-50 transition-shadow duration-30 hover:shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-lg sm:text-xl font-bold tracking-tight transition-transform duration-200 hover:scale-105 active:scale-100 flex items-baseline gap-0.5 shrink-0"
        >
          <span className="text-[var(--color-text-gop-gop)] font-gyoza tracking-wide sm:text-4xl capitalize px-3 py-1.5 rounded-lg bg-white/25 backdrop-blur-md border border-white/80 shadow-[0_0_15px_rgba(246, 12, 12, 0.819)]">Gossips</span>
        </Link>

        {/* Desktop nav - hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
          {navItems.map((item, i) => (
            <span key={item.label} className="flex items-center gap-1">
              <Link
                href={item.href}
                className={`font-medium px-2 py-1 rounded transition-all duration-200 hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]/80 ${
                  mounted && pathname === item.href
                    ? 'text-[var(--color-text)]'
                    : ''
                }`}
              >
                {item.label}
              </Link>
              {i < navItems.length - 1 && (
                <span className="text-[var(--color-border)] select-none" aria-hidden>·</span>
              )}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all duration-200 hover:scale-110 rounded-full hover:bg-[var(--color-bg-secondary)]/80 shrink-0"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all duration-200 hover:scale-110 rounded-full hover:bg-[var(--color-bg-secondary)]/80 shrink-0 hidden sm:inline-flex"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          {mounted && user ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                href="/dashboard/profile"
                className="w-9 h-9 rounded-full overflow-hidden border border-[var(--color-border)] bg-amber-100 hover:opacity-90 transition-all duration-200 flex items-center justify-center"
                aria-label="Profile"
              >
                <Image
                  src={avatarUrl || FALLBACK_AVATAR}
                  alt={user.name ? `${user.name} avatar` : 'Profile avatar'}
                  width={36}
                  height={36}
                  className="w-9 h-9 object-cover"
                />
              </Link>
              <span className="text-[var(--color-text-secondary)]" aria-hidden>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] ml-1"
              >
                Logout
              </button>
            </div>
          ) : mounted ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link href="/login" className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors duration-200 px-2 py-1 rounded hover:bg-[var(--color-bg-secondary)]/80">
                Login
              </Link>
              <Link href="/register" className="text-sm font-medium text-[var(--color-text)] hover:underline transition-all duration-200 px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)]/60">
                Sign Up
              </Link>
              <span className="text-[var(--color-text-secondary)]" aria-hidden>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          ) : null}

          {/* Mobile hamburger - only on small screens */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden p-1.5 -mr-1 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]/80 transition-all duration-200 shrink-0"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? ( 
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
    </>
  );
}
