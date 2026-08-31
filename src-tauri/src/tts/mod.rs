use crate::types::{TtsSettings, TtsVoice};
use anyhow::{anyhow, Result};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::process::Command as TokioCommand;
use tokio::sync::Mutex;

pub struct TtsManager {
    settings: Arc<Mutex<TtsSettings>>,
    voices: Arc<Mutex<Vec<TtsVoice>>>,
    current_process: Arc<Mutex<Option<tokio::process::Child>>>,
}

impl TtsManager {
    pub fn new() -> Self {
        Self {
            settings: Arc::new(Mutex::new(TtsSettings::default())),
            voices: Arc::new(Mutex::new(Vec::new())),
            current_process: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn initialize(&self) -> Result<()> {
        let mut voices = Vec::new();
        
        // Try to get voices from espeak-ng
        if let Ok(output) = TokioCommand::new("espeak-ng").args(["--voices"]).output().await {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for (i, line) in stdout.lines().skip(1).enumerate() {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if parts.len() >= 3 {
                        voices.push(TtsVoice {
                            id: format!("voice_{}", i),
                            name: parts[1].to_string(),
                            language: parts[2].to_string(),
                            gender: parts.get(3).map(|s| s.to_string()),
                            is_default: i == 0,
                        });
                    }
                }
            }
        }
        
        // Fallback voices
        if voices.is_empty() {
            voices = vec![
                TtsVoice { id: "voice_0".to_string(), name: "Default".to_string(), language: "en".to_string(), gender: None, is_default: true },
                TtsVoice { id: "voice_1".to_string(), name: "English".to_string(), language: "en".to_string(), gender: Some("male".to_string()), is_default: false },
                TtsVoice { id: "voice_2".to_string(), name: "English (Female)".to_string(), language: "en".to_string(), gender: Some("female".to_string()), is_default: false },
            ];
        }
        
        *self.voices.lock().await = voices;
        Ok(())
    }

    pub async fn get_voices(&self) -> Result<Vec<TtsVoice>> {
        if self.voices.lock().await.is_empty() {
            self.initialize().await?;
        }
        Ok(self.voices.lock().await.clone())
    }

    pub async fn speak(&self, text: &str) -> Result<()> {
        self.stop_speaking().await?;
        
        let settings = self.settings.lock().await.clone();
        let voice_id = settings.voice_id.clone().unwrap_or_else(|| "voice_0".to_string());
        let rate = settings.rate;
        let volume = settings.volume;
        
        // Extract voice index
        let voice_idx = voice_id.strip_prefix("voice_")
            .and_then(|s| s.parse::<usize>().ok())
            .unwrap_or(0);
        
        let voices = self.voices.lock().await.clone();
        let voice = voices.get(voice_idx).cloned().unwrap_or_else(|| TtsVoice {
            id: "voice_0".to_string(),
            name: "Default".to_string(),
            language: "en".to_string(),
            gender: None,
            is_default: true,
        });
        
        // Use spd-say (speech-dispatcher) or espeak-ng
        let mut child = TokioCommand::new("spd-say")
            .args([
                "-r", &format!("{}", (rate * 100.0) as i32),
                "-v", &voice.name,
                "-p", &format!("{}", (volume * 100.0) as i32),
                text,
            ])
            .spawn();
        
        if child.is_err() {
            // Fallback to espeak-ng
            child = TokioCommand::new("espeak-ng")
                .args([
                    "-s", &format!("{}", (rate * 175.0) as i32),
                    "-a", &format!("{}", (volume * 100.0) as i32),
                    "-v", &voice.language,
                    text,
                ])
                .spawn();
        }
        
        *self.current_process.lock().await = Some(child?);
        Ok(())
    }

    pub async fn stop_speaking(&self) -> Result<()> {
        let mut process_guard = self.current_process.lock().await;
        if let Some(mut child) = process_guard.take() {
            let _ = child.kill().await;
        }
        Ok(())
    }

    pub async fn set_voice(&self, voice_id: &str) -> Result<()> {
        let mut settings = self.settings.lock().await;
        settings.voice_id = Some(voice_id.to_string());
        Ok(())
    }

    pub async fn set_rate(&self, rate: f32) -> Result<()> {
        let mut settings = self.settings.lock().await;
        settings.rate = rate.clamp(0.1, 3.0);
        Ok(())
    }

    pub async fn set_volume(&self, volume: f32) -> Result<()> {
        let mut settings = self.settings.lock().await;
        settings.volume = volume.clamp(0.0, 1.0);
        Ok(())
    }

    pub async fn get_settings(&self) -> TtsSettings {
        self.settings.lock().await.clone()
    }
}

impl Default for TtsManager {
    fn default() -> Self {
        Self::new()
    }
}