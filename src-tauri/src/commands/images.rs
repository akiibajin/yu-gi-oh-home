use crate::services;

#[derive(serde::Deserialize)]
pub struct ConvertToWebpRequest {
	pub bytes: Vec<u8>,
	/// WebP quality from 0..=100. Defaults to 90.
	pub quality: Option<u8>,
}

#[derive(serde::Serialize)]
pub struct ConvertToWebpResponse {
	pub bytes: Vec<u8>,
	pub mime: &'static str,
}

#[derive(serde::Deserialize)]
pub struct DownloadImageBytesRequest {
	pub url: String,
}

#[tauri::command]
pub async fn convert_image_to_webp(req: ConvertToWebpRequest) -> Result<ConvertToWebpResponse, String> {
	let quality = req.quality.unwrap_or(90);
	let quality = quality.min(100);

	let bytes = services::images::convert_to_webp(
		&req.bytes,
		services::images::WebpOptions { quality },
	)
	.map_err(|e| format!("{e:#}"))?;

	Ok(ConvertToWebpResponse {
		bytes,
		mime: "image/webp",
	})
}

#[tauri::command]
pub async fn download_image_bytes(
	client: tauri::State<'_, reqwest::Client>,
	req: DownloadImageBytesRequest,
) -> Result<Vec<u8>, String> {
	let http = client.inner().clone();
	services::images::download_bytes(&http, &req.url)
		.await
		.map_err(|e| format!("{e:#}"))
}
