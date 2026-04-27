import { NextResponse } from 'next/server';
import { uploadImage, isImageHostConfigured } from '@/lib/imageHost';

export async function POST(request: Request) {
  if (!isImageHostConfigured()) {
    return NextResponse.json({ error: '图床未配置' }, { status: 501 });
  }

  const { image } = await request.json();

  if (!image || typeof image !== 'string') {
    return NextResponse.json({ error: '缺少 image 参数' }, { status: 400 });
  }

  try {
    const result = await uploadImage(image);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : '上传失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
