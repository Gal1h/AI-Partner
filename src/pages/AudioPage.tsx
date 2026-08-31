import { useState, useEffect } from 'react';
import { useAudio } from '../hooks/useAudio';
import type { AudioConfig } from '../types';
import './AudioPage.css';

export function AudioPage() {
  const { devices, audioState, loading, error, startRecording, stopRecording } = useAudio();
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [sampleRate, setSampleRate] = useState(44100);
  const [channels, setChannels] = useState(2);
  const [format, setFormat] = useState<'F32' | 'I16' | 'U8'>('F32');
  const [outputPath, setOutputPath] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const handleStartRecording = async () => {
    if (!selectedDevice) return;
    try {
      const config: AudioConfig = {
        deviceId: selectedDevice,
        sampleRate,
        channels,
        format,
      };
      setRecordingTime(0);
      await startRecording(config, outputPath || undefined);
    } catch (e) {
      console.error('Failed to start recording:', e);
    }
  };

  const handleStopRecording = async () => {
    if (audioState.captureId) {
      await stopRecording(audioState.captureId);
    }
  };

  const selectedDeviceData = devices.find(d => d.id === selectedDevice);

  // Update recording time
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (audioState.isRecording) {
      interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [audioState.isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-page">
      <div className="page-header">
        <h2>Audio Input</h2>
        <p>Record audio from microphone and system audio</p>
      </div>

      <div className="page-content">
        <div className="controls-panel">
          <div className="control-group">
            <label>Input Device</label>
            <select
              value={selectedDevice}
              onChange={e => setSelectedDevice(e.target.value)}
              disabled={loading}
            >
              {devices.map(device => (
                <option key={device.id} value={device.id}>
                  {device.name} {device.isDefault && '(Default)'}
                </option>
              ))}
            </select>
          </div>

          <div className="control-row">
            <div className="control-group">
              <label>Sample Rate</label>
              <select value={sampleRate} onChange={e => setSampleRate(parseInt(e.target.value))} disabled={audioState.isRecording}>
                {selectedDeviceData?.sampleRates.map(rate => (
                  <option key={rate} value={rate}>{rate} Hz</option>
                )) || [8000, 16000, 22050, 44100, 48000, 96000].map(rate => (
                  <option key={rate} value={rate}>{rate} Hz</option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label>Channels</label>
              <select value={channels} onChange={e => setChannels(parseInt(e.target.value))} disabled={audioState.isRecording}>
                <option value={1}>Mono (1)</option>
                <option value={2}>Stereo (2)</option>
              </select>
            </div>
          </div>

          <div className="control-group">
            <label>Format</label>
            <select value={format} onChange={e => setFormat(e.target.value as 'F32' | 'I16' | 'U8')} disabled={audioState.isRecording}>
              <option value="F32">Float 32-bit</option>
              <option value="I16">Integer 16-bit</option>
              <option value="U8">Unsigned 8-bit</option>
            </select>
          </div>

          <div className="control-group">
            <label>Output File (optional)</label>
            <input
              type="text"
              value={outputPath}
              onChange={e => setOutputPath(e.target.value)}
              placeholder="/path/to/recording.wav"
              disabled={audioState.isRecording}
            />
          </div>

          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={handleStartRecording}
              disabled={audioState.isRecording || loading || !selectedDevice}
            >
              {audioState.isRecording ? `Recording ${formatTime(recordingTime)}` : 'Start Recording'}
            </button>
            <button
              className="btn btn-danger"
              onClick={handleStopRecording}
              disabled={!audioState.isRecording}
            >
              Stop Recording
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="visualizer-panel">
          <h3>Audio Visualizer</h3>
          <div className="visualizer-container">
            <div className="level-meter">
              <div className="level-bar">
                <div
                  className="level-fill"
                  style={{ width: `${audioState.level * 100}%` }}
                ></div>
              </div>
              <div className="level-labels">
                <span>-∞</span>
                <span>0 dB</span>
              </div>
            </div>

            <div className="audio-waveform">
              <canvas className="waveform-canvas" width={400} height={100}></canvas>
            </div>

            <div className="audio-info">
              {selectedDeviceData && (
                <>
                  <h4>{selectedDeviceData.name}</h4>
                  <p>{selectedDeviceData.maxChannels} channels, {selectedDeviceData.sampleRates.join(', ')} Hz</p>
                </>
              )}
              <div className="recording-status">
                <span className={`recording-indicator ${audioState.isRecording ? 'recording' : ''}`}></span>
                <span>{audioState.isRecording ? 'RECORDING' : 'STANDBY'}</span>
                {audioState.isRecording && <span className="recording-time">{formatTime(recordingTime)}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="devices-list">
        <h3>Available Audio Devices ({devices.length})</h3>
        <div className="devices-grid">
          {devices.map(device => (
            <div key={device.id} className={`device-card ${selectedDevice === device.id ? 'selected' : ''}`}>
              <div className="device-header">
                <h4>{device.name}</h4>
                {device.isDefault && <span className="default-badge">Default</span>}
              </div>
              <div className="device-specs">
                <span>{device.maxChannels} ch</span>
                <span>{device.sampleRates.join(', ')} Hz</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}