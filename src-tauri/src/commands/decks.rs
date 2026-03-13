use crate::services;

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
	req: LoadDeckCardsRequest,
) -> Result<services::decks::LoadDeckCardsResponse, String> {
	services::decks::load_deck_cards_from_ydk(&req.path)
		.await
		.map_err(|e| format!("{e:#}"))
}

#[tauri::command]
pub async fn load_deck_cards_from_ydk_bytes(
	req: LoadDeckCardsFromBytesRequest,
) -> Result<services::decks::LoadDeckCardsResponse, String> {
	let contents = String::from_utf8(req.bytes)
		.map_err(|_| "Invalid .ydk file encoding (expected UTF-8)".to_string())?;

	services::decks::load_deck_cards_from_ydk_contents(&contents)
		.await
		.map_err(|e| format!("{e:#}"))
}
