'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { StatusBadge } from './StatusBadge';
import type { StoredTask } from '@/lib/types';

function isActiveStatus(status: string) {
  return status === 'submitted' || status === 'pending' || status === 'processing';
}

async function downloadImage(url: string, filename: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

interface TaskDetailProps {
  taskId: string;
}

export function TaskDetail({ taskId }: TaskDetailProps) {
  const router = useRouter();
  const [task, setTask] = useState<StoredTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let stopped = false;

    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/tasks/${taskId}`);
        if (!res.ok) {
          setError('任务不存在');
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!stopped) {
          setTask(data);
          setLoading(false);
          if (!isActiveStatus(data.status) && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        if (!stopped) {
          setError(err instanceof Error ? err.message : '查询失败');
          setLoading(false);
        }
      }
    };

    fetchTask();
    intervalRef.current = setInterval(fetchTask, 5000);

    return () => {
      stopped = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [taskId]);

  // 状态完成后停止轮询
  useEffect(() => {
    if (task && !isActiveStatus(task.status) && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [task?.status]);

  const handleDelete = async () => {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    router.push('/history');
  };

  const handleDownload = () => {
    if (task?.image_url) {
      downloadImage(task.image_url, `gpt-image-${task.task_id}.png`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400 text-sm animate-pulse">加载中...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-4">
        <button onClick={() => router.push('/history')} className="text-sm text-blue-600 font-medium">
          &larr; 返回
        </button>
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error || '任务不存在'}</div>
      </div>
    );
  }

  const status = task.status || 'pending';
  const imageUrl = task.image_url;
  const expiresAt = task.expires_at;
  const actualTime = task.actual_time;

  const expiresIn = expiresAt
    ? Math.max(0, Math.floor((expiresAt * 1000 - Date.now()) / 3600000))
    : null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/history')} className="text-sm text-blue-600 font-medium">
          &larr; 返回
        </button>
        <button onClick={handleDelete} className="text-sm text-red-500">
          删除
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:gap-6">
        <div className="md:flex-1 md:min-w-0">
          {imageUrl ? (
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
              <Image src={imageUrl} className="w-full object-contain md:max-h-[600px]" alt="Generated" width={1024} height={1024} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          ) : (
            <div className="h-64 md:h-96 rounded-xl bg-gray-100 flex flex-col items-center justify-center text-gray-400 gap-2">
              {isActiveStatus(status) && <span className="text-sm animate-pulse">生成中...</span>}
              {status === 'failed' && (task.error_message || '生成失败')}
            </div>
          )}
        </div>

        <div className="mt-4 md:mt-0 md:w-72 md:flex-shrink-0 space-y-4">
          {imageUrl && (
            <button
              onClick={handleDownload}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              下载图片
            </button>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">状态</span>
              <StatusBadge status={status} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">比例</span>
              <span className="text-gray-900">{task.size}</span>
            </div>
            {actualTime > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">耗时</span>
                <span className="text-gray-900">{actualTime}s</span>
              </div>
            )}
            {expiresIn != null && expiresAt > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">链接过期</span>
                <span className={`${expiresIn <= 2 ? 'text-red-500' : 'text-gray-900'}`}>
                  {expiresIn > 0 ? `${expiresIn} 小时后` : '已过期'}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">创建时间</span>
              <span className="text-gray-900">{new Date(task.created_at).toLocaleString('zh-CN')}</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Prompt</p>
            <p className="text-sm text-gray-800">{task.prompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
