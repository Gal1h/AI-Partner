use crate::credentials::CredentialsManager;
use crate::types::Credential;
use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub async fn save_credential(
    credential: Credential,
    state: State<'_, CredentialsManager>,
) -> Result<Credential, String> {
    state.save_credential(credential).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_credential(
    id: String,
    state: State<'_, CredentialsManager>,
) -> Result<Option<Credential>, String> {
    state.get_credential(&id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_credential(
    id: String,
    state: State<'_, CredentialsManager>,
) -> Result<bool, String> {
    state.delete_credential(&id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_credentials(
    state: State<'_, CredentialsManager>,
) -> Result<Vec<Credential>, String> {
    state.list_credentials().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn test_credential(
    service: String,
    username: String,
    password: String,
    state: State<'_, CredentialsManager>,
) -> Result<bool, String> {
    state.test_credential(&service, &username, &password).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_credential(
    service: String,
    username: String,
    password: String,
    metadata: HashMap<String, String>,
    state: State<'_, CredentialsManager>,
) -> Result<Credential, String> {
    state.create_credential(service, username, password, metadata).await.map_err(|e| e.to_string())
}