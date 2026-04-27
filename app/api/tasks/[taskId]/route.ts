import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import * as apimart from '@/lib/apimart';

function isActiveStatus(status: string) {
  return status === 'submitted' || status === 'pending' || status === 'processing';
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const task = await db.getTask(taskId);
  if (!task) {
    return NextResponse.json({ error: '任务不存在' }, { status: 404 });
  }

  if (isActiveStatus(task.status)) {
    try {
      const res = await apimart.queryTask(taskId);
      if (res.data) {
        await db.updateTaskFromApi(taskId, res.data);
        const updated = await db.getTask(taskId);
        return NextResponse.json(updated);
      }
    } catch {
      // API 查询失败，返回数据库中的状态
    }
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
