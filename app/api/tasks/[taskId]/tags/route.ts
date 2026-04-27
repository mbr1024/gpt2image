import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const { tags } = await request.json();

  if (typeof tags !== 'string') {
    return NextResponse.json({ error: 'tags 必须是字符串' }, { status: 400 });
  }

  await db.updateTags(taskId, tags);
  return NextResponse.json({ ok: true, tags });
}
