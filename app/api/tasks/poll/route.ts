import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import * as apimart from '@/lib/apimart';
import { uploadImage, isImageHostConfigured } from '@/lib/imageHost';

export async function POST() {
  const activeTasks = await db.getActiveTasks();

  if (activeTasks.length === 0) {
    return NextResponse.json({ updated: 0 });
  }

  let updated = 0;

  for (const task of activeTasks) {
    try {
      const res = await apimart.queryTask(task.task_id);
      if (res.data) {
        await db.updateTaskFromApi(task.task_id, res.data);
        updated++;

        // 图片持久化：任务完成后上传图床
        if (
          res.data.status === 'completed' &&
          isImageHostConfigured() &&
          !task.persistent_url
        ) {
          const imageUrl = res.data.result?.images?.[0]?.url?.[0];
          if (imageUrl) {
            try {
              const result = await uploadImage(imageUrl);
              await db.updatePersistentUrl(task.task_id, result.url);
            } catch {
              // 图床上传失败不影响主流程
            }
          }
        }
      }
    } catch {
      // skip failed queries
    }
  }

  const result = await db.getAllTasks();
  return NextResponse.json({ updated, tasks: result.data });
}
