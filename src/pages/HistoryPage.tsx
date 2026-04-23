import { TaskList } from '../components/TaskList';
import type { StoredTask, TaskData } from '../types/api';

interface HistoryPageProps {
  tasks: StoredTask[];
  onDelete: (taskId: string) => void;
  onClearAll: () => void;
  onUpdate: (taskId: string, data: TaskData) => void;
}

export function HistoryPage({ tasks, onDelete, onClearAll, onUpdate }: HistoryPageProps) {
  return <TaskList tasks={tasks} onDelete={onDelete} onClearAll={onClearAll} onUpdate={onUpdate} />;
}
