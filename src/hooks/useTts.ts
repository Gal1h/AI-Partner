import { useState, useEffect, useCallback } from 'react';
import { ttsApi } from '../services/api';
import type { TtsVoice, TtsSettings, TtsState } from '../types';

export function useTts() {
  const [ttsState, setTtsState] = useState<TtsState>({
    isSpeaking: false,
    settings: { rate: 1.0, volume: 1.0, pitch: 1.0 },
    availableVoices: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVoices = useCallback(async () => {
    try {
      setLoading(true);
      const voices = await ttsApi.getVoices();
      setTtsState(prev => ({ ...prev, availableVoices: voices }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load voices');
    } finally {
      setLoading(false);
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    try {
      setError(null);
      setTtsState(prev => ({ ...prev, isSpeaking: true }));
      await ttsApi.speak(text);
      setTtsState(prev => ({ ...prev, isSpeaking: false }));
    } catch (e) {
      setTtsState(prev => ({ ...prev, isSpeaking: false }));
      setError(e instanceof Error ? e.message : 'Failed to speak');
      throw e;
    }
  }, []);

  const stopSpeaking = useCallback(async () => {
    try {
      await ttsApi.stopSpeaking();
      setTtsState(prev => ({ ...prev, isSpeaking: false }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to stop speaking');
    }
  }, []);

  const setVoice = useCallback(async (voiceId: string) => {
    try {
      await ttsApi.setVoice(voiceId);
      setTtsState(prev => ({ ...prev, settings: { ...prev.settings, voiceId } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to set voice');
    }
  }, []);

  const setRate = useCallback(async (rate: number) => {
    try {
      await ttsApi.setRate(rate);
      setTtsState(prev => ({ ...prev, settings: { ...prev.settings, rate } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to set rate');
    }
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await ttsApi.setVolume(volume);
      setTtsState(prev => ({ ...prev, settings: { ...prev.settings, volume } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to set volume');
    }
  }, []);

  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  return {
    ttsState,
    loading,
    error,
    loadVoices,
    speak,
    stopSpeaking,
    setVoice,
    setRate,
    setVolume,
  };
}