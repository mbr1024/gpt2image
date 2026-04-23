import { useState } from 'react';
import { SizeSelector } from './SizeSelector';
import { ImageUploader } from './ImageUploader';
import { useSettings } from '../context/SettingsContext';
import { submitTask } from '../services/api';
import type { StoredTask } from '../types/api';

interface PromptFormProps {
  onSubmitted: (task: StoredTask) => void;
  onNeedApiKey: () => void;
}

export function PromptForm({ onSubmitted, onNeedApiKey }: PromptFormProps) {
  const { apiKey } = useSettings();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1:1');
  const [images, setImages] = useState<string[]>([]);
  const [showRefImages, setShowRefImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!apiKey) {
      onNeedApiKey();
      return;
    }
    if (!prompt.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await submitTask(apiKey, {
        model: 'gpt-image-2',
        prompt: prompt.trim(),
        n: 1,
        size,
        ...(images.length > 0 ? { image_urls: images } : {}),
      });

      const taskId = res.data[0].task_id;
      const storedTask: StoredTask = {
        task_id: taskId,
        prompt: prompt.trim(),
        size,
        has_ref_images: images.length > 0,
        created_at: Date.now(),
      };
      onSubmitted(storedTask);
      setPrompt('');
      setImages([]);
      setShowRefImages(false);
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

      {!apiKey && (
        <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded-lg">
          请先在设置中配置 API Key
        </div>
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
