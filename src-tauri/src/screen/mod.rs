use crate::types::{Monitor, ScreenCaptureConfig};
use anyhow::{anyhow, Result};
use image::DynamicImage;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use uuid::Uuid;
use xcap::{Monitor as XcapMonitor};

type CaptureSender = mpsc::UnboundedSender<DynamicImage>;
type CaptureReceiver = mpsc::UnboundedReceiver<DynamicImage>;

pub struct ScreenCapture {
    monitors: Arc<Mutex<HashMap<String, XcapMonitor>>>,
    senders: Arc<Mutex<HashMap<String, CaptureSender>>>,
}

impl ScreenCapture {
    pub fn new() -> Self {
        Self {
            monitors: Arc::new(Mutex::new(HashMap::new())),
            senders: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn get_monitors() -> Result<Vec<Monitor>> {
        let monitors = XcapMonitor::all()?;
        let mut result = Vec::new();

        for (i, monitor) in monitors.iter().enumerate() {
            result.push(Monitor {
                id: format!("monitor_{}", i),
                name: format!("Monitor {}", i + 1),
                width: monitor.width().unwrap_or(0),
                height: monitor.height().unwrap_or(0),
                x: monitor.x().unwrap_or(0),
                y: monitor.y().unwrap_or(0),
                scale_factor: monitor.scale_factor().unwrap_or(1.0) as f64,
                is_primary: i == 0,
            });
        }

        Ok(result)
    }

    pub async fn start_capture(&self, config: ScreenCaptureConfig) -> Result<CaptureReceiver> {
        let monitors = XcapMonitor::all()?;
        let monitor_index = config.monitor_id.strip_prefix("monitor_")
            .ok_or_else(|| anyhow!("Invalid monitor ID"))?
            .parse::<usize>()?;

        let monitor = monitors.get(monitor_index)
            .ok_or_else(|| anyhow!("Monitor not found"))?;

        let (tx, rx) = mpsc::unbounded_channel();
        let capture_id = Uuid::new_v4().to_string();

        self.monitors.lock().await.insert(capture_id.clone(), monitor.clone());
        self.senders.lock().await.insert(capture_id.clone(), tx);

        let monitors_map = self.monitors.clone();
        let senders = self.senders.clone();
        let capture_id_clone = capture_id.clone();
        let region = config.region;
        let fps = config.fps.max(1).min(60);
        let frame_duration = std::time::Duration::from_millis(1000 / fps as u64);

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(frame_duration);
            
            loop {
                interval.tick().await;
                
                let frame = {
                    let monitors_guard = monitors_map.lock().await;
                    if let Some(mon) = monitors_guard.get(&capture_id_clone) {
                        let image = if let Some(ref r) = region {
                            mon.capture_image().ok().map(|img| {
                                image::imageops::crop_imm(&img, r.x as u32, r.y as u32, r.width, r.height).to_image()
                            })
                        } else {
                            mon.capture_image().ok()
                        };
                        image
                    } else {
                        None
                    }
                };

                if let Some(img) = frame {
                    let dyn_img = DynamicImage::ImageRgba8(img);
                    let senders_guard = senders.lock().await;
                    if let Some(tx) = senders_guard.get(&capture_id_clone) {
                        if tx.send(dyn_img).is_err() {
                            break;
                        }
                    } else {
                        break;
                    }
                } else {
                    let monitors_guard = monitors_map.lock().await;
                    if !monitors_guard.contains_key(&capture_id_clone) {
                        break;
                    }
                }
            }
        });

        Ok(rx)
    }

    pub async fn stop_capture(&self, capture_id: &str) -> Result<()> {
        self.monitors.lock().await.remove(capture_id);
        self.senders.lock().await.remove(capture_id);
        Ok(())
    }

    pub async fn capture_frame(&self, monitor_id: &str) -> Result<DynamicImage> {
        let monitors = XcapMonitor::all()?;
        let monitor_index = monitor_id.strip_prefix("monitor_")
            .ok_or_else(|| anyhow!("Invalid monitor ID"))?
            .parse::<usize>()?;

        let monitor = monitors.get(monitor_index)
            .ok_or_else(|| anyhow!("Monitor not found"))?;

        let img = monitor.capture_image()?;
        Ok(DynamicImage::ImageRgba8(img))
    }
}

impl Default for ScreenCapture {
    fn default() -> Self {
        Self::new()
    }
}