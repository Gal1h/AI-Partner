import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { AppConfig, TtsSettings, TabType } from '../types';

interface AppState {
  config: AppConfig;
  activeTab: TabType;
  isSidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
}

type AppAction =
  | { type: 'SET_CONFIG'; payload: Partial<AppConfig> }
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_TTS_SETTINGS'; payload: Partial<TtsSettings> };

const initialState: AppState = {
  config: {
    tts: { rate: 1.0, volume: 1.0, pitch: 1.0 },
    autoStart: false,
    minimizeToTray: true,
  },
  activeTab: 'dashboard',
  isSidebarOpen: true,
  theme: 'system',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_TTS_SETTINGS':
      return {
        ...state,
        config: { ...state.config, tts: { ...state.config.tts, ...action.payload } },
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-partner-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        dispatch({ type: 'SET_CONFIG', payload: config });
      } catch (e) {
        console.error('Failed to parse saved config', e);
      }
    }

    const savedTheme = localStorage.getItem('ai-partner-theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai-partner-config', JSON.stringify(state.config));
  }, [state.config]);

  useEffect(() => {
    localStorage.setItem('ai-partner-theme', state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}