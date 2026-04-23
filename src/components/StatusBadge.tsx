const statusConfig: Record<string, { bg: string; text: string; label: string; pulse?: boolean }> = {
  submitted: { bg: 'bg-gray-100', text: 'text-gray-600', label: '已提交' },
  pending: { bg: 'bg-gray-100', text: 'text-gray-600', label: '排队中' },
  processing: { bg: 'bg-amber-100', text: 'text-amber-700', label: '生成中', pulse: true },
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: '已完成' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', label: '失败' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.pulse && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
      {config.label}
    </span>
  );
}
