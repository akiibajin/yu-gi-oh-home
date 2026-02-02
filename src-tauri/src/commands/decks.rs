use crate::{services, AppState};

#[derive(serde::Deserialize)]
pub struct LoadDeckCardsRequest {
	pub path: String,
}

#[derive(serde::Deserialize)]
pub struct LoadDeckCardsFromBytesRequest {
	pub bytes: Vec<u8>,
}

#[tauri::command]
pub async fn load_deck_cards_from_ydk(
	state: tauri::State<'_, AppState>,
	req: LoadDeckCardsRequest,
) -> Result<services::decks::LoadDeckCardsResponse, String> {
	let guard = state.db.lock().await;
	let pool = guard
		.as_ref()
		.ok_or_else(|| "Database not configured yet".to_string())?;

	let supabase = {
		let url = state.supabase_url.lock().await.clone();
		let key = state.supabase_service_role_key.lock().await.clone();
		match (url, key) {
			(Some(url), Some(service_role_key)) => Some(services::storage::SupabaseStorageConfig {
				url,
				service_role_key,
				bucket: "images".to_string(),
			}),
			_ => None,
		}
	};

	services::decks::load_deck_cards_from_ydk(pool, &req.path, supabase.as_ref())
		.await
		.map_err(|e| format!("{e:#}"))
}

#[tauri::command]
pub async fn load_deck_cards_from_ydk_bytes(
	state: tauri::State<'_, AppState>,
	req: LoadDeckCardsFromBytesRequest,
) -> Result<services::decks::LoadDeckCardsResponse, String> {
	let guard = state.db.lock().await;
	let pool = guard
		.as_ref()
		.ok_or_else(|| "Database not configured yet".to_string())?;

	let supabase = {
		let url = state.supabase_url.lock().await.clone();
		let key = state.supabase_service_role_key.lock().await.clone();
		match (url, key) {
			(Some(url), Some(service_role_key)) => Some(services::storage::SupabaseStorageConfig {
				url,
				service_role_key,
				bucket: "images".to_string(),
			}),
			_ => None,
		}
	};

	let contents = String::from_utf8(req.bytes)
		.map_err(|_| "Invalid .ydk file encoding (expected UTF-8)".to_string())?;

	services::decks::load_deck_cards_from_ydk_contents(pool, &contents, supabase.as_ref())
		.await
		.map_err(|e| format!("{e:#}"))
}
