import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

// 后端轮询已在 poller.ts 中处理，此接口仅返回当前数据
export async function POST() {
  const result = await db.getAllTasks();
  return NextResponse.json({ updated: 0, tasks: result.data });
}
