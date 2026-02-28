import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '@/lib/types';

export function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="border border-[var(--color-border)] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <img
          src="/default-avatar.svg"
          alt={comment.author?.name || 'User'}
          className="w-7 h-7 rounded-full shrink-0"
        />
        <span className="text-sm font-medium">{comment.author?.name || comment.author?.email}</span>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
          })}
        </span>
      </div>
      <p className="text-sm leading-relaxed">{comment.content}</p>
    </div>
  );
}
