import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const favorited = await db.toggleFavorite(taskId);
  return NextResponse.json({ is_favorited: favorited });
}
