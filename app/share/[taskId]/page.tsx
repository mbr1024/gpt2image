import Image from 'next/image';
import * as db from '@/lib/db';

interface SharePageProps {
  params: Promise<{ taskId: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { taskId } = await params;
  const task = await db.getTask(taskId);

  if (!task || task.status !== 'completed') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center space-y-2">
          <p className="text-4xl">🖼️</p>
          <p className="text-[var(--text-secondary)]">图片不存在或尚未生成完成</p>
        </div>
      </div>
    );
  }

  const imageUrl = task.persistent_url || task.image_url;

  return (
    <div className="min-h-dvh bg-[var(--bg)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        {imageUrl && (
          <div className="relative rounded-xl overflow-hidden bg-[var(--hover)]">
            <Image
              src={imageUrl}
              alt="Generated"
              width={1024}
              height={1024}
              className="w-full object-contain"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        )}
        <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Prompt</p>
          <p className="text-sm">{task.prompt}</p>
        </div>
        <p className="text-center text-xs text-[var(--text-tertiary)]">
          由 GPT Image 生成
        </p>
      </div>
    </div>
  );
}
