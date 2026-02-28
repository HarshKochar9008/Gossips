'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { Blog } from '@/lib/types';

export function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link href={`/blog/${blog.slug}`} className="block">
      <article className="card group">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-medium shrink-0">
            {(blog.author?.name || blog.author?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="text-sm font-medium">{blog.author?.name || blog.author?.email}</span>
            <span className="text-xs text-[var(--color-text-secondary)] ml-2">
              {(() => {
                const raw = blog.publishedAt ?? blog.createdAt;
                if (!raw) return '';
                const d = new Date(raw);
                return isNaN(d.getTime()) ? '' : formatDistanceToNow(d, { addSuffix: true });
              })()}
            </span>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--color-primary)] transition-colors">
          {blog.title}
        </h2>

        {(blog.excerpt || blog.summary) && (
          <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-3">
            {blog.excerpt || blog.summary}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {blog._count?.likes ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {blog._count?.comments ?? 0}
          </span>
        </div>
      </article>
    </Link>
  );
}
