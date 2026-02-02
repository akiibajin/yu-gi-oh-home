use crate::{db, AppState};

#[tauri::command]
pub async fn db_healthcheck(state: tauri::State<'_, AppState>) -> Result<(), String> {
	let guard = state.db.lock().await;
	let pool = guard
		.as_ref()
		.ok_or_else(|| "Database not configured yet".to_string())?;
	db::healthcheck(pool).await.map_err(|e| format!("{e:#}"))
}

#[tauri::command]
pub async fn set_database_url(
	state: tauri::State<'_, AppState>,
	url: String,
) -> Result<(), String> {
	let trimmed = url.trim();
	if trimmed.is_empty() {
		return Err("Connection string is empty".to_string());
	}
	let pool = db::init_db(trimmed).await.map_err(|e| format!("{e:#}"))?;
	*state.db.lock().await = Some(pool);
	Ok(())
}
