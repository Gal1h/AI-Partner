use crate::audio::AudioManager;
use crate::types::{AudioConfig, AudioDevice};
use tauri::State;

#[tauri::command]
pub async fn get_input_devices() -> Result<Vec<AudioDevice>, String> {
    AudioManager::get_input_devices().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn start_recording(
    config: AudioConfig,
    output_path: Option<String>,
    state: State<'_, AudioManager>,
) -> Result<(), String> {
    let _rx = state.start_recording(config, output_path).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn stop_recording(
    capture_id: String,
    state: State<'_, AudioManager>,
) -> Result<(), String> {
    state.stop_recording(&capture_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_audio_level(
    capture_id: String,
    state: State<'_, AudioManager>,
) -> Result<f32, String> {
    state.get_audio_level(&capture_id).await.map_err(|e| e.to_string())
}