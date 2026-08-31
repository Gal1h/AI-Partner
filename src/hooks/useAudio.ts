import { useState, useEffect, useCallback, useRef } from 'react';
import { audioApi } from '../services/api';
import type { AudioDevice, AudioConfig, AudioState } from '../types';

export function useAudio() {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [audioState, setAudioState] = useState<AudioState>({
    isRecording: false,
    level: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const levelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadDevices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await audioApi.getInputDevices();
      setDevices(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audio devices');
    } finally {
      setLoading(false);
    }
  }, []);

  const startRecording = useCallback(async (config: AudioConfig, outputPath?: string) => {
    try {
      setError(null);
      await audioApi.startRecording(config, outputPath);
      const device = devices.find(d => d.id === config.deviceId);
      setAudioState({ isRecording: true, captureId: 'audio', level: 0, selectedDevice: device });

      if (levelIntervalRef.current) clearInterval(levelIntervalRef.current);
      levelIntervalRef.current = setInterval(async () => {
        try {
          const level = await audioApi.getAudioLevel('audio');
          setAudioState(prev => ({ ...prev, level }));
        } catch {
          // Ignore level errors
        }
      }, 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start recording');
      throw e;
    }
  }, [devices]);

  const stopRecording = useCallback(async (captureId: string) => {
    try {
      if (levelIntervalRef.current) {
        clearInterval(levelIntervalRef.current);
        levelIntervalRef.current = null;
      }
      await audioApi.stopRecording(captureId);
      setAudioState({ isRecording: false, level: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to stop recording');
    }
  }, []);

  useEffect(() => {
    loadDevices();
    return () => {
      if (levelIntervalRef.current) clearInterval(levelIntervalRef.current);
    };
  }, [loadDevices]);

  return {
    devices,
    audioState,
    loading,
    error,
    loadDevices,
    startRecording,
    stopRecording,
  };
}