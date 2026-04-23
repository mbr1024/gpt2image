import PocketBase from 'pocketbase';
import type { StoredTask, TaskData } from '../types/api';

const PB_URL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

// 连接状态：首次失败后禁用，避免持续发 400 请求
let disabled = false;

interface TaskRecord {
  id: string;
  task_id: string;
  prompt: string;
  size: string;
  has_ref_images: boolean;
  status: string;
  image_url: string;
  progress: number;
  actual_time: number;
  estimated_time: number;
  expires_at: number;
  error_message: string;
  completed_at: number;
  created: string;
  updated: string;
}

function recordToStoredTask(r: TaskRecord): StoredTask {
  const task: StoredTask = {
    task_id: r.task_id,
    prompt: r.prompt,
    size: r.size,
    has_ref_images: r.has_ref_images,
    created_at: new Date(r.created).getTime(),
  };

  if (r.status) {
    task.api_data = {
      id: r.task_id,
      status: r.status as TaskData['status'],
      progress: r.progress || 0,
      created: Math.floor(new Date(r.created).getTime() / 1000),
      ...(r.completed_at ? { completed: r.completed_at } : {}),
      ...(r.actual_time ? { actual_time: r.actual_time } : {}),
      ...(r.estimated_time ? { estimated_time: r.estimated_time } : {}),
      ...(r.image_url
        ? {
            result: {
              images: [{ url: [r.image_url], expires_at: r.expires_at || 0 }],
            },
          }
        : {}),
      ...(r.error_message ? { error: { message: r.error_message } } : {}),
    };
  }

  return task;
}

function storedTaskToRecord(task: StoredTask) {
  const data: Record<string, unknown> = {
    task_id: task.task_id,
    prompt: task.prompt,
    size: task.size,
    has_ref_images: task.has_ref_images,
  };

  if (task.api_data) {
    data.status = task.api_data.status;
    data.progress = task.api_data.progress || 0;
    data.actual_time = task.api_data.actual_time || 0;
    data.estimated_time = task.api_data.estimated_time || 0;
    data.completed_at = task.api_data.completed || 0;
    data.error_message = task.api_data.error?.message || '';
    const url = task.api_data.result?.images?.[0]?.url?.[0];
    if (url) data.image_url = url;
    data.expires_at = task.api_data.result?.images?.[0]?.expires_at || 0;
  }

  return data;
}

export async function fetchAllTasks(): Promise<StoredTask[]> {
  if (disabled) return [];
  try {
    const records = await pb.collection('tasks').getFullList<TaskRecord>({
      sort: '-created',
    });
    return records.map(recordToStoredTask);
  } catch (err) {
    console.warn('[PB] fetchAllTasks failed, disabling PocketBase:', err);
    disabled = true;
    return [];
  }
}

export async function createTask(task: StoredTask): Promise<void> {
  if (disabled) return;
  try {
    await pb.collection('tasks').create(storedTaskToRecord(task));
  } catch (err) {
    console.warn('[PB] createTask failed:', err);
    disabled = true;
  }
}

export async function updateTaskRecord(taskId: string, apiData: TaskData): Promise<void> {
  if (disabled) return;
  try {
    const record = await pb.collection('tasks').getFirstListItem<TaskRecord>(`task_id = "${taskId}"`);
    const imgUrl = apiData.result?.images?.[0]?.url?.[0];
    await pb.collection('tasks').update(record.id, {
      status: apiData.status,
      progress: apiData.progress || 0,
      actual_time: apiData.actual_time || 0,
      estimated_time: apiData.estimated_time || 0,
      completed_at: apiData.completed || 0,
      error_message: apiData.error?.message || '',
      ...(imgUrl ? { image_url: imgUrl } : {}),
      expires_at: apiData.result?.images?.[0]?.expires_at || 0,
    });
  } catch {
    // record not found or PB error, skip silently
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  if (disabled) return;
  try {
    const record = await pb.collection('tasks').getFirstListItem<TaskRecord>(`task_id = "${taskId}"`);
    await pb.collection('tasks').delete(record.id);
  } catch {
    // ignore
  }
}

export async function deleteAllTasks(): Promise<void> {
  if (disabled) return;
  try {
    const records = await pb.collection('tasks').getFullList<TaskRecord>();
    await Promise.all(records.map(r => pb.collection('tasks').delete(r.id)));
  } catch {
    // ignore
  }
}

export { pb };
