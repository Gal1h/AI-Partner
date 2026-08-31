import React from 'react';
import { useApp } from '../../contexts/AppContext';
import './Header.css';

export function Header() {
  const { state, dispatch } = useApp();

  const tabLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    screen: 'Screen Capture',
    camera: 'Camera',
    audio: 'Audio Input',
    tts: 'Text-to-Speech',
    credentials: 'Credentials',
    settings: 'Settings',
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">{tabLabels[state.activeTab] || 'AI-Partner'}</h1>
      </div>
      <div className="header-right">
        <div className="theme-toggle">
          <button
            className="icon-btn"
            onClick={() => {
              const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
              const currentIndex = themes.indexOf(state.theme);
              dispatch({ type: 'SET_THEME', payload: themes[(currentIndex + 1) % 3] });
            }}
            aria-label={`Current theme: ${state.theme}`}
            title={`Theme: ${state.theme}`}
          >
            {state.theme === 'light' && '☀️'}
            {state.theme === 'dark' && '🌙'}
            {state.theme === 'system' && '💻'}
          </button>
        </div>
        <div className="status-indicators">
          <span className="status-dot online" title="Backend connected" />
        </div>
      </div>
    </header>
  );
}