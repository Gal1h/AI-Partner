use crate::types::Credential;
use anyhow::{anyhow, Result};
use keyring::Entry;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use uuid::Uuid;

const STORE_KEY: &str = "credentials";
const KEYRING_SERVICE: &str = "ai-partner";

#[derive(Debug, Clone, Serialize, Deserialize)]
struct StoredCredential {
    id: String,
    service: String,
    username: String,
    encrypted_password: String,
    metadata: HashMap<String, String>,
    created_at: chrono::DateTime<chrono::Utc>,
    updated_at: chrono::DateTime<chrono::Utc>,
}

pub struct CredentialsManager {
    app_handle: Mutex<Option<AppHandle>>,
    cache: Arc<Mutex<HashMap<String, Credential>>>,
}

impl CredentialsManager {
    pub fn new() -> Self {
        Self {
            app_handle: Mutex::new(None),
            cache: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn set_app_handle(&self, handle: AppHandle) {
        *self.app_handle.lock() = Some(handle);
    }

    fn get_store(&self) -> Result<Arc<tauri_plugin_store::Store<tauri::Wry>>> {
        self.app_handle
            .lock()
            .as_ref()
            .ok_or_else(|| anyhow!("App handle not set"))?
            .store(STORE_KEY)
            .map_err(|e| anyhow!("Failed to get store: {}", e))
    }

    fn get_keyring_entry(&self, service: &str, username: &str) -> Result<Entry> {
        Entry::new(KEYRING_SERVICE, &format!("{}:{}", service, username))
            .map_err(|e| anyhow!("Failed to create keyring entry: {}", e))
    }

    fn get_credentials_from_store(&self, store: &Arc<tauri_plugin_store::Store<tauri::Wry>>) -> Vec<StoredCredential> {
        if let Some(value) = store.get("credentials") {
            if let Ok(creds) = serde_json::from_value::<Vec<StoredCredential>>(value) {
                return creds;
            }
        }
        Vec::new()
    }

    fn save_credentials_to_store(&self, store: &Arc<tauri_plugin_store::Store<tauri::Wry>>, credentials: &[StoredCredential]) -> Result<()> {
        store.set("credentials", serde_json::to_value(credentials)?);
        store.save()?;
        Ok(())
    }

    pub async fn save_credential(&self, mut credential: Credential) -> Result<Credential> {
        let now = chrono::Utc::now();
        credential.created_at = credential.created_at.min(now);
        credential.updated_at = now;

        let entry = self.get_keyring_entry(&credential.service, &credential.username)?;
        entry.set_password(&credential.password)
            .map_err(|e| anyhow!("Failed to save password to keyring: {}", e))?;

        let stored = StoredCredential {
            id: credential.id.clone(),
            service: credential.service.clone(),
            username: credential.username.clone(),
            encrypted_password: "".to_string(),
            metadata: credential.metadata.clone(),
            created_at: credential.created_at,
            updated_at: credential.updated_at,
        };

        let store = self.get_store()?;
        let mut credentials = self.get_credentials_from_store(&store);
        
        credentials.retain(|c| c.id != credential.id);
        credentials.push(stored);
        
        self.save_credentials_to_store(&store, &credentials)?;

        self.cache.lock().insert(credential.id.clone(), credential.clone());
        Ok(credential)
    }

    pub async fn get_credential(&self, id: &str) -> Result<Option<Credential>> {
        if let Some(cached) = self.cache.lock().get(id) {
            return Ok(Some(cached.clone()));
        }

        let store = self.get_store()?;
        let credentials = self.get_credentials_from_store(&store);
        
        if let Some(stored) = credentials.iter().find(|c| c.id == id) {
            let entry = self.get_keyring_entry(&stored.service, &stored.username)?;
            let password = entry.get_password()
                .map_err(|e| anyhow!("Failed to get password from keyring: {}", e))?;

            let credential = Credential {
                id: stored.id.clone(),
                service: stored.service.clone(),
                username: stored.username.clone(),
                password,
                metadata: stored.metadata.clone(),
                created_at: stored.created_at,
                updated_at: stored.updated_at,
            };

            self.cache.lock().insert(id.to_string(), credential.clone());
            Ok(Some(credential))
        } else {
            Ok(None)
        }
    }

    pub async fn delete_credential(&self, id: &str) -> Result<bool> {
        let store = self.get_store()?;
        let mut credentials = self.get_credentials_from_store(&store);
        
        if let Some(index) = credentials.iter().position(|c| c.id == id) {
            let stored = credentials.remove(index);
            
            let entry = self.get_keyring_entry(&stored.service, &stored.username)?;
            let _ = entry.delete_credential();
            
            self.save_credentials_to_store(&store, &credentials)?;
            
            self.cache.lock().remove(id);
            Ok(true)
        } else {
            Ok(false)
        }
    }

    pub async fn list_credentials(&self) -> Result<Vec<Credential>> {
        let store = self.get_store()?;
        let stored_credentials = self.get_credentials_from_store(&store);
        
        let mut result = Vec::new();
        for stored in stored_credentials {
            let entry = self.get_keyring_entry(&stored.service, &stored.username);
            let password = entry.and_then(|e| Ok(e.get_password().ok())).unwrap_or_default();
            
            result.push(Credential {
                id: stored.id,
                service: stored.service,
                username: stored.username,
                password: password.unwrap_or_default(),
                metadata: stored.metadata,
                created_at: stored.created_at,
                updated_at: stored.updated_at,
            });
        }
        
        Ok(result)
    }

    pub async fn test_credential(&self, service: &str, username: &str, password: &str) -> Result<bool> {
        match service {
            "openai" | "anthropic" | "google" | "azure" => {
                Ok(!username.is_empty() && !password.is_empty())
            }
            _ => Ok(true),
        }
    }

    pub async fn create_credential(&self, service: String, username: String, password: String, metadata: HashMap<String, String>) -> Result<Credential> {
        let credential = Credential {
            id: Uuid::new_v4().to_string(),
            service,
            username,
            password,
            metadata,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };
        self.save_credential(credential).await
    }
}

impl Default for CredentialsManager {
    fn default() -> Self {
        Self::new()
    }
}