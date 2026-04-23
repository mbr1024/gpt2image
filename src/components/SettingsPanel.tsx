import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export function SettingsPanel() {
  const { apiKey, setApiKey } = useSettings();
  const [input, setInput] = useState(apiKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(input.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-6 md:max-w-md">
      <h2 className="text-lg font-semibold text-gray-900">设置</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">API Key</label>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          >
            {show ? '隐藏' : '显示'}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          从{' '}
          <a href="https://apimart.ai/keys" target="_blank" rel="noreferrer" className="text-blue-500 underline">
            apimart.ai/keys
          </a>{' '}
          获取 API Key
        </p>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        {saved ? '已保存' : '保存'}
      </button>
    </div>
  );
}
