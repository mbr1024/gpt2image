interface TabBarProps {
  active: string;
  onChange: (tab: string) => void;
}

const tabs = [
  { id: 'create', label: '创建', icon: '✦' },
  { id: 'history', label: '历史', icon: '☰' },
  { id: 'settings', label: '设置', icon: '⚙' },
];

export function Sidebar({ active, onChange }: TabBarProps) {
  return (
    <nav className="hidden md:flex flex-col w-48 border-r border-gray-200 bg-white p-3 gap-1">
      <h1 className="text-base font-semibold text-gray-900 px-3 py-3 mb-2">GPT Image</h1>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            active === tab.id
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="text-base">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="flex md:hidden border-t border-gray-200 bg-white">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
            active === tab.id ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <span className="text-lg">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
