import Link from 'next/link';
import Image from 'next/image';
import { StatusBadge } from './StatusBadge';
import type { StoredTask } from '@/lib/types';

interface TaskCardProps {
  task: StoredTask;
}

export function TaskCard({ task }: TaskCardProps) {
  const status = task.status || 'pending';
  const imageUrl = task.image_url;
  const createdAt = new Date(task.created_at).toLocaleString('zh-CN');

  return (
    <Link
      href={`/history/${task.task_id}`}
      className="bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors flex gap-3 p-3 md:flex-col md:p-0 md:gap-0 md:overflow-hidden"
    >
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 md:w-full md:h-48 md:rounded-none md:rounded-t-xl">
        {imageUrl ? (
          <Image src={imageUrl} className="w-full h-full object-cover" alt="" fill sizes="(max-width: 768px) 64px, 100vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
            {status === 'failed' ? '!' : '...'}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 md:p-3">
        <p className="text-sm text-gray-900 truncate">{task.prompt}</p>
        <div className="mt-1 flex items-center gap-2">
          <StatusBadge status={status} />
          <span className="text-xs text-gray-400">{task.size}</span>
        </div>
        <p className="mt-1 text-xs text-gray-400">{createdAt}</p>
      </div>
    </Link>
  );
}
