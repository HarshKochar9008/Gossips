'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { BlogCard } from '@/components/blog-card';
import type { FeedResponse } from '@/lib/types';

export default function FeedPage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading && !feed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-full bg-gray-200 rounded mb-1" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
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
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Could not load feed
          </h2>
          <p className="text-red-700 text-sm mb-4">{error}</p>
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
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Public Feed</h1>
        <p className="text-[var(--color-text-secondary)]">
          Discover stories, ideas, and expertise from writers on Zodex.
        </p>
      </div>

      {feed && feed.blogs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg text-[var(--color-text-secondary)]">
            No published blogs yet. Be the first to write one!
          </p>
          <Link href="/register" className="btn-primary inline-block mt-4">
            Get Started
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {feed?.blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
      </div>

      {feed && feed.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={!feed.pagination.hasPrev}
            className="btn-secondary disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--color-text-secondary)]">
            Page {feed.pagination.page} of {feed.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!feed.pagination.hasNext}
            className="btn-secondary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
