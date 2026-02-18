use crate::services;

#[derive(serde::Deserialize)]
pub struct StoreCardMakerImageRequest {
	pub id: String,
	pub bytes: Vec<u8>,
	pub folder_name: Option<String>,
}

#[derive(serde::Serialize)]
pub struct StoreCardMakerImageResponse {
	pub dir: String,
	pub filename: String,
	pub path: String,
}

#[tauri::command]
pub async fn store_card_maker_image(
	app: tauri::AppHandle,
	req: StoreCardMakerImageRequest,
) -> Result<StoreCardMakerImageResponse, String> {
	let stored = services::card_maker_images::store_card_maker_image(
		&app,
		&req.bytes,
		req.id.trim(),
		req.folder_name.as_deref(),
	)
	.map_err(|e| format!("{e:#}"))?;

	Ok(StoreCardMakerImageResponse {
		dir: stored.dir.to_string_lossy().to_string(),
		filename: stored.filename,
		path: stored.path.to_string_lossy().to_string(),
	})
}
