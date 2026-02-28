'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { getToken, isAuthenticated } from '@/lib/auth';
import { LikeButton } from '@/components/like-button';
import { CommentItem } from '@/components/comment-item';
import type { BlogDetail, Comment } from '@/lib/types';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = getToken();
        const data = await api.get<BlogDetail>(`/public/blogs/${slug}`, {
          token: token || undefined,
        });
        setBlog(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Blog not found');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const handleCommentAdded = useCallback((comment: Comment) => {
    setBlog((prev) =>
      prev
        ? {
            ...prev,
            comments: [comment, ...prev.comments],
            _count: { ...prev._count, comments: prev._count.comments + 1 },
          }
        : prev,
    );
  }, []);

  const handleLikeUpdate = useCallback((liked: boolean, count: number) => {
    setBlog((prev) =>
      prev
        ? { ...prev, hasLiked: liked, _count: { ...prev._count, likes: count } }
        : prev,
    );
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-3/4 bg-gray-200 rounded" />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded"
                style={{ width: `${90 - i * 5}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center animate-fade-in-up">
        <h1 className="text-2xl font-bold mb-4">Blog not found</h1>
        <p className="text-[var(--color-text-secondary)] mb-6">{error}</p>
        <Link href="/feed" className="btn-primary">
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in-up">
      <article>
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-medium shrink-0">
              {(blog.author?.name || blog.author?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{blog.author?.name || blog.author?.email}</div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {blog.publishedAt
                  ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : ''}
              </div>
            </div>
          </div>
        </header>

        <div className="prose max-w-none mb-8 leading-relaxed whitespace-pre-wrap">
          {blog.content}
        </div>

        <div className="flex items-center gap-6 py-4 border-t border-b border-[var(--color-border)] mb-8">
          <LikeButton
            blogId={blog.id}
            initialLiked={blog.hasLiked}
            initialCount={blog._count.likes}
            onUpdate={handleLikeUpdate}
          />

          <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="font-medium">{blog._count.comments}</span>
          </span>
        </div>
      </article>

      <section>
        <h2 className="text-xl font-bold mb-6">Comments</h2>

        <CommentForm blogId={blog.id} onCommentAdded={handleCommentAdded} />

        <div className="space-y-4 mt-6">
          {blog.comments.length === 0 && (
            <p className="text-[var(--color-text-secondary)] text-center py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
          {blog.comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </section>
    </div>
  );
}

function CommentForm({
  blogId,
  onCommentAdded,
}: {
  blogId: string;
  onCommentAdded: (comment: Comment) => void;
}) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = getToken()!;
      const comment = await api.post<Comment>(
        `/blogs/${blogId}/comments`,
        { content: content.trim() },
        { token },
      );
      onCommentAdded(comment);
      setContent('');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to post comment',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isAuthenticated() ? 'Write a comment...' : 'Login to comment...'
          }
          className="input-field flex-1"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="btn-primary whitespace-nowrap"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
