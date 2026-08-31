use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Monitor {
    pub id: String,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
    pub scale_factor: f64,
    pub is_primary: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraDevice {
    pub id: String,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub format: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub is_default: bool,
    pub max_channels: u16,
    pub sample_rates: Vec<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TtsVoice {
    pub id: String,
    pub name: String,
    pub language: String,
    pub gender: Option<String>,
    pub is_default: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TtsSettings {
    pub voice_id: Option<String>,
    pub rate: f32,
    pub volume: f32,
    pub pitch: f32,
}

impl Default for TtsSettings {
    fn default() -> Self {
        Self {
            voice_id: None,
            rate: 1.0,
            volume: 1.0,
            pitch: 1.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Credential {
    pub id: String,
    pub service: String,
    pub username: String,
    pub password: String,
    pub metadata: HashMap<String, String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenCaptureConfig {
    pub monitor_id: String,
    pub fps: u32,
    pub quality: u8,
    pub region: Option<CaptureRegion>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureRegion {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CameraConfig {
    pub device_id: String,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioConfig {
    pub device_id: String,
    pub sample_rate: u32,
    pub channels: u16,
    pub format: AudioFormat,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AudioFormat {
    F32,
    I16,
    U8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub screen: Option<ScreenCaptureConfig>,
    pub camera: Option<CameraConfig>,
    pub audio: Option<AudioConfig>,
    pub tts: TtsSettings,
    pub auto_start: bool,
    pub minimize_to_tray: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            screen: None,
            camera: None,
            audio: None,
            tts: TtsSettings::default(),
            auto_start: false,
            minimize_to_tray: true,
        }
    }
}