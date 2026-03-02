'use client';

export const AVATAR_IMAGES: string[] = [
  '/Avatar/Avatar 1.png',
  '/Avatar/Avatar 2.png',
  '/Avatar/Avatar 3.png',
  '/Avatar/Avatar 4.png',
  '/Avatar/Avatar 5.png',
  '/Avatar/Avatar 6.png',
  '/Avatar/Avatar 7.png',
];

export const FALLBACK_AVATAR = '/default-avatar.svg';

export function getAvatarStorageKey(name?: string | null) {
  return `zodex-avatar-${name || 'user'}`;
}

export function getAvatarIndexForUser(name?: string | null): number | null {
  if (typeof window === 'undefined' || AVATAR_IMAGES.length === 0) return null;

  const key = getAvatarStorageKey(name);
  const storedIndex = window.localStorage.getItem(key);
  const max = AVATAR_IMAGES.length;

  let index: number;
  if (storedIndex !== null && !Number.isNaN(Number(storedIndex))) {
    index = Number(storedIndex);
  } else {
    index = Math.floor(Math.random() * max);
    window.localStorage.setItem(key, String(index));
  }

  return index % max;
}

export function getAvatarUrlForUser(name?: string | null): string {
  const index = getAvatarIndexForUser(name);
  if (index === null) return FALLBACK_AVATAR;
  return AVATAR_IMAGES[index] || FALLBACK_AVATAR;
}

export function setAvatarIndexForUser(name: string | null | undefined, index: number) {
  if (typeof window === 'undefined' || AVATAR_IMAGES.length === 0) return;
  const safeIndex = Math.abs(index) % AVATAR_IMAGES.length;
  const key = getAvatarStorageKey(name);
  window.localStorage.setItem(key, String(safeIndex));
  window.dispatchEvent(new CustomEvent('zodex-avatar-updated'));
}

