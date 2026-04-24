import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import * as apimart from '@/lib/apimart';

export async function GET() {
  const tasks = db.getAllTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt, size, image_urls } = body;

  if (!prompt || !size) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  }

  const res = await apimart.submitTask({
    prompt,
    size,
    ...(image_urls?.length ? { image_urls } : {}),
  });

  const taskId = res.data[0].task_id;

  db.createTask({
    task_id: taskId,
    prompt,
    size,
    has_ref_images: (image_urls?.length ?? 0) > 0,
  });

  return NextResponse.json({ task_id: taskId });
}
