import { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { useSettings } from './context/SettingsContext';
import { useTaskStore } from './hooks/useTaskStore';
import { useTaskPoller } from './hooks/useTaskPoller';
import { TabBar, Sidebar } from './components/TabBar';
import { CreatePage } from './pages/CreatePage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import type { StoredTask } from './types/api';

function AppContent() {
  const [tab, setTab] = useState('create');
  const { apiKey } = useSettings();
  const { tasks, addTask, updateTask, removeTask, clearAll } = useTaskStore();

  useTaskPoller(apiKey, tasks, updateTask);

  const handleSubmitted = (task: StoredTask) => {
    addTask(task);
    setTab('history');
  };

  const content = (
    <>
      {tab === 'create' && (
        <CreatePage onSubmitted={handleSubmitted} onNeedApiKey={() => setTab('settings')} />
      )}
      {tab === 'history' && (
        <HistoryPage tasks={tasks} onDelete={removeTask} onClearAll={clearAll} onUpdate={updateTask} />
      )}
      {tab === 'settings' && <SettingsPage />}
    </>
  );

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50">
      {/* PC: 左侧 Sidebar */}
      <Sidebar active={tab} onChange={setTab} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* 移动端: 顶部 Header */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
          <h1 className="text-base font-semibold text-gray-900">GPT Image</h1>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-lg md:max-w-4xl mx-auto">
            {content}
          </div>
        </main>

        {/* 移动端: 底部 TabBar */}
        <footer className="flex-shrink-0 md:hidden">
          <TabBar active={tab} onChange={setTab} />
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
