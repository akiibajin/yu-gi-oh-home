use crate::services;

#[derive(serde::Deserialize)]
pub struct StoreCardMakerImageRequest {
	pub id: String,
	pub bytes: Vec<u8>,
	pub folder_name: Option<String>,
	pub format: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct GetCardMakerImagesDirRequest {
	#[serde(default, alias = "folderName", alias = "folder_name")]
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
		req.format.as_deref(),
	)
	.map_err(|e| format!("{e:#}"))?;

	Ok(StoreCardMakerImageResponse {
		dir: stored.dir.to_string_lossy().to_string(),
		filename: stored.filename,
		path: stored.path.to_string_lossy().to_string(),
	})
}

#[tauri::command]
pub async fn get_card_maker_images_dir(
	app: tauri::AppHandle,
	req: GetCardMakerImagesDirRequest,
) -> Result<String, String> {
	let dir = services::card_maker_images::card_maker_images_target_dir(
		&app,
		req.folder_name.as_deref(),
	)
	.map_err(|e| format!("{e:#}"))?;
	Ok(dir.to_string_lossy().to_string())
}
