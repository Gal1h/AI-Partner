import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ScreenPage } from './pages/ScreenPage';
import { CameraPage } from './pages/CameraPage';
import { AudioPage } from './pages/AudioPage';
import { TtsPage } from './pages/TtsPage';
import { CredentialsPage } from './pages/CredentialsPage';
import { SettingsPage } from './pages/SettingsPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;