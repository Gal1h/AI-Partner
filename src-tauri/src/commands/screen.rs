use crate::screen::ScreenCapture;
use crate::types::{Monitor, ScreenCaptureConfig};
use tauri::State;
use base64::Engine;

#[tauri::command]
pub async fn get_monitors() -> Result<Vec<Monitor>, String> {
    ScreenCapture::get_monitors().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn start_capture(
    config: ScreenCaptureConfig,
    state: State<'_, ScreenCapture>,
) -> Result<(), String> {
    let _rx = state.start_capture(config).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn stop_capture(
    capture_id: String,
    state: State<'_, ScreenCapture>,
) -> Result<(), String> {
    state.stop_capture(&capture_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn capture_screen_frame(
    monitor_id: String,
    state: State<'_, ScreenCapture>,
) -> Result<String, String> {
    let img = state.capture_frame(&monitor_id).await.map_err(|e| e.to_string())?;
    let mut bytes = Vec::new();
    img.write_to(&mut std::io::Cursor::new(&mut bytes), image::ImageFormat::Png)
        .map_err(|e| e.to_string())?;
    Ok(base64::prelude::BASE64_STANDARD.encode(&bytes))
}