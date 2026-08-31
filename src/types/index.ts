export interface Monitor {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  scaleFactor: number;
  isPrimary: boolean;
}

export interface CameraDevice {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  format: string;
}

export interface AudioDevice {
  id: string;
  name: string;
  isDefault: boolean;
  maxChannels: number;
  sampleRates: number[];
}

export interface TtsVoice {
  id: string;
  name: string;
  language: string;
  gender?: string;
  isDefault: boolean;
}

export interface TtsSettings {
  voiceId?: string;
  rate: number;
  volume: number;
  pitch: number;
}

export interface Credential {
  id: string;
  service: string;
  username: string;
  password: string;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenCaptureConfig {
  monitorId: string;
  fps: number;
  quality: number;
  region?: CaptureRegion;
}

export interface CaptureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CameraConfig {
  deviceId: string;
  width: number;
  height: number;
  fps: number;
}

export interface AudioConfig {
  deviceId: string;
  sampleRate: number;
  channels: number;
  format: 'F32' | 'I16' | 'U8';
}

export interface AppConfig {
  screen?: ScreenCaptureConfig;
  camera?: CameraConfig;
  audio?: AudioConfig;
  tts: TtsSettings;
  autoStart: boolean;
  minimizeToTray: boolean;
}

export interface CaptureState {
  isCapturing: boolean;
  captureId?: string;
  currentFrame?: string;
  fps: number;
}

export interface CameraState {
  isActive: boolean;
  captureId?: string;
  currentFrame?: string;
  selectedDevice?: CameraDevice;
  level: number;
}

export interface AudioState {
  isRecording: boolean;
  captureId?: string;
  level: number;
  selectedDevice?: AudioDevice;
}

export interface TtsState {
  isSpeaking: boolean;
  settings: TtsSettings;
  availableVoices: TtsVoice[];
}

export type TabType = 'dashboard' | 'screen' | 'camera' | 'audio' | 'tts' | 'credentials' | 'settings';