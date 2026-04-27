'use client';

import Link from 'next/link';
import Image from 'next/image';
import { StatusBadge } from './StatusBadge';
import type { StoredTask } from '@/lib/types';

interface TaskCardProps {
  task: StoredTask;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (taskId: string) => void;
  onToggleFavorite?: (taskId: string) => void;
}

function getDisplayUrl(task: StoredTask): string {
  if (task.persistent_url) return task.persistent_url;
  if (task.image_url && !isExpired(task)) return task.image_url;
  return '';
}

function isExpired(task: StoredTask): boolean {
  return task.expires_at > 0 && task.expires_at * 1000 < Date.now() && !task.persistent_url;
}

export function TaskCard({ task, selectable, selected, onSelect, onToggleFavorite }: TaskCardProps) {
  const status = task.status || 'pending';
  const imageUrl = getDisplayUrl(task);
  const expired = isExpired(task);
  const createdAt = new Date(task.created_at).toLocaleString('zh-CN');

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(task.task_id);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(task.task_id);
  };

  return (
    <Link
      href={`/history/${task.task_id}`}
      className={`bg-[var(--card)] rounded-xl border cursor-pointer transition-colors flex gap-3 p-3 md:flex-col md:p-0 md:gap-0 md:overflow-hidden ${
        selected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[var(--border)] hover:border-[var(--text-tertiary)]'
      }`}
    >
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--hover)] md:w-full md:h-48 md:rounded-none md:rounded-t-xl">
        {imageUrl ? (
          <Image src={imageUrl} className="w-full h-full object-cover" alt="" fill sizes="(max-width: 768px) 64px, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-2xl">
            {expired ? '⏰' : status === 'failed' ? '!' : '...'}
          </div>
        )}

        {selectable && (
          <button
            onClick={handleSelect}
            className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${
              selected
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white/80 border-gray-300 text-transparent hover:border-blue-400'
            }`}
          >
            ✓
          </button>
        )}

        {onToggleFavorite && (
          <button
            onClick={handleFavorite}
            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/30 flex items-center justify-center text-sm transition-colors hover:bg-black/50"
          >
            {task.is_favorited ? '⭐' : '☆'}
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0 md:p-3">
        <p className="text-sm truncate">{task.prompt}</p>
        <div className="mt-1 flex items-center gap-2">
          <StatusBadge status={status} />
          <span className="text-xs text-[var(--text-tertiary)]">{task.size}</span>
          {expired && <span className="text-xs text-red-500">已过期</span>}
        </div>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">{createdAt}</p>
      </div>
    </Link>
  );
}
