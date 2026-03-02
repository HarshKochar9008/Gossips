'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getToken, isAuthenticated } from '@/lib/auth';
import type { Blog } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function BlogListPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = useCallback(async () => {
    try {
      const token = getToken()!;
      const data = await api.get<Blog[]>('/dashboard/blogs', { token });
      setBlogs(data);
    } catch {
      console.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    fetchBlogs();
  }, [router, fetchBlogs]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const token = getToken()!;
      await api.delete(`/dashboard/blogs/${id}`, { token });
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch {
      console.error('Failed to delete blog');
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const token = getToken()!;
      const updated = await api.patch<Blog>(`/dashboard/blogs/${id}/toggle-publish`, undefined, {
        token,
      });
      setBlogs((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch {
      console.error('Failed to toggle publish');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold">My Blogs</h1>
        <Link href="/dashboard/blogs/new" className="btn-primary transition-all duration-200 hover:scale-105">
          New Blog
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 card animate-scale-in">
          <p className="text-lg text-[var(--color-text-secondary)] mb-4">
            No blogs yet. Start writing!
          </p>
          <Link href="/dashboard/blogs/new" className="btn-primary transition-all duration-200 hover:scale-105">
            Create Blog
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog, i) => (
            <div
              key={blog.id}
              className="card animate-slide-up transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{blog.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-text-secondary)]">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        blog.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span>{blog._count.likes} likes</span>
                    <span>{blog._count.comments} comments</span>
                    <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(blog.id)}
                    className="btn-secondary text-sm !py-1.5 !px-3"
                  >
                    {blog.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <Link
                    href={`/dashboard/blogs/${blog.id}/edit`}
                    className="btn-secondary text-sm !py-1.5 !px-3"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="btn-danger text-sm !py-1.5 !px-3"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
