import { useEffect, useRef, useState } from 'react';
import { downloadImage } from '../utils/image';
import { queryTask } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { isActiveStatus } from '../utils/status';
import { StatusBadge } from './StatusBadge';
import type { StoredTask, TaskData } from '../types/api';

interface TaskDetailProps {
  task: StoredTask;
  onBack: () => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, data: TaskData) => void;
}

export function TaskDetail({ task, onBack, onDelete, onUpdate }: TaskDetailProps) {
  const { apiKey } = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const apiKeyRef = useRef(apiKey);
  const onUpdateRef = useRef(onUpdate);
  apiKeyRef.current = apiKey;
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    let stopped = false;

    const fetchTask = async () => {
      if (!apiKeyRef.current || stopped) return;
      setLoading(true);
      setError('');
      try {
        const res = await queryTask(apiKeyRef.current, task.task_id);
        if (!stopped && res.data) {
          onUpdateRef.current(task.task_id, res.data);
          // 完成或失败后停止轮询
          if (!isActiveStatus(res.data.status)) {
            stopped = true;
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }
      } catch (err) {
        if (!stopped) setError(err instanceof Error ? err.message : '查询失败');
      } finally {
        if (!stopped) setLoading(false);
      }
    };

    fetchTask();

    // 只有未完成的任务才启动轮询
    if (isActiveStatus(task.api_data?.status)) {
      intervalRef.current = setInterval(fetchTask, 5000);
    }

    return () => {
      stopped = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [task.task_id]);

  // 外部状态变化时也停止轮询
  useEffect(() => {
    if (!isActiveStatus(task.api_data?.status)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [task.api_data?.status]);

  const status = task.api_data?.status ?? 'pending';
  const imageUrl = task.api_data?.result?.images?.[0]?.url?.[0];
  const expiresAt = task.api_data?.result?.images?.[0]?.expires_at;
  const actualTime = task.api_data?.actual_time;

  const expiresIn = expiresAt
    ? Math.max(0, Math.floor((expiresAt * 1000 - Date.now()) / 3600000))
    : null;

  const handleDownload = () => {
    if (imageUrl) {
      downloadImage(imageUrl, `gpt-image-${task.task_id}.png`);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-blue-600 font-medium">
          &larr; 返回
        </button>
        <button
          onClick={() => { onDelete(task.task_id); onBack(); }}
          className="text-sm text-red-500"
        >
          删除
        </button>
      </div>

      {/* PC: 左图右信息, 移动端: 上下排列 */}
      <div className="flex flex-col md:flex-row md:gap-6">
        {/* 图片区域 */}
        <div className="md:flex-1 md:min-w-0">
          {imageUrl ? (
            <div className="rounded-xl overflow-hidden bg-gray-100">
              <img src={imageUrl} className="w-full object-contain md:max-h-[600px]" alt="Generated" />
            </div>
          ) : (
            <div className="h-64 md:h-96 rounded-xl bg-gray-100 flex flex-col items-center justify-center text-gray-400 gap-2">
              {loading && <span className="text-sm animate-pulse">查询中...</span>}
              {status === 'failed'
                ? task.api_data?.error?.message ?? '生成失败'
                : !loading && '等待生成中...'}
            </div>
          )}
        </div>

        {/* 信息区域 */}
        <div className="mt-4 md:mt-0 md:w-72 md:flex-shrink-0 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
          )}

          {imageUrl && (
            <button
              onClick={handleDownload}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              下载图片
            </button>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">状态</span>
              <StatusBadge status={status} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">比例</span>
              <span className="text-gray-900">{task.size}</span>
            </div>
            {actualTime != null && (
              <div className="flex justify-between">
                <span className="text-gray-500">耗时</span>
                <span className="text-gray-900">{actualTime}s</span>
              </div>
            )}
            {expiresIn != null && (
              <div className="flex justify-between">
                <span className="text-gray-500">链接过期</span>
                <span className={`${expiresIn <= 2 ? 'text-red-500' : 'text-gray-900'}`}>
                  {expiresIn > 0 ? `${expiresIn} 小时后` : '已过期'}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">创建时间</span>
              <span className="text-gray-900">{new Date(task.created_at).toLocaleString('zh-CN')}</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Prompt</p>
            <p className="text-sm text-gray-800">{task.prompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
