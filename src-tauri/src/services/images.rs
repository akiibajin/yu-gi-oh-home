use anyhow::Context;

pub struct WebpOptions {
	/// WebP quality from 0..=100 (higher is better quality / larger files).
	pub quality: u8,
}

pub fn convert_to_webp(input: &[u8], opts: WebpOptions) -> anyhow::Result<Vec<u8>> {
	let dyn_img = image::load_from_memory(input).context("failed to decode input image")?;
	let rgba = dyn_img.to_rgba8();
	let (width, height) = rgba.dimensions();

	let quality = (opts.quality as f32).clamp(0.0, 100.0);
	let encoded = webp::Encoder::from_rgba(rgba.as_raw(), width, height)
		.encode(quality);
	Ok(encoded.to_vec())
}
