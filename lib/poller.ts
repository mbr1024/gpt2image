import * as db from './db';
import * as apimart from './apimart';
import { uploadImage, isImageHostConfigured } from './imageHost';

let started = false;
const POLL_INTERVAL = 5000; // 5 秒

async function pollActiveTasks() {
  try {
    const activeTasks = await db.getActiveTasks();
    if (activeTasks.length === 0) return;

    for (const task of activeTasks) {
      try {
        const res = await apimart.queryTask(task.task_id);
        if (res.data) {
          await db.updateTaskFromApi(task.task_id, res.data);

          // 任务完成 → 上传图床持久化
          if (res.data.status === 'completed' && isImageHostConfigured() && !task.persistent_url) {
            const imageUrl = res.data.result?.images?.[0]?.url?.[0];
            if (imageUrl) {
              try {
                const result = await uploadImage(imageUrl);
                await db.updatePersistentUrl(task.task_id, result.url);
              } catch {
                // 图床失败不阻塞
              }
            }
          }
        }
      } catch {
        // 单个任务查询失败，跳过
      }
    }
  } catch {
    // DB 连接失败等，静默
  }
}

/**
 * 启动后端轮询（单例，整个进程只启动一次）
 */
export function ensurePollerStarted() {
  if (started) return;
  started = true;
  setInterval(pollActiveTasks, POLL_INTERVAL);
  // 启动后立即执行一次
  pollActiveTasks();
}
