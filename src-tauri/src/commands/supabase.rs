use crate::{persisted_config, AppState};

#[derive(serde::Serialize)]
pub struct SupabaseConfigResponse {
	pub url: Option<String>,
	pub configured: bool,
}

#[tauri::command]
pub async fn get_supabase_url(
	state: tauri::State<'_, AppState>,
) -> Result<SupabaseConfigResponse, String> {
	let url = state.supabase_url.lock().await.clone();
	Ok(SupabaseConfigResponse {
		configured: url.is_some(),
		url,
	})
}

#[tauri::command]
pub async fn set_supabase_config(
	app: tauri::AppHandle,
	state: tauri::State<'_, AppState>,
	url: String,
	service_role_key: String,
) -> Result<(), String> {
	let url = url.trim();
	let key = service_role_key.trim();
	if url.is_empty() {
		return Err("Supabase URL is empty".to_string());
	}
	if key.is_empty() {
		return Err("Supabase service role key is empty".to_string());
	}

	persisted_config::save_supabase_config(&app, url, key).map_err(|e| format!("{e:#}"))?;
	*state.supabase_url.lock().await = Some(url.to_string());
	*state.supabase_service_role_key.lock().await = Some(key.to_string());
	Ok(())
}
