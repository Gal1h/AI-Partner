use crate::tts::TtsManager;
use crate::types::{TtsSettings, TtsVoice};
use tauri::State;

#[tauri::command]
pub async fn get_voices(state: State<'_, TtsManager>) -> Result<Vec<TtsVoice>, String> {
    state.get_voices().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn speak(text: String, state: State<'_, TtsManager>) -> Result<(), String> {
    state.speak(&text).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn stop_speaking(state: State<'_, TtsManager>) -> Result<(), String> {
    state.stop_speaking().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_voice(voice_id: String, state: State<'_, TtsManager>) -> Result<(), String> {
    state.set_voice(&voice_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_rate(rate: f32, state: State<'_, TtsManager>) -> Result<(), String> {
    state.set_rate(rate).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_volume(volume: f32, state: State<'_, TtsManager>) -> Result<(), String> {
    state.set_volume(volume).await.map_err(|e| e.to_string())
}