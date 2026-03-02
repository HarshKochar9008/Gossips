'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut ,
  FileText,
  Heart,
  LayoutDashboard,
  MessageCircle,
  Pencil,
  Search,
  User,
} from 'lucide-react';
import { api } from '@/lib/api';
import { clearAuth, getToken, getUser, isAuthenticated } from '@/lib/auth';
import type { Blog } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAvatarUrlForUser } from '@/lib/avatars';

const VISITOR_SERIES = {
  monthly: {
    current: [40, 55, 45, 65, 50, 70, 60, 75, 68, 80, 72, 85],
    previous: [32, 48, 40, 58, 46, 62, 54, 70, 60, 72, 65, 77],
  },
  yearly: {
    current: [420, 460, 510, 540, 560, 590],
    previous: [380, 430, 480, 510, 530, 560],
  },
} as const;

type ChartRange = keyof typeof VISITOR_SERIES;

type DashboardStats = {
  publishedCount: number;
  draftCount: number;
  totalLikes: number;
  totalComments: number;
};

const WELCOME_STATS_CONFIG: {
  label: string;
  href: string;
  getValue: (stats: DashboardStats, blogs: Blog[]) => number;
}[] = [
  { label: 'Posts', href: '/dashboard/blogs', getValue: (_, blogs) => blogs.length },
  { label: 'Comments', href: '/dashboard/blogs', getValue: (stats) => stats.totalComments },
  { label: 'Likes', href: '/dashboard/blogs', getValue: (stats) => stats.totalLikes },
];

const METRIC_CARDS_CONFIG: {
  icon: typeof Pencil;
  label: string;
  href: string;
  getValue: (stats: DashboardStats, blogs: Blog[]) => number;
}[] = [
  { icon: Pencil, label: 'Total Posts', href: '/dashboard/blogs', getValue: (_, blogs) => blogs.length },
  { icon: FileText, label: 'Published', href: '/dashboard/blogs', getValue: (stats) => stats.publishedCount },
  { icon: MessageCircle, label: 'Comments', href: '/dashboard/blogs', getValue: (stats) => stats.totalComments },
  { icon: Heart, label: 'Total Likes', href: '/dashboard/blogs', getValue: (stats) => stats.totalLikes },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const user = getUser();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState<ChartRange>('monthly');

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

  const stats = useMemo(() => {
    const publishedCount = blogs.filter((b) => b.isPublished).length;
    const draftCount = blogs.length - publishedCount;
    const totalLikes = blogs.reduce((sum, b) => sum + b._count.likes, 0);
    const totalComments = blogs.reduce((sum, b) => sum + b._count.comments, 0);
    return {
      publishedCount,
      draftCount,
      totalLikes,
      totalComments,
    };
  }, [blogs]);

  const recentBlogs = blogs.slice(0, 5);
  const visitorSeries = VISITOR_SERIES[chartRange];
  const totalVisitors = visitorSeries.current.reduce((sum, v) => sum + v, 0);
  const previousVisitors = visitorSeries.previous.reduce((sum, v) => sum + v, 0);
  const visitorsChange =
    previousVisitors === 0
      ? 0
      : ((totalVisitors - previousVisitors) / previousVisitors) * 100;

  return (
    <div className="min-h-full bg-[#fdf7ff]">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 pt-8 pb-6 sm:px-6 sm:pt-10 lg:px-8">
        {/* Minimal left sidebar */}
        <aside className="hidden h-[520px] w-14 shrink-0 flex-col justify-between rounded-3xl border border-[#e9d5ff]/70 bg-[#f5f3ff] py-5 shadow-sm md:flex">
          <div className="flex flex-col items-center gap-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#e9d5ff] text-xs font-semibold text-slate-900 shadow-sm">
              G
            </div>
            <nav className="flex flex-col items-center gap-3 text-[#a78bfa]">
              <SidebarIcon
                icon={LayoutDashboard}
                label="Dashboard"
                href="/dashboard"
                active={pathname === '/dashboard'}
              />
              <SidebarIcon
                icon={Pencil}
                label="Posts"
                href="/dashboard/blogs"
                active={pathname.startsWith('/dashboard/blogs')}
              />
              <SidebarIcon
                icon={MessageCircle}
                label="Engagement"
                href="/dashboard/blogs"
              />
              <SidebarIcon
                icon={FileText}
                label="Profile"
                href="/dashboard/profile"
                active={pathname === '/dashboard/profile'}
              />
            </nav>
          </div>
          <div className="flex flex-col items-center gap-3 text-[#a78bfa]">
            <SidebarIcon
              icon={LogOut}
              label="Logout"
              onClick={() => {
                clearAuth();
                router.replace('/feed');
                router.refresh();
              }}
            />
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          {/* Top bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-[#9ca3af]">Welcome back 👋</p>
              <h1 className="mt-1 text-xl font-semibold text-slate-900">
                {getGreeting()},{' '}
                <span className="font-semibold">
                  {user?.name || 'Writer'}
                </span>
              </h1>
            </div>
          </div>

          {/* Welcome & KPI cards */}
          <div className="grid gap-5 lg:grid-cols-[minmax(0,2.1fr),minmax(0,1.9fr)]">
            {/* Welcome card */}
            <Card className="relative overflow-hidden rounded-3xl border-none bg-[#e9d5ff] text-slate-900 shadow-md">
              <CardContent className="flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center">
                <div className="max-w-sm">
                  <p className="text-xs text-[#f5f3ff]">
                    {getGreeting()}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Welcome back!
                  </h2>
                  <p className="mt-2 text-sm text-[#a079fb]">
                    Manage your posts, track engagement, and keep an eye on how
                    your stories are performing today.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {WELCOME_STATS_CONFIG.map(({ label, href, getValue }) => (
                      <WelcomeStat
                        key={label}
                        label={label}
                        value={getValue(stats, blogs)}
                        href={href}
                      />
                    ))}
                  </div>
                </div>
                <div className="relative mt-2 flex h-32 w-full max-w-[160px] items-center justify-center rounded-3xl bg-[#fefce8] px-4 py-3 text-xs shadow-inner sm:mt-0">
                  <div className="relative z-10 flex flex-col items-center text-center text-[#4b5563]">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7c3aed] shadow-md">
                      <User className="h-6 w-6" />
                    </div>
                    <p className="text-[11px] uppercase tracking-wide text-[#6b21a8]/80">
                      {user?.name || 'Writer'}
                    </p>
                    <p className="mt-1 text-[10px] text-[#6b21a8]/70">
                      Content creator
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {METRIC_CARDS_CONFIG.map(({ icon, label, href, getValue }) => (
                <MetricCard
                  key={label}
                  icon={icon}
                  label={label}
                  value={getValue(stats, blogs)}
                  href={href}
                />
              ))}
            </div>
          </div>

          {/* Visitors & Recent Blogs */}
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr),minmax(0,1.3fr)]">
            {/* Visitors card */}
            <Card className="rounded-3xl border border-[#e9d5ff]/70 bg-[#fdf7ff] shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Visitors
                  </CardTitle>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Old vs new visitors
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <div>
                    <p className="text-[11px] text-slate-400">New visitors</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {Math.round(totalVisitors / 1000)}K
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                    <span>
                      {visitorsChange >= 0 ? '+' : ''}
                      {visitorsChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="mb-4 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-4 rounded-full bg-[#a5b4fc]" />
                      <span>This year</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-4 rounded-full bg-[#bbf7d0]" />
                      <span>Previous</span>
                    </div>
                  </div>
                  <div className="flex rounded-full bg-slate-100 p-0.5 text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => setChartRange('monthly')}
                      className={`rounded-full px-2.5 py-0.5 ${
                        chartRange === 'monthly'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartRange('yearly')}
                      className={`rounded-full px-2.5 py-0.5 ${
                        chartRange === 'yearly'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      Y
                    </button>
                  </div>
                </div>

                <div className="relative mt-1 h-40 w-full">
                  <VisitorsChart
                    current={visitorSeries.current}
                    previous={visitorSeries.previous}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent blogs */}
            <Card className="flex flex-col rounded-3xl border-none bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Recent blogs
                </CardTitle>
                <Link href="/dashboard/blogs/new">
                  <Button
                    size="sm"
                    className="h-8 rounded-full px-3 text-xs font-medium"
                  >
                    + Add New
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl bg-[#f5f3ff] px-3 py-3"
                      >
                        <div className="h-10 w-10 rounded-xl bg-[#e9d5ff]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-3/4 rounded bg-[#e9d5ff]" />
                          <div className="h-3 w-1/2 rounded bg-[#fdf2ff]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentBlogs.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">
                    No posts yet. Start writing your first story.
                  </p>
                ) : (
                  recentBlogs.map((blog) => (
                    <Link
                      key={blog.id}
                      href={`/dashboard/blogs/${blog.id}/edit`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#f5f3ff]"
                    >
                      <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-[#bfdbfe]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {blog.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {blog._count.comments} comments ·{' '}
                          {blog._count.likes} likes
                        </p>
                      </div>
                      <span className="text-xs font-medium text-indigo-600 hover:underline">
                        Edit
                      </span>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href: string;
}) {
  const content = (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md hover:border-[#c4b5fd]/50 cursor-pointer">
      <CardContent className="flex items-center justify-between gap-4 px-5 py-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ede9fe] text-[#7c3aed]">
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            {label}
          </p>
        </div>
        <p className="shrink-0 text-2xl font-bold tabular-nums text-slate-900">
          {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

function WelcomeStat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md hover:border-[#c4b5fd]/50 cursor-pointer">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums text-slate-900">
        {value.toLocaleString()}
      </p>
    </Link>
  );
}

function SidebarIcon({
  icon: Icon,
  active,
  href,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  href?: string;
  label: string;
  onClick?: () => void;
}) {
  const baseClasses =
    'flex h-9 w-9 items-center justify-center rounded-2xl text-[#a78bfa] transition-colors';
  const stateClasses = active
    ? 'bg-[#a5b4fc] text-[#4338ca] shadow-sm'
    : 'hover:bg-[#f5f3ff] hover:text-[#7c3aed]';

  const content = (
    <span className={`${baseClasses} ${stateClasses}`}>
      <Icon className="h-4 w-4" />
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`${baseClasses} ${stateClasses}`}
      onClick={onClick}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function VisitorsChart({
  current,
  previous,
}: {
  current: readonly number[];
  previous: readonly number[];
}) {
  const max = Math.max(...current, ...previous, 1);

  return (
    <div className="flex h-40 items-end gap-2 rounded-2xl bg-[#f5f3ff]/80 px-3 pb-4 pt-3">
      {current.map((value, index) => {
        const previousValue = previous[index] ?? 0;
        const currentHeight = (value / max) * 100;
        const previousHeight = (previousValue / max) * 100;

        return (
          <div key={index} className="flex-1 space-y-1">
            <div className="flex h-28 items-end gap-1 rounded-full bg-white/80 px-1.5 pb-1.5 pt-1 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
              <div
                className="w-1.5 flex-1 rounded-full bg-[#9cadff]"
                style={{ height: `${currentHeight}%` }}
              />
              <div
                className="w-1.5 flex-1 rounded-full bg-[#a1f6bf]"
                style={{ height: `${previousHeight}%` }}
              />
            </div>
            <div className="mx-auto h-1 w-4 rounded-full bg-slate-200/70" />
          </div>
        );
      })}
    </div>
  );
}
