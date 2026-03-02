'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isAuthenticated, getUser, type User } from '@/lib/auth';
import { AVATAR_IMAGES, FALLBACK_AVATAR, getAvatarStorageKey, setAvatarIndexForUser } from '@/lib/avatars';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const u = getUser();
    setUser(u);

    if (typeof window !== 'undefined' && u) {
      const key = getAvatarStorageKey(u.name);
      const stored = window.localStorage.getItem(key);
      const max = AVATAR_IMAGES.length;

      if (max > 0) {
        let index: number;
        if (stored !== null && !Number.isNaN(Number(stored))) {
          index = Number(stored);
        } else {
          index = 0;
          window.localStorage.setItem(key, String(index));
        }
        setSelectedIndex(index % max);
      } else {
        setSelectedIndex(null);
      }
    }

    setLoading(false);
  }, [router]);

  const handleSelectAvatar = (index: number) => {
    if (!user) return;
    setAvatarIndexForUser(user.name, index);
    setSelectedIndex(index);
  };

  const currentAvatar =
    selectedIndex !== null && AVATAR_IMAGES.length > 0
      ? AVATAR_IMAGES[Math.abs(selectedIndex) % AVATAR_IMAGES.length]
      : FALLBACK_AVATAR;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--color-primary)] bg-[var(--color-bg-secondary)] flex items-center justify-center">
          <Image
            src={currentAvatar}
            alt={`${user.name}'s avatar`}
            width={80}
            height={80}
            className="w-20 h-20 object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            Update your avatar. (More profile settings coming soon.)
          </p>
        </div>
      </div>

      <div className="card animate-slide-up">
        <h2 className="text-sm font-semibold mb-3 text-[var(--color-text-secondary)]">Account</h2>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Name</span>
            <span className="font-medium text-[var(--color-text)]">{user.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Email</span>
            <span className="font-medium text-[var(--color-text)]">{user.email}</span>
          </div>
        </div>
      </div>

      <div className="card mt-6 animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">Choose your avatar</h2>
          <span className="text-xs text-[var(--color-text-secondary)]">
            Click an avatar to update
          </span>
        </div>

        {AVATAR_IMAGES.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">
            No avatars available yet. Add images to <code>/public/Avatar</code>.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {AVATAR_IMAGES.map((src, index) => {
              const isActive = index === selectedIndex;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => handleSelectAvatar(index)}
                  className={`ma rounded-full p-[3px] transition-all animate-slide-in-right  ${
                    isActive
                      ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-white'
                      : 'hover:ring-2 hover:ring-[var(--color-border)] hover:ring-offset-2 hover:ring-offset-white'
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-full overflow-hidden border bg-[var(--color-bg-secondary)] flex items-center justify-center ${
                      isActive
                        ? 'border-[var(--color-primary)]'
                        : 'border-[var(--color-border)] group-hover:border-[var(--color-primary)]/40'
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`Avatar option ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

