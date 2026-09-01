use crate::services;

#[derive(serde::Deserialize)]
pub struct FetchWikiCardDataRequest {
	pub url: String,
}

#[tauri::command]
pub async fn fetch_wiki_card_data(
	client: tauri::State<'_, reqwest::Client>,
	req: FetchWikiCardDataRequest,
) -> Result<services::fandom::WikiCardData, String> {
	let http = client.inner().clone();
	services::fandom::fetch_wiki_card_data(&http, &req.url)
		.await
		.map_err(|e| format!("{e:#}"))
}

#[derive(serde::Serialize, Debug, Clone)]
pub struct SpanishCardTextResponse {
	pub name: String,
	pub lore: String,
	pub pendulum_effect: Option<String>,
}

#[tauri::command]
pub async fn fetch_spanish_name_and_lore(
	client: tauri::State<'_, reqwest::Client>,
	title: String,
) -> Result<Option<SpanishCardTextResponse>, String> {
	let http = client.inner().clone();
	services::fandom::fetch_spanish_name_and_lore(&http, &title)
		.await
		.map_err(|e| format!("{e:#}"))
		.map(|opt| opt.map(|es| SpanishCardTextResponse {
			name: es.name,
			lore: es.lore,
			pendulum_effect: es.pendulum_effect,
		}))
}
