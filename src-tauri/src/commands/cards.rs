use crate::{services, AppState};

#[tauri::command]
pub async fn store_yugioh_card(
	state: tauri::State<'_, AppState>,
	card: services::cards::StoreYugiohCardRequest,
) -> Result<services::cards::StoreYugiohCardResponse, String> {
	let guard = state.db.lock().await;
	let pool = guard
		.as_ref()
		.ok_or_else(|| "Database not configured yet".to_string())?;

	services::cards::store_yugioh_card(pool, card)
		.await
		.map_err(|e| format!("{e:#}"))
}
