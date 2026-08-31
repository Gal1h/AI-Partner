import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useApp } from '../../contexts/AppContext';
import { Dashboard } from '../../pages/Dashboard';
import { ScreenPage } from '../../pages/ScreenPage';
import { CameraPage } from '../../pages/CameraPage';
import { AudioPage } from '../../pages/AudioPage';
import { TtsPage } from '../../pages/TtsPage';
import { CredentialsPage } from '../../pages/CredentialsPage';
import { SettingsPage } from '../../pages/SettingsPage';
import type { TabType } from '../../types';
import './Layout.css';

export function Layout() {
  const { state } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (state.activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'screen':
        return <ScreenPage />;
      case 'camera':
        return <CameraPage />;
      case 'audio':
        return <AudioPage />;
      case 'tts':
        return <TtsPage />;
      case 'credentials':
        return <CredentialsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className={`main-content ${state.isSidebarOpen ? 'with-sidebar' : 'collapsed-sidebar'}`}>
        <TopBar />
        <main className="page-content" role="main">
          {renderPage()}
        </main>
      </div>
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}