'use client';

import { useRef, useState } from 'react';

function fileToBase64DataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = async (files: FileList) => {
    const remaining = 16 - images.length;
    const toProcess = Array.from(files).slice(0, remaining);
    const results = await Promise.all(toProcess.map(fileToBase64DataUri));
    onChange([...images, ...results]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-[var(--border)] hover:border-[var(--text-tertiary)]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && addFiles(e.target.files)}
        />
        <p className="text-sm text-[var(--text-secondary)]">
          点击或拖拽上传参考图（最多 16 张）
        </p>
      </div>
      {images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative w-16 h-16">
              <img src={src} className="w-full h-full object-cover rounded-lg" alt="" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
