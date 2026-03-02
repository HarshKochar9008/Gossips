'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { BlogCard } from '@/components/blog-card';
import type { FeedResponse } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type SortOption = 'latest' | 'popular' | 'discussed';

export default function FeedPage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('latest');

  useEffect(() => {
    let cancelled = false;

    const fetchFeed = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<FeedResponse>(
          `/public/feed?page=${page}&limit=10`,
        );
        if (!cancelled) setFeed(data);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : 'Could not load feed. Make sure the backend is running.',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFeed();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const authors = useMemo(() => {
    if (!feed) return [];
    const names = new Set<string>();
    for (const blog of feed.blogs) {
      if (blog.author?.name) {
        names.add(blog.author.name);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [feed]);

  const filteredBlogs = useMemo(() => {
    if (!feed) return [];
    let blogs = [...feed.blogs];

    if (selectedAuthor !== 'all') {
      blogs = blogs.filter((b) => b.author?.name === selectedAuthor);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      blogs = blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.summary && b.summary.toLowerCase().includes(q)) ||
          (b.excerpt && b.excerpt.toLowerCase().includes(q)),
      );
    }

    blogs.sort((a, b) => {
      if (sort === 'popular') {
        return b._count.likes - a._count.likes;
      }
      if (sort === 'discussed') {
        return b._count.comments - a._count.comments;
      }

      const aDate = a.publishedAt ?? a.createdAt;
      const bDate = b.publishedAt ?? b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

    return blogs;
  }, [feed, selectedAuthor, search, sort]);

  if (loading && !feed) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>
              <div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
              <div className="mb-1 h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card border-red-200 bg-red-50">
          <h2 className="mb-2 text-lg font-semibold text-red-800">
            Could not load feed
          </h2>
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setPage(1)}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="mb-2 text-3xl font-bold">Public Feed</h1>
        <p className="text-[var(--color-text-secondary)]">
          Discover stories, ideas, and expertise from writers on GOSIPSS. Read,
          like, and join the conversation.
        </p>
      </div>

      {feed && filteredBlogs.length === 0 && (
        <div className="animate-fade-in-up text-center">
          <p className="text-lg text-[var(--color-text-secondary)]">
            No blogs match these filters.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearch('');
              setSelectedAuthor('all');
              setSort('latest');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,5fr)]">
        {/* Left: minimal filter rectangle */}
        <Card className="h-fit bg-slate-50">
          <CardContent className="p-4">
            <CardTitle className="mb-2 pt-4 text-base">Filter blogs</CardTitle>
            <CardDescription className="mb-4 text-xs">
              Search, pick author, and sort – all in one place.
            </CardDescription>

            {/* Search */}
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Search
              </label>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title or summary..."
                className="input-field h-9 rounded-full border-slate-200 text-xs"
              />
            </div>

            {/* Authors (dynamic dropdown) */}
            {authors.length > 0 && (
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Authors
                </label>
                <div className="relative">
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="input-field h-9 w-full appearance-none rounded-full border-slate-200 bg-white pr-8 text-xs"
                  >
                    <option value="all">All authors</option>
                    {authors.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-400">
                    ▼
                  </span>
                </div>
              </div>
            )}

            {/* Sort options */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Sort by
              </label>
              <div className="inline-flex rounded-full bg-white p-1 text-xs shadow-sm">
                <SortPill
                  label="Latest"
                  active={sort === 'latest'}
                  onClick={() => setSort('latest')}
                />
                <SortPill
                  label="Most liked"
                  active={sort === 'popular'}
                  onClick={() => setSort('popular')}
                />
                <SortPill
                  label="Most discussed"
                  active={sort === 'discussed'}
                  onClick={() => setSort('discussed')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: blog list */}
        <div className="space-y-4">
          {filteredBlogs.map((blog, i) => (
            <div
              key={blog.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <BlogCard blog={blog} />
            </div>
          ))}

          {feed && feed.pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4 animate-fade-in-up">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!feed.pagination.hasPrev}
                className="btn-secondary disabled:opacity-40 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                Previous
              </button>
              <span className="text-sm text-[var(--color-text-secondary)]">
                Page {feed.pagination.page} of {feed.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!feed.pagination.hasNext}
                className="btn-secondary disabled:opacity-40 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );
}

