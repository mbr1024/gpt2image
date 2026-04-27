'use client';

import { useState } from 'react';

interface ShareButtonProps {
  taskId: string;
  imageUrl?: string;
}

export function ShareButton({ taskId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${taskId}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'GPT Image', url: shareUrl });
        return;
      } catch {
        // 用户取消分享，fallback 到复制
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="w-full py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium transition-colors hover:bg-[var(--hover)]"
    >
      {copied ? '已复制链接' : '分享'}
    </button>
  );
}
