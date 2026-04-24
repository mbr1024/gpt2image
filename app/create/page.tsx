import { PromptForm } from '@/components/PromptForm';

export default function CreatePage() {
  return (
    <div>
      <div className="p-4 pb-0">
        <h2 className="text-lg font-semibold text-gray-900">创建图片</h2>
      </div>
      <PromptForm />
    </div>
  );
}
