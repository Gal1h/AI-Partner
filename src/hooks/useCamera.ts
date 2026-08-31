import { useState, useEffect, useCallback } from 'react';
import { cameraApi } from '../services/api';
import type { CameraDevice, CameraConfig, CameraState } from '../types';

export function useCamera() {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    level: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCameras = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cameraApi.getCameras();
      setCameras(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load cameras');
    } finally {
      setLoading(false);
    }
  }, []);

  const startCamera = useCallback(async (config: CameraConfig) => {
    try {
      setError(null);
      await cameraApi.startCamera(config);
      const device = cameras.find(c => c.id === config.deviceId);
      setCameraState({ isActive: true, captureId: 'camera', selectedDevice: device, level: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start camera');
      throw e;
    }
  }, [cameras]);

  const stopCamera = useCallback(async (captureId: string) => {
    try {
      await cameraApi.stopCamera(captureId);
      setCameraState({ isActive: false, level: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to stop camera');
    }
  }, []);

  const captureFrame = useCallback(async (deviceId: string) => {
    try {
      const frame = await cameraApi.captureFrame(deviceId);
      setCameraState(prev => ({ ...prev, currentFrame: frame }));
      return frame;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to capture frame');
      throw e;
    }
  }, []);

  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  return {
    cameras,
    cameraState,
    loading,
    error,
    loadCameras,
    startCamera,
    stopCamera,
    captureFrame,
  };
}