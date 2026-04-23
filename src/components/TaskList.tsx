import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskDetail } from './TaskDetail';
import type { StoredTask, TaskData } from '../types/api';

interface TaskListProps {
  tasks: StoredTask[];
  onDelete: (taskId: string) => void;
  onClearAll: () => void;
  onUpdate: (taskId: string, data: TaskData) => void;
}

export function TaskList({ tasks, onDelete, onClearAll, onUpdate }: TaskListProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = tasks.find(t => t.task_id === selectedTaskId);

  if (selectedTask) {
    return (
      <TaskDetail
        task={selectedTask}
        onBack={() => setSelectedTaskId(null)}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400 text-sm">暂无任务，去创建一个吧</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">历史记录</h2>
        <button
          onClick={() => {
            if (confirm('确定清空所有历史记录？')) onClearAll();
          }}
          className="text-xs text-red-500"
        >
          清空
        </button>
      </div>
      {/* 移动端: 竖向列表, PC 端: 网格 */}
      <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tasks.map(task => (
          <TaskCard key={task.task_id} task={task} onClick={() => setSelectedTaskId(task.task_id)} />
        ))}
      </div>
    </div>
  );
}
