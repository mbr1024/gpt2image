interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--hover)] transition-colors"
      >
        上一页
      </button>
      <span className="text-sm text-[var(--text-secondary)]">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--hover)] transition-colors"
      >
        下一页
      </button>
    </div>
  );
}
