'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TaskCard } from './TaskCard';
import type { StoredTask } from '@/lib/types';

export function HistoryList() {
  const router = useRouter();
  const [tasks, setTasks] = useState<StoredTask[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks');
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 轮询未完成的任务
  useEffect(() => {
    const hasActive = tasks.some(t =>
      t.status === 'submitted' || t.status === 'pending' || t.status === 'processing'
    );
    if (!hasActive) return;

    const interval = setInterval(async () => {
      if (document.visibilityState === 'hidden') return;
      const res = await fetch('/api/tasks/poll', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.tasks) setTasks(data.tasks);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [tasks]);

  const handleClearAll = async () => {
    if (!confirm('确定清空所有历史记录？')) return;
    await fetch('/api/tasks/clear', { method: 'DELETE' });
    setTasks([]);
  };

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400 text-sm animate-pulse">加载中...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400 text-sm">暂无任务，去创建一个吧</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">历史记录</h2>
        <button onClick={handleClearAll} className="text-xs text-red-500">
          清空
        </button>
      </div>
      <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tasks.map(task => (
          <TaskCard key={task.task_id} task={task} />
        ))}
      </div>
    </div>
  );
}
