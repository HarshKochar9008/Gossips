'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { getToken, isAuthenticated } from '@/lib/auth';
import type { BlogDetail, LikeResponse, Comment } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  const handleLike = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (!blog) return;

    try {
      const token = getToken()!;
      const data = await api.post<LikeResponse>(
        `/blogs/${blog.id}/likes/toggle`,
        undefined,
        { token }
      );
      setBlog((prev) =>
        prev
          ? {
              ...prev,
              hasLiked: data.liked,
              _count: { ...prev._count, likes: data.count },
            }
          : prev
      );
    } catch {
      console.error('Failed to toggle like');
    }
  };

  const handleCommentAdded = (comment: Comment) => {
    setBlog((prev) =>
      prev
        ? {
            ...prev,
            comments: [comment, ...prev.comments],
            _count: { ...prev._count, comments: prev._count.comments + 1 },
          }
        : prev
    );
  };

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
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${90 - i * 5}%` }} />
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
          <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-medium">
              {blog.author.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{blog.author.name}</div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {blog.publishedAt
                  ? formatDistanceToNow(new Date(blog.publishedAt), { addSuffix: true })
                  : ''}
              </div>
            </div>
          </div>
        </header>

        <div className="prose max-w-none mb-8 leading-relaxed whitespace-pre-wrap">
          {blog.content}
        </div>

        <div className="flex items-center gap-6 py-4 border-t border-b border-[var(--color-border)] mb-8">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              blog.hasLiked
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]'
            }`}
          >
            <svg className="w-5 h-5" fill={blog.hasLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-medium">{blog._count.likes}</span>
          </button>

          <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
            <div key={comment.id} className="border border-[var(--color-border)] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-medium">
                  {comment.author.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{comment.author.name}</span>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
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
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const token = getToken()!;
      const comment = await api.post<Comment>(
        `/blogs/${blogId}/comments`,
        { content: content.trim() },
        { token }
      );
      onCommentAdded(comment);
      setContent('');
    } catch {
      console.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isAuthenticated() ? 'Write a comment...' : 'Login to comment...'}
        className="input-field flex-1"
        maxLength={2000}
      />
      <button type="submit" disabled={loading || !content.trim()} className="btn-primary whitespace-nowrap">
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
