'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getToken, getUser, isAuthenticated } from '@/lib/auth';
import type { Blog } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const fetchBlogs = async () => {
      try {
        const token = getToken()!;
        const data = await api.get<Blog[]>('/dashboard/blogs', { token });
        setBlogs(data);
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [router]);

  const publishedCount = blogs.filter((b) => b.isPublished).length;
  const draftCount = blogs.filter((b) => !b.isPublished).length;
  const totalLikes = blogs.reduce((sum, b) => sum + b._count.likes, 0);
  const totalComments = blogs.reduce((sum, b) => sum + b._count.comments, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Welcome back, {user?.name || 'Writer'}
          </p>
        </div>
        <Link href="/dashboard/blogs/new" className="btn-primary">
          New Blog
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Blogs" value={blogs.length} />
        <StatCard label="Published" value={publishedCount} />
        <StatCard label="Drafts" value={draftCount} />
        <StatCard label="Total Likes" value={totalLikes} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Your Blogs</h2>
        <Link href="/dashboard/blogs" className="text-sm text-[var(--color-primary)] hover:underline">
          View all
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
        <div className="text-center py-16 card">
          <p className="text-lg text-[var(--color-text-secondary)] mb-4">
            You haven&apos;t written any blogs yet.
          </p>
          <Link href="/dashboard/blogs/new" className="btn-primary">
            Write Your First Blog
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.slice(0, 5).map((blog) => (
            <Link key={blog.id} href={`/dashboard/blogs/${blog.id}/edit`} className="block card group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold group-hover:text-[var(--color-primary)] transition-colors">
                    {blog.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-text-secondary)]">
                    <span>{blog._count.likes} likes</span>
                    <span>{blog._count.comments} comments</span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    blog.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {blog.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold text-[var(--color-primary)]">{value}</div>
      <div className="text-sm text-[var(--color-text-secondary)] mt-1">{label}</div>
    </div>
  );
}
