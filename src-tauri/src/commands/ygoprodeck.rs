use crate::services;

fn replace_minus_one_stats_with_question(card: &mut serde_json::Value) {
	for key in ["atk", "def"] {
		let should_replace = match card.get(key) {
			Some(v) if v.as_i64() == Some(-1) => true,
			Some(v) if v.as_str().is_some_and(|s| s.trim() == "-1") => true,
			_ => false,
		};

		if should_replace {
			if let Some(obj) = card.as_object_mut() {
				obj.insert(key.to_string(), serde_json::Value::String("?".to_string()));
			}
		}
	}
}

#[tauri::command]
pub async fn fetch_ygoprodeck_card(
	client: tauri::State<'_, reqwest::Client>,
	user_name: Option<String>,
	name: Option<String>,
	fname: Option<String>,
	id: Option<u64>,
) -> Result<serde_json::Value, String> {
	let _ = user_name;

	let http = client.inner().clone();
	let mut json = services::ygoprodeck::fetch_cardinfo(&http, name, fname, id)
		.await
		.map_err(|e| format!("{e:#}"))?;

	if let Some(data) = json.get_mut("data").and_then(|v| v.as_array_mut()) {
		for card in data.iter_mut() {
			replace_minus_one_stats_with_question(card);
		}
	}

	Ok(json)
}
