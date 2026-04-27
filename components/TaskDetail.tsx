'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { StatusBadge } from './StatusBadge';
import { ShareButton } from './ShareButton';
import type { StoredTask } from '@/lib/types';

function isActiveStatus(status: string) {
  return status === 'submitted' || status === 'pending' || status === 'processing';
}

function getDisplayUrl(task: StoredTask): string {
  if (task.persistent_url) return task.persistent_url;
  if (task.image_url && !isExpired(task)) return task.image_url;
  return '';
}

function isExpired(task: StoredTask): boolean {
  return task.expires_at > 0 && task.expires_at * 1000 < Date.now() && !task.persistent_url;
}

interface TaskDetailProps {
  taskId: string;
}

export function TaskDetail({ taskId }: TaskDetailProps) {
  const router = useRouter();
  const [task, setTask] = useState<StoredTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
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
          setTagInput(data.tags || '');
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

  useEffect(() => {
    if (task && !isActiveStatus(task.status) && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [task?.status]);

  const handleDelete = async () => {
    if (!confirm('确定删除此任务？')) return;
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    router.push('/history');
  };

  const handleDownload = async () => {
    if (!task) return;
    const url = getDisplayUrl(task);
    if (!url) return;

    setDownloading(true);
    try {
      const filename = `gpt-image-${task.task_id}.png`;
      const res = await fetch(`/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error('下载失败');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      alert('下载失败，请稍后重试');
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleFavorite = async () => {
    const res = await fetch(`/api/tasks/${taskId}/favorite`, { method: 'PATCH' });
    if (res.ok) {
      const data = await res.json();
      setTask(prev => prev ? { ...prev, is_favorited: data.is_favorited } : prev);
    }
  };

  const handleSaveTags = async () => {
    await fetch(`/api/tasks/${taskId}/tags`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: tagInput }),
    });
    setTask(prev => prev ? { ...prev, tags: tagInput } : prev);
    setShowTagInput(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-[var(--text-tertiary)] text-sm animate-pulse">加载中...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-4">
        <button onClick={() => router.push('/history')} className="text-sm text-blue-600 font-medium">
          &larr; 返回
        </button>
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
          {error || '任务不存在'}
        </div>
      </div>
    );
  }

  const status = task.status || 'pending';
  const imageUrl = getDisplayUrl(task);
  const expired = isExpired(task);
  const expiresAt = task.expires_at;
  const actualTime = task.actual_time;
  const tags = task.tags ? task.tags.split(',').filter(Boolean) : [];

  const expiresIn = expiresAt
    ? Math.max(0, Math.floor((expiresAt * 1000 - Date.now()) / 3600000))
    : null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/history')} className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          &larr; 返回
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handleToggleFavorite} className="text-lg" title={task.is_favorited ? '取消收藏' : '收藏'}>
            {task.is_favorited ? '⭐' : '☆'}
          </button>
          <button onClick={handleDelete} className="text-sm text-red-500">
            删除
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:gap-6">
        <div className="md:flex-1 md:min-w-0">
          {imageUrl ? (
            <div className="relative rounded-xl overflow-hidden bg-[var(--hover)]">
              <Image src={imageUrl} className="w-full object-contain md:max-h-[600px]" alt="Generated" width={1024} height={1024} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          ) : (
            <div className="h-64 md:h-96 rounded-xl bg-[var(--hover)] flex flex-col items-center justify-center text-[var(--text-tertiary)] gap-2">
              {isActiveStatus(status) && <span className="text-sm animate-pulse">生成中...</span>}
              {status === 'failed' && <span className="text-sm">{task.error_message || '生成失败'}</span>}
              {expired && <span className="text-sm">图片已过期</span>}
            </div>
          )}
        </div>

        <div className="mt-4 md:mt-0 md:w-72 md:flex-shrink-0 space-y-3">
          {imageUrl && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {downloading ? '下载中...' : '下载图片'}
            </button>
          )}

          {status === 'completed' && (
            <ShareButton taskId={task.task_id} imageUrl={imageUrl} />
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">状态</span>
              <StatusBadge status={status} />
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">比例</span>
              <span>{task.size}</span>
            </div>
            {actualTime > 0 && (
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">耗时</span>
                <span>{actualTime}s</span>
              </div>
            )}
            {expiresIn != null && expiresAt > 0 && !task.persistent_url && (
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">链接过期</span>
                <span className={expiresIn <= 2 ? 'text-red-500' : ''}>
                  {expiresIn > 0 ? `${expiresIn} 小时后` : '已过期'}
                </span>
              </div>
            )}
            {task.persistent_url && (
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">存储</span>
                <span className="text-green-600 dark:text-green-400">已持久化</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">创建时间</span>
              <span>{new Date(task.created_at).toLocaleString('zh-CN')}</span>
            </div>
          </div>

          {/* 标签 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">标签</span>
              <button
                onClick={() => setShowTagInput(!showTagInput)}
                className="text-xs text-blue-600 dark:text-blue-400"
              >
                {showTagInput ? '取消' : '编辑'}
              </button>
            </div>
            {showTagInput ? (
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="逗号分隔，如：风景,水彩"
                  className="flex-1 px-2 py-1.5 text-xs border border-[var(--input-border)] bg-[var(--input-bg)] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button onClick={handleSaveTags} className="px-2 py-1.5 text-xs bg-blue-600 text-white rounded-lg">
                  保存
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {tags.length > 0 ? tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-[var(--hover)] text-[var(--text-secondary)]">
                    {tag.trim()}
                  </span>
                )) : (
                  <span className="text-xs text-[var(--text-tertiary)]">无标签</span>
                )}
              </div>
            )}
          </div>

          <div className="p-3 bg-[var(--hover)] rounded-lg">
            <p className="text-xs text-[var(--text-secondary)] mb-1">Prompt</p>
            <p className="text-sm">{task.prompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
