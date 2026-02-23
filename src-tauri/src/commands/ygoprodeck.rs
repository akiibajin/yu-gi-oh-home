use crate::{services, AppState};

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

async fn download_as_webp_data_url(source_url: &str, quality: u8) -> anyhow::Result<String> {
	use base64::Engine;

	let client = reqwest::Client::builder()
		.timeout(std::time::Duration::from_secs(30))
		.build()
		.map_err(|e| anyhow::anyhow!(e))?;

	let resp = client
		.get(source_url)
		.send()
		.await
		.map_err(|e| anyhow::anyhow!(e))?;

	let status = resp.status();
	let bytes = resp.bytes().await.map_err(|e| anyhow::anyhow!(e))?;
	if !status.is_success() {
		return Err(anyhow::anyhow!(
			"image download failed ({status}) from {source_url}"
		));
	}

	let webp = services::images::convert_to_webp(
		bytes.as_ref(),
		services::images::WebpOptions {
			quality: quality.min(100),
		},
	)
	.map_err(|e| anyhow::anyhow!(e))?;

	let encoded = base64::engine::general_purpose::STANDARD.encode(webp);
	Ok(format!("data:image/webp;base64,{encoded}"))
}

fn db_card_to_ygopro_value(card: services::cards::YugiohCard) -> serde_json::Value {
	let id_num = card.id.parse::<u64>().ok();
	let id_value = id_num
		.map(serde_json::Value::from)
		.unwrap_or_else(|| serde_json::Value::from(card.id.clone()));

	let mut obj = serde_json::Map::<String, serde_json::Value>::new();
	obj.insert("id".to_string(), id_value);
	obj.insert("name".to_string(), serde_json::Value::String(card.name));
	obj.insert("desc".to_string(), serde_json::Value::String(card.description));
	obj.insert(
		"type".to_string(),
		serde_json::Value::String(card.monster_type.unwrap_or(card.card_type)),
	);
	obj.insert("level".to_string(), serde_json::Value::from(card.level));
	obj.insert("atk".to_string(), serde_json::Value::from(card.atk));
	obj.insert("def".to_string(), serde_json::Value::from(card.def));

	if let Some(v) = card.sub_type {
		obj.insert("race".to_string(), serde_json::Value::String(v));
	}
	if let Some(v) = card.attribute {
		obj.insert("attribute".to_string(), serde_json::Value::String(v));
	}
	if let Some(v) = card.link_rating {
		obj.insert("linkval".to_string(), serde_json::Value::from(v));
	}
	if let Some(v) = card.link_markers {
		obj.insert("linkmarkers".to_string(), serde_json::Value::from(v));
	}

	let images = match card.img_url {
		Some(url) if !url.trim().is_empty() => serde_json::json!([
			{ "image_url": url, "image_url_cropped": url }
		]),
		_ => serde_json::json!([]),
	};
	obj.insert("card_images".to_string(), images);

	serde_json::Value::Object(obj)
}

fn set_card_images_webp(card: &mut serde_json::Value, public_url: &str) {
	let url = serde_json::Value::String(public_url.to_string());
	match card.get_mut("card_images").and_then(|v| v.as_array_mut()) {
		Some(arr) => {
			if let Some(first) = arr.first_mut().and_then(|v| v.as_object_mut()) {
				first.insert("image_url".to_string(), url.clone());
				first.insert("image_url_cropped".to_string(), url);
			} else {
				*arr = vec![serde_json::json!({
					"image_url": public_url,
					"image_url_cropped": public_url
				})];
			}
		}
		None => {
			card.as_object_mut().map(|obj| {
				obj.insert(
					"card_images".to_string(),
					serde_json::json!([
						{ "image_url": public_url, "image_url_cropped": public_url }
					]),
				);
			});
		}
	}
}

#[tauri::command]
pub async fn fetch_ygoprodeck_card(
	state: tauri::State<'_, AppState>,
	user_name: Option<String>,
	name: Option<String>,
	fname: Option<String>,
	id: Option<u64>,
) -> Result<serde_json::Value, String> {
	let pool_opt = { state.db.lock().await.clone() };

	if let Some(pool) = pool_opt.as_ref() {
		if let Some(i) = id {
			if let Ok(Some(card)) = services::cards::fetch_yugioh_card_by_id(pool, &i.to_string()).await {
				return Ok(serde_json::json!({
					"data": [db_card_to_ygopro_value(card)]
				}));
			}
		} else if let Some(ref n) = name {
			if let Ok(cards) = services::cards::fetch_yugioh_cards_by_name(pool, n).await {
				if !cards.is_empty() {
					let data: Vec<serde_json::Value> = cards.into_iter().map(db_card_to_ygopro_value).collect();
					return Ok(serde_json::json!({ "data": data }));
				}
			}
		} else if let Some(ref f) = fname {
			if let Ok(cards) = services::cards::fetch_yugioh_cards_by_fname(pool, f).await {
				if !cards.is_empty() {
					let data: Vec<serde_json::Value> = cards.into_iter().map(db_card_to_ygopro_value).collect();
					return Ok(serde_json::json!({ "data": data }));
				}
			}
		}
	}

	let mut json = services::ygoprodeck::fetch_cardinfo(name, fname, id)
		.await
		.map_err(|e| format!("{e:#}"))?;

	let pool = match pool_opt {
		Some(pool) => pool,
		None => return Ok(json),
	};

	let user_id = match user_name.as_deref() {
		Some(n) if !n.trim().is_empty() => services::users::get_or_create_user_id_by_name(&pool, n)
			.await
			.ok()
			.flatten(),
		_ => None,
	};

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

	if let Some(data) = json.get_mut("data").and_then(|v| v.as_array_mut()) {
		for card in data.iter_mut() {
			replace_minus_one_stats_with_question(card);

			let mut req = match services::normalize::ygoprodeck_card_to_store_req(&*card) {
				Ok(req) => req,
				Err(_) => continue,
			};

			let card_id = req.id.clone();
			let source_img_url = req.img_url.clone();
			req.user_id = user_id.clone();

			// Always convert API-fetched images to WebP.
			let mut webp_url: Option<String> = None;
			if let Some(source_url) = source_img_url.clone().filter(|u| !u.trim().is_empty()) {
				if let Some(sb) = supabase.as_ref() {
					let public_prefix = format!(
						"{}/storage/v1/object/public/",
						sb.url.trim_end_matches('/')
					);
					if source_url.starts_with(&public_prefix) {
						webp_url = Some(source_url);
					} else {
						let path = format!("ygoprodeck/{card_id}.webp");
						if let Ok(public_url) = services::storage::cache_remote_image_as_webp(
							sb,
							&source_url,
							&path,
							90,
						)
						.await
						{
							webp_url = Some(public_url);
						}
					}
				} else if let Ok(data_url) = download_as_webp_data_url(&source_url, 90).await {
					webp_url = Some(data_url);
				}
			}

			if let Some(ref url) = webp_url {
				req.img_url = Some(url.clone());
				set_card_images_webp(card, url);
			}

			let _ = services::cards::store_yugioh_card(&pool, req).await;

			// img_url is persisted via store_yugioh_card (req.img_url)
		}
	}

	Ok(json)
}
