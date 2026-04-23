import { useEffect, useRef } from 'react';
import { queryTask } from '../services/api';
import { isActiveStatus } from '../utils/status';
import type { StoredTask, TaskData } from '../types/api';

const POLL_INTERVAL = 10000;
const INITIAL_DELAY = 15000;

export function useTaskPoller(
  apiKey: string,
  tasks: StoredTask[],
  updateTask: (taskId: string, apiData: TaskData) => void,
) {
  const tasksRef = useRef(tasks);
  const updateTaskRef = useRef(updateTask);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  tasksRef.current = tasks;
  updateTaskRef.current = updateTask;

  useEffect(() => {
    if (!apiKey) return;

    const poll = async () => {
      if (document.visibilityState === 'hidden') return;

      const now = Date.now();
      const activeTasks = tasksRef.current.filter(t => {
        if (!isActiveStatus(t.api_data?.status)) return false;
        return now - t.created_at >= INITIAL_DELAY;
      });

      if (activeTasks.length === 0) return;

      for (const task of activeTasks) {
        try {
          const res = await queryTask(apiKey, task.task_id);
          if (res.data) {
            updateTaskRef.current(task.task_id, res.data);
          }
        } catch {
          // skip this task
        }
      }
    };

    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    const timer = setTimeout(poll, INITIAL_DELAY);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(timer);
    };
  }, [apiKey]);
}
