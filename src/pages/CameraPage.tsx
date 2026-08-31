import { useState } from 'react';
import { useCamera } from '../hooks/useCamera';
import type { CameraConfig } from '../types';
import './CameraPage.css';

export function CameraPage() {
  const { cameras, cameraState, loading, error, startCamera, stopCamera, captureFrame } = useCamera();
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [fps, setFps] = useState(30);
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);

  const handleStartCamera = async () => {
    if (!selectedCamera) return;
    try {
      const config: CameraConfig = { deviceId: selectedCamera, width, height, fps };
      await startCamera(config);
    } catch (e) {
      console.error('Failed to start camera:', e);
    }
  };

  const handleStopCamera = async () => {
    if (cameraState.captureId) {
      await stopCamera(cameraState.captureId);
    }
  };

  const handleCaptureFrame = async () => {
    if (!selectedCamera) return;
    try {
      const frame = await captureFrame(selectedCamera);
      setPreviewFrame(frame);
    } catch (e) {
      console.error('Failed to capture frame:', e);
    }
  };

  const selectedCameraData = cameras.find(c => c.id === selectedCamera);

  return (
    <div className="camera-page">
      <div className="page-header">
        <h2>Camera</h2>
        <p>Access and capture from your camera devices</p>
      </div>

      <div className="page-content">
        <div className="controls-panel">
          <div className="control-group">
            <label>Camera Device</label>
            <select
              value={selectedCamera}
              onChange={e => setSelectedCamera(e.target.value)}
              disabled={loading}
            >
              {cameras.map(camera => (
                <option key={camera.id} value={camera.id}>
                  {camera.name} ({camera.width}×{camera.height} @ {camera.fps}fps)
                </option>
              ))}
            </select>
          </div>

          <div className="control-row">
            <div className="control-group">
              <label>Width</label>
              <input
                type="number"
                value={width}
                onChange={e => setWidth(parseInt(e.target.value) || 640)}
                min="160"
                max="3840"
                disabled={cameraState.isActive}
              />
            </div>
            <div className="control-group">
              <label>Height</label>
              <input
                type="number"
                value={height}
                onChange={e => setHeight(parseInt(e.target.value) || 480)}
                min="120"
                max="2160"
                disabled={cameraState.isActive}
              />
            </div>
          </div>

          <div className="control-group">
            <label>FPS: {fps}</label>
            <input
              type="range"
              min="1"
              max="60"
              value={fps}
              onChange={e => setFps(parseInt(e.target.value))}
              disabled={cameraState.isActive}
            />
          </div>

          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={handleStartCamera}
              disabled={cameraState.isActive || loading || !selectedCamera}
            >
              {cameraState.isActive ? 'Camera Active' : 'Start Camera'}
            </button>
            <button
              className="btn btn-danger"
              onClick={handleStopCamera}
              disabled={!cameraState.isActive}
            >
              Stop Camera
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCaptureFrame}
              disabled={loading || !selectedCamera}
            >
              Capture Frame
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="preview-panel">
          <h3>Camera Preview</h3>
          <div className="preview-container">
            {previewFrame ? (
              <img src={`data:image/png;base64,${previewFrame}`} alt="Camera preview" className="preview-image" />
            ) : cameraState.currentFrame ? (
              <img src={`data:image/png;base64,${cameraState.currentFrame}`} alt="Live camera" className="preview-image live" />
            ) : (
              <div className="preview-placeholder">
                <div className="placeholder-icon">📷</div>
                <p>No camera feed</p>
                <p className="placeholder-hint">Select a camera and click "Start Camera"</p>
              </div>
            )}
          </div>

          {selectedCameraData && (
            <div className="camera-info">
              <h4>{selectedCameraData.name}</h4>
              <p>{selectedCameraData.width} × {selectedCameraData.height} @ {selectedCameraData.fps}fps</p>
              <p>Format: {selectedCameraData.format}</p>
            </div>
          )}

          <div className="capture-status">
            <div className="status-item">
              <span className={`status-dot ${cameraState.isActive ? 'active' : ''}`}></span>
              <span>{cameraState.isActive ? 'ACTIVE' : 'IDLE'}</span>
            </div>
            <div className="status-item">
              <span>Resolution:</span>
              <span>{width}×{height}</span>
            </div>
            <div className="status-item">
              <span>FPS:</span>
              <span>{fps}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="cameras-list">
        <h3>Available Cameras ({cameras.length})</h3>
        <div className="cameras-grid">
          {cameras.map(camera => (
            <div key={camera.id} className={`camera-card ${selectedCamera === camera.id ? 'selected' : ''}`}>
              <div className="camera-preview">
                <div className="camera-placeholder">{camera.name}</div>
              </div>
              <div className="camera-details">
                <h4>{camera.name}</h4>
                <p>{camera.width} × {camera.height} @ {camera.fps}fps</p>
                <p>{camera.format}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}