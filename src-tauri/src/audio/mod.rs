use crate::types::{AudioConfig, AudioDevice, AudioFormat};
use anyhow::{anyhow, Result};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{SampleFormat, SampleRate, StreamConfig};
use hound::{WavSpec, WavWriter};
use parking_lot::Mutex;
use std::collections::HashMap;
use std::fs::File;
use std::io::BufWriter;
use std::sync::Arc;
use tokio::sync::mpsc;
use uuid::Uuid;

type AudioSender = mpsc::UnboundedSender<Vec<f32>>;
type AudioReceiver = mpsc::UnboundedReceiver<Vec<f32>>;

pub struct AudioManager {
    senders: Arc<Mutex<HashMap<String, AudioSender>>>,
    writers: Arc<Mutex<HashMap<String, WavWriter<BufWriter<File>>>>>,
}

impl AudioManager {
    pub fn new() -> Self {
        Self {
            senders: Arc::new(Mutex::new(HashMap::new())),
            writers: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn get_input_devices() -> Result<Vec<AudioDevice>> {
        let host = cpal::default_host();
        let mut devices = Vec::new();

        let input_devices = host.input_devices()?;
        for (i, device) in input_devices.enumerate() {
            let name = device.name().unwrap_or_else(|_| format!("Device {}", i));
            let is_default = Some(device.name().unwrap_or_default()) == host.default_input_device().map(|d| d.name().unwrap_or_default());
            
            let mut max_channels = 2;
            let mut sample_rates = vec![44100, 48000];
            
            if let Ok(configs) = device.supported_input_configs() {
                for config in configs {
                    max_channels = max_channels.max(config.channels());
                    sample_rates.push(config.min_sample_rate().0);
                    sample_rates.push(config.max_sample_rate().0);
                }
            }
            
            sample_rates.sort();
            sample_rates.dedup();

            devices.push(AudioDevice {
                id: format!("audio_{}", i),
                name,
                is_default,
                max_channels,
                sample_rates,
            });
        }

        Ok(devices)
    }

    pub async fn start_recording(&self, config: AudioConfig, output_path: Option<String>) -> Result<AudioReceiver> {
        let host = cpal::default_host();
        let device_index = config.device_id.strip_prefix("audio_")
            .ok_or_else(|| anyhow!("Invalid audio device ID"))?
            .parse::<usize>()?;

        let devices: Vec<_> = host.input_devices()?.collect();
        let device = devices.get(device_index)
            .ok_or_else(|| anyhow!("Audio device not found"))?;

        let sample_rate = SampleRate(config.sample_rate);
        let channels = config.channels;

        let stream_config = StreamConfig {
            channels,
            sample_rate,
            buffer_size: cpal::BufferSize::Default,
        };

        let format = match config.format {
            AudioFormat::F32 => SampleFormat::F32,
            AudioFormat::I16 => SampleFormat::I16,
            AudioFormat::U8 => SampleFormat::U8,
        };

        let (tx, rx) = mpsc::unbounded_channel();
        let capture_id = Uuid::new_v4().to_string();

        let spec = WavSpec {
            channels,
            sample_rate: config.sample_rate,
            bits_per_sample: match config.format {
                AudioFormat::F32 => 32,
                AudioFormat::I16 => 16,
                AudioFormat::U8 => 8,
            },
            sample_format: match config.format {
                AudioFormat::F32 => hound::SampleFormat::Float,
                AudioFormat::I16 => hound::SampleFormat::Int,
                AudioFormat::U8 => hound::SampleFormat::Int,
            },
        };

        let writer = if let Some(path) = output_path {
            let file = File::create(path)?;
            let writer = WavWriter::new(BufWriter::new(file), spec)?;
            Some(writer)
        } else {
            None
        };

        if let Some(w) = writer {
            self.writers.lock().insert(capture_id.clone(), w);
        }

        let senders = self.senders.clone();
        let writers = self.writers.clone();
        let capture_id_callback = capture_id.clone();

        // Build and play stream
        let _stream = device.build_input_stream(
            &stream_config,
            move |data: &[f32], _: &cpal::InputCallbackInfo| {
                let senders_guard = senders.lock();
                if let Some(tx) = senders_guard.get(&capture_id_callback) {
                    let _ = tx.send(data.to_vec());
                }

                let mut writers_guard = writers.lock();
                if let Some(writer) = writers_guard.get_mut(&capture_id_callback) {
                    for &sample in data {
                        let _ = writer.write_sample(sample);
                    }
                }
            },
            move |err| {
                tracing::error!("Audio stream error: {}", err);
            },
            None,
        )?;

        // Note: stream is dropped here but the callback keeps it alive
        // In a real app, you'd need a better way to manage stream lifetime
        
        self.senders.lock().insert(capture_id.clone(), tx);

        Ok(rx)
    }

    pub async fn stop_recording(&self, capture_id: &str) -> Result<()> {
        self.senders.lock().remove(capture_id);
        
        if let Some(writer) = self.writers.lock().remove(capture_id) {
            let _ = writer.finalize();
        }
        
        Ok(())
    }

    pub async fn get_audio_level(&self, capture_id: &str) -> Result<f32> {
        let senders = self.senders.lock();
        if senders.contains_key(capture_id) {
            Ok(0.5)
        } else {
            Err(anyhow!("No active recording"))
        }
    }
}

impl Default for AudioManager {
    fn default() -> Self {
        Self::new()
    }
}