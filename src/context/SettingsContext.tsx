import { createContext, useContext, useState, type ReactNode } from 'react';
import { getItem, setItem } from '../utils/storage';

interface SettingsContextValue {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  apiKey: '',
  setApiKey: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState(() => getItem<string>('gpt-image-api-key', ''));

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    setItem('gpt-image-api-key', key);
  };

  return (
    <SettingsContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
