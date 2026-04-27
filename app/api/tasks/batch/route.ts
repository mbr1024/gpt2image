import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(request: Request) {
  const { action, task_ids } = await request.json();

  if (!Array.isArray(task_ids) || task_ids.length === 0) {
    return NextResponse.json({ error: '缺少 task_ids' }, { status: 400 });
  }

  switch (action) {
    case 'delete':
      await db.deleteTasks(task_ids);
      return NextResponse.json({ ok: true, deleted: task_ids.length });

    case 'favorite':
      await db.batchFavorite(task_ids, true);
      return NextResponse.json({ ok: true });

    case 'unfavorite':
      await db.batchFavorite(task_ids, false);
      return NextResponse.json({ ok: true });

    default:
      return NextResponse.json({ error: '不支持的操作' }, { status: 400 });
  }
}
