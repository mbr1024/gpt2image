'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SizeSelector } from './SizeSelector';
import { ImageUploader } from './ImageUploader';

export function PromptForm() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1:1');
  const [images, setImages] = useState<string[]>([]);
  const [showRefImages, setShowRefImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size,
          ...(images.length > 0 ? { image_urls: images } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '提交失败');
      }

      setPrompt('');
      setImages([]);
      setShowRefImages(false);
      router.push('/history');
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="描述你想要生成的图片，例如：一只橘猫坐在窗台上看夕阳，水彩画风格"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">比例</label>
        <SizeSelector value={size} onChange={setSize} />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowRefImages(!showRefImages)}
          className="text-sm text-blue-600 font-medium"
        >
          {showRefImages ? '- 收起参考图' : '+ 添加参考图（图生图）'}
        </button>
        {showRefImages && (
          <div className="mt-2">
            <ImageUploader images={images} onChange={setImages} />
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !prompt.trim()}
        className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? '提交中...' : '生成图片'}
      </button>
    </div>
  );
}
