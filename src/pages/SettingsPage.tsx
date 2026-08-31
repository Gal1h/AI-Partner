import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import './SettingsPage.css';

export function SettingsPage() {
  const { state, dispatch } = useApp();
  const [config, setConfig] = useState(state.config);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    dispatch({ type: 'SET_CONFIG', payload: config });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: keyof typeof config, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure AI-Partner preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <nav>
            <ul>
              <li><button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>General</button></li>
              <li><button className={activeTab === 'appearance' ? 'active' : ''} onClick={() => setActiveTab('appearance')}>Appearance</button></li>
              <li><button className={activeTab === 'screen' ? 'active' : ''} onClick={() => setActiveTab('screen')}>Screen Capture</button></li>
              <li><button className={activeTab === 'camera' ? 'active' : ''} onClick={() => setActiveTab('camera')}>Camera</button></li>
              <li><button className={activeTab === 'audio' ? 'active' : ''} onClick={() => setActiveTab('audio')}>Audio</button></li>
              <li><button className={activeTab === 'tts' ? 'active' : ''} onClick={() => setActiveTab('tts')}>Text-to-Speech</button></li>
              <li><button className={activeTab === 'advanced' ? 'active' : ''} onClick={() => setActiveTab('advanced')}>Advanced</button></li>
            </ul>
          </nav>
        </div>

        <div className="settings-content">
          {saved && <div className="save-toast">Settings saved!</div>}

          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General</h3>
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.autoStart}
                    onChange={e => handleChange('autoStart', e.target.checked)}
                  />
                  <span>Start AI-Partner on system startup</span>
                </label>
              </div>
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={config.minimizeToTray}
                    onChange={e => handleChange('minimizeToTray', e.target.checked)}
                  />
                  <span>Minimize to system tray instead of closing</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3>Appearance</h3>
              <div className="setting-group">
                <label>Theme</label>
                <div className="theme-options">
                  {(['light', 'dark', 'system'] as const).map(theme => (
                    <button
                      key={theme}
                      className={`theme-option ${state.theme === theme ? 'active' : ''}`}
                      onClick={() => dispatch({ type: 'SET_THEME', payload: theme })}
                    >
                      <span className="theme-icon">
                        {theme === 'light' && '☀️'}
                        {theme === 'dark' && '🌙'}
                        {theme === 'system' && '💻'}
                      </span>
                      <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'screen' && (
            <div className="settings-section">
              <h3>Screen Capture</h3>
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={!!config.screen}
                    onChange={e => handleChange('screen', e.target.checked ? { ...config.screen, fps: 30, quality: 80 } : undefined)}
                  />
                  <span>Enable screen capture by default</span>
                </label>
              </div>
              {config.screen && (
                <div className="setting-group">
                  <label>Default FPS: {config.screen.fps}</label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={config.screen.fps}
                    onChange={e => handleChange('screen', { ...config.screen!, fps: parseInt(e.target.value) })}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="settings-section">
              <h3>Camera</h3>
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={!!config.camera}
                    onChange={e => handleChange('camera', e.target.checked ? { ...config.camera, width: 1280, height: 720, fps: 30 } : undefined)}
                  />
                  <span>Enable camera by default</span>
                </label>
              </div>
              {config.camera && (
                <div className="setting-group">
                  <label>Default Resolution: {config.camera.width}×{config.camera.height}</label>
                  <select
                    value={`${config.camera.width}x${config.camera.height}`}
                    onChange={e => {
                      const [w, h] = e.target.value.split('x').map(Number);
                      handleChange('camera', { ...config.camera!, width: w, height: h });
                    }}
                  >
                    <option value="640x480">640×480</option>
                    <option value="1280x720">1280×720 (HD)</option>
                    <option value="1920x1080">1920×1080 (Full HD)</option>
                    <option value="3840x2160">3840×2160 (4K)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="settings-section">
              <h3>Audio</h3>
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={!!config.audio}
                    onChange={e => handleChange('audio', e.target.checked ? { ...config.audio, sampleRate: 44100, channels: 2, format: 'F32' } : undefined)}
                  />
                  <span>Enable audio recording by default</span>
                </label>
              </div>
              {config.audio && (
                <div className="setting-group">
                  <label>Sample Rate: {config.audio.sampleRate} Hz</label>
                  <select
                    value={config.audio.sampleRate}
                    onChange={e => handleChange('audio', { ...config.audio!, sampleRate: parseInt(e.target.value) })}
                  >
                    <option value="8000">8000 Hz</option>
                    <option value="16000">16000 Hz</option>
                    <option value="22050">22050 Hz</option>
                    <option value="44100">44100 Hz (CD Quality)</option>
                    <option value="48000">48000 Hz (DVD Quality)</option>
                    <option value="96000">96000 Hz (Studio)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tts' && (
            <div className="settings-section">
              <h3>Text-to-Speech</h3>
              <div className="setting-group">
                <label>Default Rate: {config.tts.rate}x</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={config.tts.rate}
                  onChange={e => handleChange('tts', { ...config.tts, rate: parseFloat(e.target.value) })}
                />
              </div>
              <div className="setting-group">
                <label>Default Volume: {Math.round(config.tts.volume * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.tts.volume}
                  onChange={e => handleChange('tts', { ...config.tts, volume: parseFloat(e.target.value) })}
                />
              </div>
              <div className="setting-group">
                <label>Default Pitch: {config.tts.pitch}</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={config.tts.pitch}
                  onChange={e => handleChange('tts', { ...config.tts, pitch: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="settings-section">
              <h3>Advanced</h3>
              <div className="setting-group">
                <label>
                  <input type="checkbox" />
                  <span>Enable debug logging</span>
                </label>
              </div>
              <div className="setting-group">
                <label>
                  <input type="checkbox" />
                  <span>Auto-update check</span>
                </label>
              </div>
              <div className="setting-group">
                <label>
                  <input type="checkbox" />
                  <span>Send anonymous usage statistics</span>
                </label>
              </div>
              <div className="setting-group">
                <button className="btn btn-danger" onClick={() => { /* Reset to defaults */ }}>
                  Reset All Settings
                </button>
              </div>
            </div>
          )}

          <div className="settings-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={!saved}>
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}