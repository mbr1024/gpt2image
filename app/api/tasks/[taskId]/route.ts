import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const task = await db.getTask(taskId);
  if (!task) {
    return NextResponse.json({ error: '任务不存在' }, { status: 404 });
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
