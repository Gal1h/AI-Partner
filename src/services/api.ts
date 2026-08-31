import { invoke } from '@tauri-apps/api/core';
import type {
  Monitor,
  CameraDevice,
  AudioDevice,
  TtsVoice,
  TtsSettings,
  Credential,
  ScreenCaptureConfig,
  CameraConfig,
  AudioConfig,
} from '../types';

export const screenApi = {
  getMonitors: (): Promise<Monitor[]> => invoke('get_monitors'),
  startCapture: (config: ScreenCaptureConfig): Promise<void> => invoke('start_capture', { config }),
  stopCapture: (captureId: string): Promise<void> => invoke('stop_capture', { captureId }),
  captureFrame: (monitorId: string): Promise<string> => invoke('capture_frame', { monitorId }),
};

export const cameraApi = {
  getCameras: (): Promise<CameraDevice[]> => invoke('get_cameras'),
  startCamera: (config: CameraConfig): Promise<void> => invoke('start_camera', { config }),
  stopCamera: (captureId: string): Promise<void> => invoke('stop_camera', { captureId }),
  captureFrame: (deviceId: string): Promise<string> => invoke('capture_frame', { deviceId }),
};

export const audioApi = {
  getInputDevices: (): Promise<AudioDevice[]> => invoke('get_input_devices'),
  startRecording: (config: AudioConfig, outputPath?: string): Promise<void> => 
    invoke('start_recording', { config, outputPath }),
  stopRecording: (captureId: string): Promise<void> => invoke('stop_recording', { captureId }),
  getAudioLevel: (captureId: string): Promise<number> => invoke('get_audio_level', { captureId }),
};

export const ttsApi = {
  getVoices: (): Promise<TtsVoice[]> => invoke('get_voices'),
  speak: (text: string): Promise<void> => invoke('speak', { text }),
  stopSpeaking: (): Promise<void> => invoke('stop_speaking'),
  setVoice: (voiceId: string): Promise<void> => invoke('set_voice', { voiceId }),
  setRate: (rate: number): Promise<void> => invoke('set_rate', { rate }),
  setVolume: (volume: number): Promise<void> => invoke('set_volume', { volume }),
};

export const credentialsApi = {
  saveCredential: (credential: Credential): Promise<Credential> => invoke('save_credential', { credential }),
  getCredential: (id: string): Promise<Credential | null> => invoke('get_credential', { id }),
  deleteCredential: (id: string): Promise<boolean> => invoke('delete_credential', { id }),
  listCredentials: (): Promise<Credential[]> => invoke('list_credentials'),
  testCredential: (service: string, username: string, password: string): Promise<boolean> => 
    invoke('test_credential', { service, username, password }),
  createCredential: (service: string, username: string, password: string, metadata: Record<string, string>): Promise<Credential> =>
    invoke('create_credential', { service, username, password, metadata }),
};