use crate::{services, AppState};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct CurrentBackgroundResponse {
	pub name: String,
	pub img_url: String,
}

#[tauri::command]
pub async fn set_current_background(
	state: tauri::State<'_, AppState>,
	name: String,
	img_url: String,
) -> Result<(), String> {
	let guard = state.db.lock().await;
	let pool = guard
		.as_ref()
		.ok_or_else(|| "Database not configured yet".to_string())?;

	services::background::set_current_background(pool, &name, &img_url)
		.await
		.map_err(|e| format!("{e:#}"))
}

#[tauri::command]
pub async fn get_current_background(
	state: tauri::State<'_, AppState>,
) -> Result<CurrentBackgroundResponse, String> {
	let guard = state.db.lock().await;
	let pool = guard
		.as_ref()
		.ok_or_else(|| "Database not configured yet".to_string())?;

	let bg = services::background::get_current_background(pool)
		.await
		.map_err(|e| format!("{e:#}"))?;

	Ok(CurrentBackgroundResponse {
		name: bg.name,
		img_url: bg.img_url,
	})
}
