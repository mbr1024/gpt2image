import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import * as apimart from '@/lib/apimart';
import { checkRateLimit } from '@/lib/rateLimit';
import type { TaskFilters } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? 20)));

  const filters: TaskFilters = {};
  const q = searchParams.get('q');
  if (q) filters.q = q;
  const status = searchParams.get('status');
  if (status) filters.status = status;
  if (searchParams.get('favorited') === 'true') filters.favorited = true;

  const result = await db.getAllTasks(page, pageSize, filters);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  // 限流
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: `请求过于频繁，请 ${retryAfter} 秒后重试` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  const body = await request.json();
  const { prompt, size, image_urls } = body;

  if (!prompt || !size) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  }

  try {
    const res = await apimart.submitTask({
      prompt,
      size,
      ...(image_urls?.length ? { image_urls } : {}),
    });

    const taskId = res.data[0].task_id;

    await db.createTask({
      task_id: taskId,
      prompt,
      size,
      has_ref_images: (image_urls?.length ?? 0) > 0,
    });

    return NextResponse.json({ task_id: taskId });
  } catch (err) {
    const message = err instanceof Error ? err.message : '提交失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
