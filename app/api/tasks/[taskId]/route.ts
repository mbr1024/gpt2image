import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import * as apimart from '@/lib/apimart';
import { uploadImage, isImageHostConfigured } from '@/lib/imageHost';

function isActiveStatus(status: string) {
  return status === 'submitted' || status === 'pending' || status === 'processing';
}

async function tryPersistImage(taskId: string, imageUrl: string, currentPersistentUrl: string) {
  if (!isImageHostConfigured() || currentPersistentUrl) return;
  try {
    const result = await uploadImage(imageUrl);
    await db.updatePersistentUrl(taskId, result.url);
  } catch {
    // 图床上传失败不影响主流程
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  let task = await db.getTask(taskId);
  if (!task) {
    return NextResponse.json({ error: '任务不存在' }, { status: 404 });
  }

  if (isActiveStatus(task.status)) {
    try {
      const res = await apimart.queryTask(taskId);
      if (res.data) {
        await db.updateTaskFromApi(taskId, res.data);

        // 刚完成的任务立即上传图床
        if (res.data.status === 'completed') {
          const imageUrl = res.data.result?.images?.[0]?.url?.[0];
          if (imageUrl) {
            await tryPersistImage(taskId, imageUrl, task.persistent_url);
          }
        }

        task = (await db.getTask(taskId)) ?? task;
        return NextResponse.json(task);
      }
    } catch {
      // API 查询失败，返回数据库中的状态
    }
  }

  // 已完成但还没持久化的任务，补上传
  if (task.status === 'completed' && task.image_url && !task.persistent_url) {
    await tryPersistImage(taskId, task.image_url, task.persistent_url);
    task = (await db.getTask(taskId)) ?? task;
  }

  return NextResponse.json(task);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  await db.deleteTask(taskId);
  return NextResponse.json({ ok: true });
}
