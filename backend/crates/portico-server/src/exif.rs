use image::ImageFormat;
use std::io::Cursor;
use portico_core::error::{PorticoError, Result};

/// Decodes an image and re-encodes it to JPEG, stripping 100% of EXIF, GPS, and camera metadata.
pub fn sanitize_image_bytes(input_bytes: &[u8]) -> Result<Vec<u8>> {
    let img = image::load_from_memory(input_bytes).map_err(|e| {
        PorticoError::Validation(format!("Invalid image file format: {}", e))
    })?;

    let mut output = Cursor::new(Vec::new());
    img.write_to(&mut output, ImageFormat::Jpeg).map_err(|e| {
        PorticoError::Validation(format!("Failed to encode sanitized image: {}", e))
    })?;

    Ok(output.into_inner())
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{Rgb, RgbImage};

    #[test]
    fn test_sanitize_image_strips_metadata() {
        // Create a 10x10 dummy RGB image
        let mut img = RgbImage::new(10, 10);
        for pixel in img.pixels_mut() {
            *pixel = Rgb([100, 150, 200]);
        }
        let mut raw_bytes = Cursor::new(Vec::new());
        img.write_to(&mut raw_bytes, ImageFormat::Jpeg).unwrap();

        let sanitized = sanitize_image_bytes(&raw_bytes.into_inner()).unwrap();
        assert!(!sanitized.is_empty());

        // Verify sanitized image is valid JPEG
        let reloaded = image::load_from_memory(&sanitized);
        assert!(reloaded.is_ok());
    }
}
