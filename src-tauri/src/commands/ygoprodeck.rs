use crate::services;

#[tauri::command]
pub async fn fetch_ygoprodeck_card(
	name: Option<String>,
	id: Option<u64>,
) -> Result<serde_json::Value, String> {
	services::ygoprodeck::fetch_cardinfo(name, id)
		.await
		.map_err(|e| format!("{e:#}"))
}
