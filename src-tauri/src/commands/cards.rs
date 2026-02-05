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

#[tauri::command]
pub async fn assign_yugioh_card_to_user(
	state: tauri::State<'_, AppState>,
	card_id: String,
	user_name: String,
) -> Result<(), String> {
	let guard = state.db.lock().await;
	let pool = guard
		.as_ref()
		.ok_or_else(|| "Database not configured yet".to_string())?;

	let user_id = services::users::get_or_create_user_id_by_name(pool, &user_name)
		.await
		.map_err(|e| format!("{e:#}"))?
		.ok_or_else(|| "User name is empty".to_string())?;

	services::cards::update_yugioh_card_user_id(pool, &card_id, Some(&user_id))
		.await
		.map_err(|e| format!("{e:#}"))
}

#[tauri::command]
pub async fn get_cards_by_user_id(
	state: tauri::State<'_, AppState>,
	user_id: String,
) -> Result<Vec<services::cards::YugiohCard>, String> {
	let guard = state.db.lock().await;
	let pool = guard
		.as_ref()
		.ok_or_else(|| "Database not configured yet".to_string())?;

	services::cards::fetch_yugioh_cards_by_user_id(&pool, &user_id)
		.await
		.map_err(|e| format!("{e:#}"))
}