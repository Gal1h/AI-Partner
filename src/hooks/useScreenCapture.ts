import { useState, useEffect, useCallback } from 'react';
import { screenApi } from '../services/api';
import type { Monitor, ScreenCaptureConfig, CaptureState } from '../types';

export function useScreenCapture() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [captureState, setCaptureState] = useState<CaptureState>({
    isCapturing: false,
    fps: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMonitors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await screenApi.getMonitors();
      setMonitors(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load monitors');
    } finally {
      setLoading(false);
    }
  }, []);

  const startCapture = useCallback(async (config: ScreenCaptureConfig) => {
    try {
      setError(null);
      await screenApi.startCapture(config);
      setCaptureState({ isCapturing: true, captureId: 'capture', fps: config.fps });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start capture');
      throw e;
    }
  }, []);

  const stopCapture = useCallback(async (captureId: string) => {
    try {
      await screenApi.stopCapture(captureId);
      setCaptureState({ isCapturing: false, fps: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to stop capture');
    }
  }, []);

  const captureFrame = useCallback(async (monitorId: string) => {
    try {
      const frame = await screenApi.captureFrame(monitorId);
      setCaptureState(prev => ({ ...prev, currentFrame: frame }));
      return frame;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to capture frame');
      throw e;
    }
  }, []);

  useEffect(() => {
    loadMonitors();
  }, [loadMonitors]);

  return {
    monitors,
    captureState,
    loading,
    error,
    loadMonitors,
    startCapture,
    stopCapture,
    captureFrame,
  };
}