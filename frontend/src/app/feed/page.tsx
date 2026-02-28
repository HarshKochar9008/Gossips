'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { FeedResponse, Blog } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link href={`/blog/${blog.slug}`} className="block">
      <article className="card group">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-medium">
            {blog.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-sm font-medium">{blog.author.name}</span>
            <span className="text-xs text-[var(--color-text-secondary)] ml-2">
              {blog.publishedAt
                ? formatDistanceToNow(new Date(blog.publishedAt), { addSuffix: true })
                : ''}
            </span>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--color-primary)] transition-colors">
          {blog.title}
        </h2>

        {blog.excerpt && (
          <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-3">
            {blog.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1">
            <HeartIcon />
            {blog._count.likes}
          </span>
          <span className="flex items-center gap-1">
            <CommentIcon />
            {blog._count.comments}
          </span>
        </div>
      </article>
    </Link>
  );
}

function HeartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

export default function FeedPage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<FeedResponse>(`/public/feed?page=${page}&limit=10`);
        setFeed(data);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Could not load feed. Make sure the backend is running (e.g. npm start in backend).';
        setError(message);
        console.error('Failed to fetch feed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [page, retryCount]);

  if (loading && !feed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
        <div className="card border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Could not load feed
          </h2>
          <p className="text-red-700 dark:text-red-300 text-sm mb-4">{error}</p>
          {error === 'Internal server error' && (
            <p className="text-red-600 dark:text-red-400 text-xs mb-4">
              Check the backend terminal for the real error. Restart the backend after changing .env (e.g. DATABASE_URL).
            </p>
          )}
          <button
            type="button"
            onClick={() => setRetryCount((c) => c + 1)}
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
        {feed?.blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
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
