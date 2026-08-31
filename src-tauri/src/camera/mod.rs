use crate::types::{CameraConfig, CameraDevice};
use anyhow::{anyhow, Result};
use image::DynamicImage;
use std::collections::HashMap;
use std::io::Read;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use uuid::Uuid;
use v4l::video::Capture;

type CameraSender = mpsc::UnboundedSender<DynamicImage>;
type CameraReceiver = mpsc::UnboundedReceiver<DynamicImage>;

pub struct CameraManager {
    devices: Arc<Mutex<HashMap<String, v4l::Device>>>,
    senders: Arc<Mutex<HashMap<String, CameraSender>>>,
}

impl CameraManager {
    pub fn new() -> Self {
        Self {
            devices: Arc::new(Mutex::new(HashMap::new())),
            senders: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn get_cameras() -> Result<Vec<CameraDevice>> {
        let mut cameras = Vec::new();
        
        for i in 0..64 {
            if let Ok(device) = v4l::Device::new(i) {
                if let Ok(caps) = device.query_caps() {
                    let width = 640;
                    let height = 480;
                    let fps = 30;
                    let mut format_str = "MJPEG".to_string();
                    
                    if let Ok(fmt) = device.format() {
                        let fourcc = fmt.fourcc;
                        format_str = if fourcc == v4l::FourCC::new(b"MJPG") {
                            "MJPEG"
                        } else if fourcc == v4l::FourCC::new(b"YUYV") {
                            "YUYV"
                        } else if fourcc == v4l::FourCC::new(b"H264") {
                            "H264"
                        } else {
                            "Unknown"
                        }.to_string();
                    }
                    
                    let name = String::from_utf8_lossy(caps.card.as_bytes()).trim_end_matches('\0').to_string();
                    
                    cameras.push(CameraDevice {
                        id: format!("camera_{}", i),
                        name: if name.is_empty() { format!("Camera {}", i) } else { name },
                        width,
                        height,
                        fps,
                        format: format_str,
                    });
                }
            }
        }

        Ok(cameras)
    }

    pub async fn start_camera(&self, config: CameraConfig) -> Result<CameraReceiver> {
        let device_index = config.device_id.strip_prefix("camera_")
            .ok_or_else(|| anyhow!("Invalid camera ID"))?
            .parse::<usize>()?;

        let mut device = v4l::Device::new(device_index)?;
        
        let fmt = v4l::Format::new(config.width, config.height, v4l::FourCC::new(b"MJPG"));
        device.set_format(&fmt)?;
        
        let actual_fmt = device.format()?;
        
        // Calculate buffer size from stride and height
        let buffer_size = (actual_fmt.stride as usize) * (actual_fmt.height as usize);
        
        let (tx, rx) = mpsc::unbounded_channel();
        let capture_id = Uuid::new_v4().to_string();

        self.devices.lock().await.insert(capture_id.clone(), device);
        self.senders.lock().await.insert(capture_id.clone(), tx);

        let devices = self.devices.clone();
        let senders = self.senders.clone();
        let capture_id_clone = capture_id.clone();

        tokio::spawn(async move {
            loop {
                let frame_data = {
                    let mut devices_guard = devices.lock().await;
                    if let Some(dev) = devices_guard.get_mut(&capture_id_clone) {
                        let mut buf = vec![0u8; buffer_size];
                        match dev.read(&mut buf) {
                            Ok(_) => Some(buf),
                            Err(e) => {
                                tracing::error!("Camera read error: {}", e);
                                None
                            }
                        }
                    } else {
                        None
                    }
                };

                if let Some(data) = frame_data {
                    if let Ok(img) = Self::data_to_image(&data, actual_fmt.width, actual_fmt.height) {
                        let senders_guard = senders.lock().await;
                        if let Some(tx) = senders_guard.get(&capture_id_clone) {
                            if tx.send(img).is_err() {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                } else {
                    let devices_guard = devices.lock().await;
                    if !devices_guard.contains_key(&capture_id_clone) {
                        break;
                    }
                }
                
                tokio::time::sleep(std::time::Duration::from_millis(33)).await;
            }
        });

        Ok(rx)
    }

    pub async fn stop_camera(&self, capture_id: &str) -> Result<()> {
        self.devices.lock().await.remove(capture_id);
        self.senders.lock().await.remove(capture_id);
        Ok(())
    }

    pub async fn capture_frame(&self, device_id: &str) -> Result<DynamicImage> {
        let device_index = device_id.strip_prefix("camera_")
            .ok_or_else(|| anyhow!("Invalid camera ID"))?
            .parse::<usize>()?;

        let mut device = v4l::Device::new(device_index)?;
        
        let fmt = device.format()?;
        let buffer_size = (fmt.stride as usize) * (fmt.height as usize);
        let mut buf = vec![0u8; buffer_size];
        device.read(&mut buf)?;
        
        Self::data_to_image(&buf, fmt.width, fmt.height)
    }

    fn data_to_image(data: &[u8], _width: u32, _height: u32) -> Result<DynamicImage> {
        let img = image::load_from_memory(data)?;
        Ok(img)
    }
}

impl Default for CameraManager {
    fn default() -> Self {
        Self::new()
    }
}