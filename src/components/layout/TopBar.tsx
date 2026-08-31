import { useApp } from '../../contexts/AppContext';
import './TopBar.css';

export function TopBar() {
  const { state, dispatch } = useApp();

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <h2 className="page-title">{getPageTitle(state.activeTab)}</h2>
      </div>
      <div className="top-bar-right">
        <div className="theme-toggle">
          <button
            className={`theme-btn ${state.theme === 'light' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_THEME', payload: 'light' })}
            aria-label="Light mode"
          >
            ☀️
          </button>
          <button
            className={`theme-btn ${state.theme === 'dark' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_THEME', payload: 'dark' })}
            aria-label="Dark mode"
          >
            🌙
          </button>
          <button
            className={`theme-btn ${state.theme === 'system' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_THEME', payload: 'system' })}
            aria-label="System theme"
          >
            💻
          </button>
        </div>
        <div className="status-indicators">
          <StatusDot label="Screen" active={false} />
          <StatusDot label="Camera" active={false} />
          <StatusDot label="Audio" active={false} />
          <StatusDot label="TTS" active={false} />
        </div>
      </div>
    </header>
  );
}

function getPageTitle(tab: string): string {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    screen: 'Screen Capture',
    camera: 'Camera',
    audio: 'Audio Input',
    tts: 'Text-to-Speech',
    credentials: 'Credentials',
    settings: 'Settings',
  };
  return titles[tab] || 'AI-Partner';
}

function StatusDot({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="status-item" title={label}>
      <span className={`status-dot ${active ? 'active' : ''}`}></span>
      <span className="status-label">{label}</span>
    </div>
  );
}