use base64::{engine::general_purpose, Engine as _};
use image::DynamicImage;
use std::io::Cursor;

pub fn image_to_base64(img: &DynamicImage) -> String {
    let mut bytes = Vec::new();
    img.write_to(&mut Cursor::new(&mut bytes), image::ImageFormat::Png)
        .expect("Failed to encode image");
    general_purpose::STANDARD.encode(bytes)
}

pub fn base64_to_image(data: &str) -> Result<DynamicImage, String> {
    let bytes = general_purpose::STANDARD.decode(data)
        .map_err(|e| e.to_string())?;
    image::load_from_memory(&bytes)
        .map_err(|e| e.to_string())
}

pub fn get_app_data_dir() -> std::path::PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("ai-partner")
}

pub fn ensure_dir(path: &std::path::Path) -> Result<(), std::io::Error> {
    if !path.exists() {
        std::fs::create_dir_all(path)?;
    }
    Ok(())
}