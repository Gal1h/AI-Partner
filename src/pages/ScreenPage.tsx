import { useState } from 'react';
import { useScreenCapture } from '../hooks/useScreenCapture';
import type { ScreenCaptureConfig } from '../types';
import './ScreenPage.css';

export function ScreenPage() {
  const { monitors, captureState, loading, error, startCapture, stopCapture, captureFrame } = useScreenCapture();
  const [selectedMonitor, setSelectedMonitor] = useState<string>('');
  const [fps, setFps] = useState(30);
  const [quality, setQuality] = useState(80);
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);
  const [region, setRegion] = useState({ x: 0, y: 0, width: 0, height: 0, enabled: false });

  const handleStartCapture = async () => {
    if (!selectedMonitor) return;
    try {
      const config: ScreenCaptureConfig = {
        monitorId: selectedMonitor,
        fps,
        quality,
        region: region.enabled ? region : undefined,
      };
      await startCapture(config);
    } catch (e) {
      console.error('Failed to start capture:', e);
    }
  };

  const handleStopCapture = async () => {
    if (captureState.captureId) {
      await stopCapture(captureState.captureId);
    }
  };

  const handleCaptureFrame = async () => {
    if (!selectedMonitor) return;
    try {
      const frame = await captureFrame(selectedMonitor);
      setPreviewFrame(frame);
    } catch (e) {
      console.error('Failed to capture frame:', e);
    }
  };

  return (
    <div className="screen-page">
      <div className="page-header">
        <h2>Screen Capture</h2>
        <p>Capture and monitor your screen in real-time</p>
      </div>

      <div className="page-content">
        <div className="controls-panel">
          <div className="control-group">
            <label>Monitor</label>
            <select
              value={selectedMonitor}
              onChange={e => setSelectedMonitor(e.target.value)}
              disabled={loading}
            >
              {monitors.map(monitor => (
                <option key={monitor.id} value={monitor.id}>
                  {monitor.name} ({monitor.width}×{monitor.height})
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>FPS: {fps}</label>
            <input
              type="range"
              min="1"
              max="60"
              value={fps}
              onChange={e => setFps(parseInt(e.target.value))}
              disabled={captureState.isCapturing}
            />
          </div>

          <div className="control-group">
            <label>Quality: {quality}%</label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={e => setQuality(parseInt(e.target.value))}
              disabled={captureState.isCapturing}
            />
          </div>

          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={region.enabled}
                onChange={e => setRegion(prev => ({ ...prev, enabled: e.target.checked }))}
                disabled={captureState.isCapturing}
              />
              Custom Region
            </label>
          </div>

          {region.enabled && (
            <div className="region-controls">
              <div className="control-row">
                <div className="control-group small">
                  <label>X</label>
                  <input
                    type="number"
                    value={region.x}
                    onChange={e => setRegion(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="control-group small">
                  <label>Y</label>
                  <input
                    type="number"
                    value={region.y}
                    onChange={e => setRegion(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="control-row">
                <div className="control-group small">
                  <label>Width</label>
                  <input
                    type="number"
                    value={region.width}
                    onChange={e => setRegion(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="control-group small">
                  <label>Height</label>
                  <input
                    type="number"
                    value={region.height}
                    onChange={e => setRegion(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={handleStartCapture}
              disabled={captureState.isCapturing || loading || !selectedMonitor}
            >
              {captureState.isCapturing ? 'Capturing...' : 'Start Capture'}
            </button>
            <button
              className="btn btn-danger"
              onClick={handleStopCapture}
              disabled={!captureState.isCapturing}
            >
              Stop Capture
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCaptureFrame}
              disabled={loading || !selectedMonitor}
            >
              Capture Frame
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="preview-panel">
          <h3>Preview</h3>
          <div className="preview-container">
            {previewFrame ? (
              <img src={`data:image/png;base64,${previewFrame}`} alt="Screen preview" className="preview-image" />
            ) : captureState.currentFrame ? (
              <img src={`data:image/png;base64,${captureState.currentFrame}`} alt="Live capture" className="preview-image live" />
            ) : (
              <div className="preview-placeholder">
                <div className="placeholder-icon">🖥️</div>
                <p>No preview available</p>
                <p className="placeholder-hint">Click "Capture Frame" or start live capture</p>
              </div>
            )}
          </div>

          {monitors.find(m => m.id === selectedMonitor) && (
            <div className="monitor-info">
              <h4>{monitors.find(m => m.id === selectedMonitor)?.name}</h4>
              <p>{monitors.find(m => m.id === selectedMonitor)?.width} × {monitors.find(m => m.id === selectedMonitor)?.height} @ {monitors.find(m => m.id === selectedMonitor)?.scaleFactor}x</p>
            </div>
          )}

          <div className="capture-status">
            <div className="status-item">
              <span className={`status-dot ${captureState.isCapturing ? 'active' : ''}`}></span>
              <span>{captureState.isCapturing ? 'LIVE' : 'IDLE'}</span>
            </div>
            <div className="status-item">
              <span>FPS:</span>
              <span>{captureState.fps}</span>
            </div>
            <div className="status-item">
              <span>Frames:</span>
              <span>{captureState.currentFrame ? 'Available' : 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="monitors-list">
        <h3>Available Monitors ({monitors.length})</h3>
        <div className="monitors-grid">
          {monitors.map(monitor => (
            <div key={monitor.id} className={`monitor-card ${selectedMonitor === monitor.id ? 'selected' : ''}`}>
              <div className="monitor-preview">
                <div className="monitor-placeholder">{monitor.name}</div>
              </div>
              <div className="monitor-details">
                <h4>{monitor.name}</h4>
                <p>{monitor.width} × {monitor.height}</p>
                <p>Scale: {monitor.scaleFactor}x</p>
                {monitor.isPrimary && <span className="primary-badge">Primary</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}