'use client';

interface SearchBarProps {
  query: string;
  status: string;
  favorited: boolean;
  onQueryChange: (q: string) => void;
  onStatusChange: (status: string) => void;
  onFavoritedChange: (f: boolean) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'completed', label: '已完成' },
  { value: 'processing', label: '生成中' },
  { value: 'pending', label: '排队中' },
  { value: 'failed', label: '失败' },
];

export function SearchBar({
  query,
  status,
  favorited,
  onQueryChange,
  onStatusChange,
  onFavoritedChange,
}: SearchBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        placeholder="搜索 prompt..."
        className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-[var(--input-border)] bg-[var(--input-bg)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={status}
        onChange={e => onStatusChange(e.target.value)}
        className="px-3 py-2 text-sm border border-[var(--input-border)] bg-[var(--input-bg)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button
        onClick={() => onFavoritedChange(!favorited)}
        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
          favorited
            ? 'border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-600'
            : 'border-[var(--input-border)] hover:bg-[var(--hover)]'
        }`}
      >
        {favorited ? '★ 收藏' : '☆ 收藏'}
      </button>
    </div>
  );
}
