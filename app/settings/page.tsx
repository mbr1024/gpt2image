export default function SettingsPage() {
  const hasKey = !!process.env.APIMART_API_KEY;

  return (
    <div className="p-4 space-y-6 md:max-w-md">
      <h2 className="text-lg font-semibold text-gray-900">设置</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">API Key 状态</label>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            hasKey ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-500' : 'bg-red-500'}`} />
          {hasKey ? 'API Key 已配置' : 'API Key 未配置'}
        </div>
        {!hasKey && (
          <p className="text-xs text-gray-500">
            请在服务器环境变量中设置 <code className="bg-gray-100 px-1 py-0.5 rounded">APIMART_API_KEY</code>
          </p>
        )}
        <p className="text-xs text-gray-400">
          从{' '}
          <a href="https://apimart.ai/keys" target="_blank" rel="noreferrer" className="text-blue-500 underline">
            apimart.ai/keys
          </a>{' '}
          获取 API Key
        </p>
      </div>
    </div>
  );
}
