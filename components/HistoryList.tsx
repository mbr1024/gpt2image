'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { TaskCard } from './TaskCard';
import { Pagination } from './Pagination';
import { SearchBar } from './SearchBar';
import type { StoredTask } from '@/lib/types';

export function HistoryList() {
  const [tasks, setTasks] = useState<StoredTask[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // 批量选择
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchTasks = useCallback(async (p: number, q: string, s: string, f: boolean) => {
    const params = new URLSearchParams({ page: String(p), pageSize: '20' });
    if (q) params.set('q', q);
    if (s) params.set('status', s);
    if (f) params.set('favorited', 'true');

    const res = await fetch(`/api/tasks?${params}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data.data);
      setTotal(data.total);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchTasks(page, query, status, favorited);
  }, [page, status, favorited, fetchTasks]);

  // 搜索防抖
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchTasks(1, query, status, favorited);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // 有活跃任务时定时刷新数据（后端已在轮询 Apimart，前端只读 DB）
  useEffect(() => {
    const hasActive = tasks.some(t =>
      t.status === 'submitted' || t.status === 'pending' || t.status === 'processing',
    );
    if (!hasActive) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      fetchTasks(page, query, status, favorited);
    }, 5000);

    return () => clearInterval(interval);
  }, [tasks, page, query, status, favorited, fetchTasks]);

  const handleToggleFavorite = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}/favorite`, { method: 'PATCH' });
    setTasks(prev => prev.map(t =>
      t.task_id === taskId ? { ...t, is_favorited: !t.is_favorited } : t,
    ));
  };

  const handleSelect = (taskId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const handleBatchAction = async (action: 'delete' | 'favorite' | 'unfavorite') => {
    const ids = [...selected];
    if (ids.length === 0) return;

    if (action === 'delete' && !confirm(`确定删除 ${ids.length} 个任务？`)) return;

    await fetch('/api/tasks/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, task_ids: ids }),
    });

    setSelected(new Set());
    setSelectMode(false);
    fetchTasks(page, query, status, favorited);
  };

  const handleClearAll = async () => {
    if (!confirm('确定清空所有历史记录？')) return;
    await fetch('/api/tasks/clear', { method: 'DELETE' });
    setTasks([]);
    setTotal(0);
  };

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-[var(--text-tertiary)] text-sm animate-pulse">加载中...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">历史记录</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelectMode(!selectMode); setSelected(new Set()); }}
            className="text-xs text-[var(--text-secondary)]"
          >
            {selectMode ? '取消' : '选择'}
          </button>
          <button onClick={handleClearAll} className="text-xs text-red-500">
            清空
          </button>
        </div>
      </div>

      <SearchBar
        query={query}
        status={status}
        favorited={favorited}
        onQueryChange={setQuery}
        onStatusChange={s => { setStatus(s); setPage(1); }}
        onFavoritedChange={f => { setFavorited(f); setPage(1); }}
      />

      {tasks.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-[var(--text-tertiary)] text-sm">
            {query || status || favorited ? '没有匹配的任务' : '暂无任务，去创建一个吧'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tasks.map(task => (
              <TaskCard
                key={task.task_id}
                task={task}
                selectable={selectMode}
                selected={selected.has(task.task_id)}
                onSelect={selectMode ? handleSelect : undefined}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>

          <Pagination page={page} total={total} pageSize={20} onChange={setPage} />
        </>
      )}

      {/* 批量操作栏 */}
      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg p-3 flex items-center justify-between z-50">
          <span className="text-sm">已选 {selected.size} 项</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBatchAction('favorite')}
              className="px-3 py-1.5 text-xs rounded-lg bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            >
              收藏
            </button>
            <button
              onClick={() => handleBatchAction('delete')}
              className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            >
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
