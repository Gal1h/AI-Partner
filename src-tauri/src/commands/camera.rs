use crate::camera::CameraManager;
use crate::types::{CameraConfig, CameraDevice};
use tauri::State;
use base64::Engine;

#[tauri::command]
pub async fn get_cameras() -> Result<Vec<CameraDevice>, String> {
    CameraManager::get_cameras().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn start_camera(
    config: CameraConfig,
    state: State<'_, CameraManager>,
) -> Result<(), String> {
    let _rx = state.start_camera(config).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn stop_camera(
    capture_id: String,
    state: State<'_, CameraManager>,
) -> Result<(), String> {
    state.stop_camera(&capture_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn capture_camera_frame(
    device_id: String,
    state: State<'_, CameraManager>,
) -> Result<String, String> {
    let img = state.capture_frame(&device_id).await.map_err(|e| e.to_string())?;
    let mut bytes = Vec::new();
    img.write_to(&mut std::io::Cursor::new(&mut bytes), image::ImageFormat::Png)
        .map_err(|e| e.to_string())?;
    Ok(base64::prelude::BASE64_STANDARD.encode(&bytes))
}