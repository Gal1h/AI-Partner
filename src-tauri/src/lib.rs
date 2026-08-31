use std::sync::Arc;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let screen_capture = crate::screen::ScreenCapture::new();
    let camera_manager = crate::camera::CameraManager::new();
    let audio_manager = crate::audio::AudioManager::new();
    let tts_manager = Arc::new(crate::tts::TtsManager::new());
    let credentials_manager = Arc::new(crate::credentials::CredentialsManager::new());

    let tts_manager_clone = tts_manager.clone();
    let credentials_manager_clone = credentials_manager.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .manage(screen_capture)
        .manage(camera_manager)
        .manage(audio_manager)
        .manage(tts_manager)
        .manage(credentials_manager)
        .invoke_handler(tauri::generate_handler![
            commands::screen::get_monitors,
            commands::screen::start_capture,
            commands::screen::stop_capture,
            commands::screen::capture_screen_frame,
            commands::camera::get_cameras,
            commands::camera::start_camera,
            commands::camera::stop_camera,
            commands::camera::capture_camera_frame,
            commands::audio::get_input_devices,
            commands::audio::start_recording,
            commands::audio::stop_recording,
            commands::audio::get_audio_level,
            commands::tts::get_voices,
            commands::tts::speak,
            commands::tts::stop_speaking,
            commands::tts::set_voice,
            commands::tts::set_rate,
            commands::tts::set_volume,
            commands::credentials::save_credential,
            commands::credentials::get_credential,
            commands::credentials::delete_credential,
            commands::credentials::list_credentials,
            commands::credentials::test_credential,
            commands::credentials::create_credential,
        ])
        .setup(move |app| {
            let _ = app.handle().plugin(tauri_plugin_log::Builder::new().build());
            
            let app_handle = app.handle().clone();
            credentials_manager_clone.set_app_handle(app_handle.clone());
            
            tauri::async_runtime::spawn(async move {
                let _ = tts_manager_clone.initialize().await;
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub mod screen;
pub mod camera;
pub mod audio;
pub mod tts;
pub mod credentials;
pub mod commands;
pub mod types;
pub mod utils;