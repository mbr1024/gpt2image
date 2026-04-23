import { useState, useCallback, useEffect } from 'react';
import { getItem, setItem } from '../utils/storage';
import * as pbService from '../services/pb';
import type { StoredTask, TaskData } from '../types/api';

const CACHE_KEY = 'gpt-image-tasks';

export function useTaskStore() {
  const [tasks, setTasks] = useState<StoredTask[]>(() => getItem<StoredTask[]>(CACHE_KEY, []));
  const [loaded, setLoaded] = useState(false);

  // 启动时从 PocketBase 加载
  useEffect(() => {
    pbService.fetchAllTasks()
      .then(remote => {
        setTasks(remote);
        setItem(CACHE_KEY, remote);
        setLoaded(true);
      })
      .catch(() => {
        // PB 不可用，用 localStorage 缓存
        setLoaded(true);
      });
  }, []);

  const syncCache = (next: StoredTask[]) => {
    setTasks(next);
    setItem(CACHE_KEY, next);
  };

  const addTask = useCallback((task: StoredTask) => {
    setTasks(prev => {
      const next = [task, ...prev];
      setItem(CACHE_KEY, next);
      return next;
    });
    pbService.createTask(task).catch(() => {});
  }, []);

  const updateTask = useCallback((taskId: string, apiData: TaskData) => {
    setTasks(prev => {
      const next = prev.map(t => (t.task_id === taskId ? { ...t, api_data: apiData } : t));
      setItem(CACHE_KEY, next);
      return next;
    });
    pbService.updateTaskRecord(taskId, apiData).catch(() => {});
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => {
      const next = prev.filter(t => t.task_id !== taskId);
      setItem(CACHE_KEY, next);
      return next;
    });
    pbService.deleteTask(taskId).catch(() => {});
  }, []);

  const clearAll = useCallback(() => {
    syncCache([]);
    pbService.deleteAllTasks().catch(() => {});
  }, []);

  return { tasks, addTask, updateTask, removeTask, clearAll, loaded };
}
