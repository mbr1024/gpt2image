import { ASPECT_RATIOS, type AspectRatio } from '@/constants/sizes';

interface SizeSelectorProps {
  value: string;
  onChange: (size: AspectRatio) => void;
}

export function SizeSelector({ value, onChange }: SizeSelectorProps) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
      {ASPECT_RATIOS.map(ratio => (
        <button
          key={ratio.value}
          type="button"
          onClick={() => onChange(ratio.value)}
          className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            value === ratio.value
              ? 'bg-blue-600 text-white'
              : 'bg-[var(--hover)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
          }`}
        >
          <div>{ratio.label}</div>
          <div className={`text-xs ${value === ratio.value ? 'text-blue-200' : 'text-[var(--text-tertiary)]'}`}>
            {ratio.desc}
          </div>
        </button>
      ))}
    </div>
  );
}
