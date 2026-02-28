'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken, isAuthenticated } from '@/lib/auth';
import type { LikeResponse } from '@/lib/types';

interface LikeButtonProps {
  blogId: string;
  initialLiked: boolean;
  initialCount: number;
  onUpdate?: (liked: boolean, count: number) => void;
}

export function LikeButton({
  blogId,
  initialLiked,
  initialCount,
  onUpdate,
}: LikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const handleToggle = useCallback(async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (pending) return;

    const prevLiked = liked;
    const prevCount = count;
    const newLiked = !liked;
    const newCount = newLiked ? count + 1 : count - 1;

    setLiked(newLiked);
    setCount(newCount);
    setPending(true);

    try {
      const token = getToken()!;
      const data = await api.post<LikeResponse>(
        `/blogs/${blogId}/likes/toggle`,
        undefined,
        { token },
      );
      setLiked(data.liked);
      setCount(data.count);
      onUpdate?.(data.liked, data.count);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setPending(false);
    }
  }, [blogId, liked, count, pending, router, onUpdate]);

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={`flex items-center gap-2 transition-colors cursor-pointer ${
        liked
          ? 'text-[var(--color-accent)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]'
      }`}
    >
      <svg
        className="w-5 h-5 transition-transform active:scale-125"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="font-medium">{count}</span>
    </button>
  );
}
