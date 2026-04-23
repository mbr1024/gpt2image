import { PromptForm } from '../components/PromptForm';
import type { StoredTask } from '../types/api';

interface CreatePageProps {
  onSubmitted: (task: StoredTask) => void;
  onNeedApiKey: () => void;
}

export function CreatePage({ onSubmitted, onNeedApiKey }: CreatePageProps) {
  return (
    <div>
      <div className="p-4 pb-0">
        <h2 className="text-lg font-semibold text-gray-900">创建图片</h2>
      </div>
      <PromptForm onSubmitted={onSubmitted} onNeedApiKey={onNeedApiKey} />
    </div>
  );
}
