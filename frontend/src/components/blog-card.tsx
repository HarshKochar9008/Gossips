'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { Blog } from '@/lib/types';
import { FALLBACK_AVATAR, getAvatarUrlForUser } from '@/lib/avatars';

export function BlogCard({ blog }: { blog: Blog }) {
  const avatarSrc = getAvatarUrlForUser(blog.author?.name) || FALLBACK_AVATAR;

  return (
    <Link href={`/blog/${blog.slug}`} className="block group">
      <article className="card group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[var(--color-primary)]/20">
        <div className="mb-3 flex items-center gap-2">
          <img
            src={avatarSrc}
            alt={blog.author?.name || 'User avatar'}
            className="h-8 w-8 shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] object-cover transition-transform duration-200 group-hover:scale-105"
          />
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

        <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--color-primary)] transition-colors duration-200">
          {blog.title}
        </h2>

        {(blog.excerpt || blog.summary) && (
          <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-3">
            {blog.excerpt || blog.summary}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1 transition-colors group-hover:text-[var(--color-accent)]">
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
