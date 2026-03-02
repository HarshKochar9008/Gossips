'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import type { FeedResponse, Blog } from '@/lib/types';
import {
  Card,
  CardContent,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  'Medical Knowledge',
  'Bodybuilding',
  'Life Style',
  'Diet',
  'Health Food',
  'Sickness',
  'Diseases',
];

const AD_LINKS = [
  'How to work out in a limited space',
  'How to read golf green gran like a pro',
];

const FEATURED_IMAGE = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80';
const GYM_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80';

function ArrowButton({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:opacity-90 hover:scale-110 ${
        dark ? 'bg-[var(--color-accent-green-dark)] text-white' : 'bg-[var(--color-accent-green)] text-[var(--color-text)]'
      } ${className}`}
      aria-hidden
    >
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7m0 0H7m10 0v10" />
      </svg>
    </span>
  );
}

export default function HomePage() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchFeed = async () => {
      try {
        const data = await api.get<FeedResponse>('/public/feed?page=1&limit=5');
        if (!cancelled) setFeed(data);
      } catch (_err) {
        if (!cancelled) setFeed({ blogs: [], pagination: { page: 1, limit: 5, total: 0, totalPages: 0, hasNext: false, hasPrev: false } });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFeed();
    return () => { cancelled = true; };
  }, []);

  const featured: Blog | null = feed?.blogs?.[0] ?? null;
  const second: Blog | null = feed?.blogs?.[1] ?? null;
  const featuredDate = featured?.publishedAt ? format(new Date(featured.publishedAt), 'MMM dd, yyyy') : 'Jan 06, 2024';
  const featuredTitle = featured?.title ?? 'Get to your dream now destinations with TravelPro';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-10">
        {/* Hero: Best blog of the week + See all post */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] italic">
            Best blog of the week ...
          </h1>
          <Link
            href="/feed"
            className="shrink-0 px-4 py-2.5 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text)] font-medium text-sm hover:bg-[var(--color-border)]/60 transition-all duration-200 inline-flex items-center gap-1.5"
          >
            See all post
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Rectangle block: quick access to dashboard */}
        <Card className="mb-8 border-dashed border-slate-200 bg-slate-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
            <div>
              <CardTitle className="text-sm sm:text-base">
                Manage your blogs from the dashboard
              </CardTitle>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Create, edit and track performance of all your posts in one place.
              </p>
            </div>
            <Link href="/dashboard">
              <Button
                size="sm"
                className="shrink-0"
              >
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Grid: left = featured card (tall), right = ads + gym + categories */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: large featured blog card with frame */}
          <div className="lg:col-span-7">
            <Link
              href={featured ? `/blog/${featured.slug}` : '/feed'}
              className="block group"
            >
              <article className="relative aspect-[4/3] lg:aspect-[3/4] rounded-2xl overflow-hidden border-[3px] border-[var(--color-frame)] bg-[var(--color-text-secondary)]/10 transition-transform duration-300 group-hover:shadow-xl">
                <img
                  src={FEATURED_IMAGE}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {/* Top right: date · Travel */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className="px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-medium">
                    {featuredDate}
                  </span>
                  <span className="text-white/80">·</span>
                  <span className="px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-medium">
                    Travel
                  </span>
                </div>
                {/* Bottom left: · Travel + title */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-white/90 text-xs font-medium">· Travel</span>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mt-1 line-clamp-2">
                    {featuredTitle}
                  </h2>
                </div>
                {/* Light green circular button bottom-right */}
                <div className="absolute bottom-4 right-4 group-hover:scale-105 transition-transform">
                  <ArrowButton />
                </div>
              </article>
            </Link>
          </div>

          {/* Right column: ADS card + Gym card + Categories card */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* ADS card - light green with subtle circle pattern */}
            <article className="relative rounded-2xl overflow-hidden bg-[var(--color-accent-green)] p-6 min-h-[240px] flex flex-col">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" aria-hidden />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/15 -translate-x-1/2 translate-y-1/2" aria-hidden />
              <div className="relative flex justify-between items-start gap-4">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-accent-green)] border border-[var(--color-accent-green-dark)]/30 text-[var(--color-accent-green-dark)] text-xs font-medium">
                    <span className="w-1 h-1 rounded-full bg-[var(--color-accent-green-dark)]" /> ADS
                  </span>
                  <p className="text-sm text-[var(--color-accent-green-dark)] mt-2">Become A Broadcast Member</p>
                  <h3 className="text-xl md:text-2xl font-bold text-[var(--color-accent-green-dark)] mt-2">
                    Real talk in a corporate world
                  </h3>
                </div>
                <div className="shrink-0">
                  <ArrowButton dark />
                </div>
              </div>
              <ul className="relative mt-6 space-y-3">
                {AD_LINKS.map((label, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="flex items-center gap-2 text-sm font-medium text-[var(--color-accent-green-dark)] hover:underline transition-opacity"
                    >
                      {label}

                    </a>
                  </li>
                ))}
              </ul>
            </article>

            {/* Bottom row: Gym card + Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gym blog card */}
              <Link
                href={second ? `/blog/${second.slug}` : '/feed'}
                className="block group"
              >
                <article className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--color-text)]">
                  <img
                    src={GYM_IMAGE}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-frame)]/90 text-white text-xs font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-white" /> Gym
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/90 text-xs">5 mins, 22 Jan 2026</p>
                    <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-2">
                      Athletic Training i soft and hard styles of training
                    </h3>
                  </div>
                </article>
              </Link>

              {/* Categories card - light purple, tags, View All */}
              <article className="rounded-2xl overflow-hidden bg-[var(--color-accent-purple)] p-5 flex flex-col">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((name) => (
                    <Link
                      key={name}
                      href="/feed"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        name === 'Bodybuilding'
                          ? 'bg-[var(--color-accent-purple-dark)] text-white'
                          : 'bg-white/70 text-[var(--color-text)] hover:bg-white/90'
                      }`}
                    >
                      {name}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/feed"
                  className="mt-4 text-sm font-medium text-[var(--color-text)] hover:underline inline-flex items-center gap-1"
                >
                  View All Categories
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
