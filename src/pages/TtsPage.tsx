import { useState } from 'react';
import { useTts } from '../hooks/useTts';
import type { TtsVoice } from '../types';
import './TtsPage.css';

export function TtsPage() {
  const { ttsState, loading, error, speak, stopSpeaking, setVoice, setRate, setVolume } = useTts();
  const [text, setText] = useState('Hello! This is AI-Partner speaking.');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRateState] = useState(ttsState.settings.rate);
  const [volume, setVolumeState] = useState(ttsState.settings.volume);
  const [pitch, setPitch] = useState(ttsState.settings.pitch);

  const handleSpeak = async () => {
    if (!text.trim()) return;
    try {
      await speak(text);
    } catch (e) {
      console.error('Failed to speak:', e);
    }
  };

  const handleStop = async () => {
    await stopSpeaking();
  };

  const handleVoiceChange = async (voiceId: string) => {
    setSelectedVoice(voiceId);
    await setVoice(voiceId);
  };

  const handleRateChange = async (value: number) => {
    setRateState(value);
    await setRate(value);
  };

  const handleVolumeChange = async (value: number) => {
    setVolumeState(value);
    await setVolume(value);
  };

  return (
    <div className="tts-page">
      <div className="page-header">
        <h2>Text-to-Speech</h2>
        <p>Convert text to natural-sounding speech</p>
      </div>

      <div className="page-content">
        <div className="controls-panel">
          <div className="control-group">
            <label>Text to Speak</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={6}
              placeholder="Enter text to convert to speech..."
            />
          </div>

          <div className="control-group">
            <label>Voice</label>
            <select
              value={selectedVoice}
              onChange={e => handleVoiceChange(e.target.value)}
              disabled={loading}
            >
              <option value="">Default Voice</option>
              {ttsState.availableVoices.map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.language}){voice.gender && ` - ${voice.gender}`}
                  {voice.isDefault && ' (Default)'}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Rate: {rate.toFixed(1)}x</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={rate}
              onChange={e => handleRateChange(parseFloat(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label>Volume: {Math.round(volume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={e => handleVolumeChange(parseFloat(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label>Pitch: {pitch.toFixed(1)}</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={e => setPitch(parseFloat(e.target.value))}
            />
          </div>

          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={handleSpeak}
              disabled={ttsState.isSpeaking || loading || !text.trim()}
            >
              {ttsState.isSpeaking ? 'Speaking...' : 'Speak'}
            </button>
            <button
              className="btn btn-danger"
              onClick={handleStop}
              disabled={!ttsState.isSpeaking}
            >
              Stop
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="voice-panel">
          <h3>Available Voices ({ttsState.availableVoices.length})</h3>
          <div className="voices-grid">
            {ttsState.availableVoices.map(voice => (
              <div
                key={voice.id}
                className={`voice-card ${selectedVoice === voice.id ? 'selected' : ''}`}
                onClick={() => handleVoiceChange(voice.id)}
              >
                <div className="voice-header">
                  <h4>{voice.name}</h4>
                  {voice.isDefault && <span className="default-badge">Default</span>}
                </div>
                <div className="voice-meta">
                  <span>{voice.language}</span>
                  {voice.gender && <span>{voice.gender}</span>}
                </div>
              </div>
            ))}
          </div>

          {ttsState.availableVoices.length === 0 && (
            <div className="no-voices">
              <p>No voices available. The TTS engine may still be initializing.</p>
            </div>
          )}
        </div>
      </div>

      <div className="tts-status">
        <div className="status-card">
          <div className="status-header">
            <h3>Current Settings</h3>
            <span className={`status-badge ${ttsState.isSpeaking ? 'active' : ''}`}>
              {ttsState.isSpeaking ? '🔊 Speaking' : '🔇 Idle'}
            </span>
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <span className="setting-label">Voice</span>
              <span className="setting-value">
                {selectedVoice 
                  ? ttsState.availableVoices.find(v => v.id === selectedVoice)?.name 
                  : 'Default'}
              </span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Rate</span>
              <span className="setting-value">{rate}x</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Volume</span>
              <span className="setting-value">{Math.round(volume * 100)}%</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Pitch</span>
              <span className="setting-value">{pitch}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}