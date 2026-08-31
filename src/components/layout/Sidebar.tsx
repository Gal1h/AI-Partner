import { useApp } from '../../contexts/AppContext';
import type { TabType } from '../../types';
import './Sidebar.css';

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'screen', label: 'Screen Capture', icon: '🖥️' },
  { id: 'camera', label: 'Camera', icon: '📷' },
  { id: 'audio', label: 'Audio', icon: '🎤' },
  { id: 'tts', label: 'Text-to-Speech', icon: '🔊' },
  { id: 'credentials', label: 'Credentials', icon: '🔐' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const { state, dispatch } = useApp();

  return (
    <aside className={`sidebar ${state.isSidebarOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <h1 className="logo">AI-Partner</h1>
        <button
          className="toggle-btn"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          aria-label={state.isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {state.isSidebarOpen ? '◀' : '▶'}
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {tabs.map(tab => (
            <li key={tab.id}>
              <button
                className={`nav-item ${state.activeTab === tab.id ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
              >
                <span className="nav-icon">{tab.icon}</span>
                {state.isSidebarOpen && <span className="nav-label">{tab.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        {state.isSidebarOpen && (
          <div className="version-info">
            <span>v0.1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}