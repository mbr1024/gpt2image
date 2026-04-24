import type { StoredTask, TaskData } from './types';

const tasks = new Map<string, StoredTask>();

export function getAllTasks(): StoredTask[] {
  return [...tasks.values()].sort((a, b) => b.created_at - a.created_at);
}

export function getTask(taskId: string): StoredTask | undefined {
  return tasks.get(taskId);
}

export function createTask(task: Pick<StoredTask, 'task_id' | 'prompt' | 'size' | 'has_ref_images'>): void {
  tasks.set(task.task_id, {
    task_id: task.task_id,
    prompt: task.prompt,
    size: task.size,
    has_ref_images: task.has_ref_images,
    created_at: Date.now(),
    status: 'submitted',
    progress: 0,
    image_url: '',
    expires_at: 0,
    actual_time: 0,
    estimated_time: 0,
    error_message: '',
    completed_at: 0,
  });
}

export function updateTaskFromApi(taskId: string, data: TaskData): void {
  const task = tasks.get(taskId);
  if (!task) return;

  task.status = data.status;
  task.progress = data.progress ?? 0;
  task.image_url = data.result?.images?.[0]?.url?.[0] ?? '';
  task.expires_at = data.result?.images?.[0]?.expires_at ?? 0;
  task.actual_time = data.actual_time ?? 0;
  task.estimated_time = data.estimated_time ?? 0;
  task.error_message = data.error?.message ?? '';
  task.completed_at = data.completed ?? 0;
}

export function deleteTask(taskId: string): void {
  tasks.delete(taskId);
}

export function deleteAllTasks(): void {
  tasks.clear();
}

export function getActiveTasks(): StoredTask[] {
  return [...tasks.values()]
    .filter(t => t.status === 'submitted' || t.status === 'pending' || t.status === 'processing')
    .sort((a, b) => b.created_at - a.created_at);
}
