'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { getToken, isAuthenticated } from '@/lib/auth';
import type { Blog } from '@/lib/types';

export default function NewBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = getToken()!;
      await api.post<Blog>(
        '/dashboard/blogs',
        {
          title,
          content,
          excerpt: excerpt || undefined,
          isPublished,
        },
        { token }
      );
      router.push('/dashboard/blogs');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">New Blog</h1>
        <Link href="/dashboard/blogs" className="btn-secondary">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1.5">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field text-lg"
            placeholder="Your blog title"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-1.5">
            Excerpt (optional)
          </label>
          <input
            id="excerpt"
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="input-field"
            placeholder="A short preview of your blog"
            maxLength={300}
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1.5">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-[400px] resize-y font-mono"
            placeholder="Write your blog content here..."
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="publish"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <label htmlFor="publish" className="text-sm font-medium">
            Publish immediately
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : isPublished ? 'Publish Blog' : 'Save Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
