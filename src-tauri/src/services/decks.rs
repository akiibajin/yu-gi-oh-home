use anyhow::Context;
use sqlx::PgPool;
use std::collections::{HashMap, HashSet};
use std::path::Path;
use std::time::Duration;

use crate::services;

#[derive(serde::Serialize, Debug, Clone, sqlx::FromRow)]
pub struct YugiohCard {
	pub id: String,
	pub name: String,
	pub card_type: String,
	pub description: String,
	pub attribute: Option<String>,

	pub monster_type: Option<String>,
	pub sub_type: Option<String>,
	pub is_tuner: Option<bool>,

	pub level: i32,
	pub atk: i32,
	pub def: i32,
	pub scale: i32,

	pub link_rating: Option<i32>,
	pub link_markers: Option<Vec<String>>,

	pub spell_type: Option<String>,
	pub trap_type: Option<String>,

	pub img_url: Option<String>,
	pub user_id: Option<String>,
}

#[derive(serde::Serialize, Debug, Clone)]
pub struct LoadDeckCardsResponse {
	/// All IDs from the deck file, in order (duplicates included).
	pub ids: Vec<String>,
	/// Cards matching `ids` order; duplicates included.
	pub cards: Vec<YugiohCard>,
    /// IDs that were not found in the database.
    pub not_found: String,
}

pub fn parse_ydk_ids(input: &str) -> Vec<u64> {
	let mut out = Vec::new();

	for raw_line in input.lines() {
		let line = raw_line.trim();
		if line.is_empty() {
			continue;
		}
		// Ignore section markers and comments.
		if line.starts_with('#') || line.starts_with('!') {
			continue;
		}

		if let Ok(id) = line.parse::<u64>() {
			// Reject ID 0 and extremely large IDs that are likely errors
			if id > 0 && id < 1_000_000_000 {
				out.push(id);
			} else {
				eprintln!("Skipping invalid card ID from .ydk: {}", id);
			}
		}
	}

	out
}

async fn process_fetched_ygoprodeck_card(
	pool: &PgPool,
	supabase: Option<&services::storage::SupabaseStorageConfig>,
	card: &serde_json::Value,
) -> anyhow::Result<()> {
	let req = services::normalize::ygoprodeck_card_to_store_req(card)?;
	let card_id = req.id.clone();
	let source_img_url = req.img_url.clone();
	services::cards::store_yugioh_card(pool, req).await?;

	if let (Some(sb), Some(source_url)) = (supabase, source_img_url) {
		let public_prefix = format!(
			"{}/storage/v1/object/public/",
			sb.url.trim_end_matches('/')
		);
		if !source_url.starts_with(&public_prefix) {
			let path = format!("ygoprodeck/{card_id}.webp");
			match services::storage::cache_remote_image_as_webp(sb, &source_url, &path, 90).await {
				Ok(public_url) => {
					if let Err(err) =
						services::cards::update_yugioh_card_img_url(pool, &card_id, &public_url).await
					{
						eprintln!("Failed to update card img_url for {card_id}: {err:#}");
					}
				}
				Err(err) => {
					eprintln!("Failed to cache image for {card_id}: {err:#}");
				}
			}
		}
	}

	Ok(())
}

pub async fn load_deck_cards_from_ydk_contents(
	pool: &PgPool,
	contents: &str,
	supabase: Option<&services::storage::SupabaseStorageConfig>,
) -> anyhow::Result<LoadDeckCardsResponse> {
	let ids_u64 = parse_ydk_ids(contents);
	if ids_u64.is_empty() {
		return Ok(LoadDeckCardsResponse {
			ids: vec![],
			cards: vec![],
            not_found: String::new(),
		});
	}

	let ids: Vec<String> = ids_u64.iter().map(|id| id.to_string()).collect();
	let unique_ids: Vec<String> = {
		let mut seen = HashSet::<String>::new();
		let mut out = Vec::new();
		for id in &ids {
			if seen.insert(id.clone()) {
				out.push(id.clone());
			}
		}
		out
	};

	let existing = fetch_cards_by_ids(pool, &unique_ids).await?;
	let existing_set: HashSet<String> = existing.iter().map(|c| c.id.clone()).collect();

	let missing_ids_u64: Vec<u64> = unique_ids
		.iter()
		.filter(|id| !existing_set.contains(*id))
		.filter_map(|id| id.parse::<u64>().ok())
		.collect();

	for (idx, chunk) in missing_ids_u64.chunks(10).enumerate() {
		let chunk_str = chunk
			.iter()
			.map(|id| id.to_string())
			.collect::<Vec<_>>()
			.join(",");
		eprintln!("Fetching YGOProDeck cards for IDs: {}", chunk_str);

		match services::ygoprodeck::fetch_cardinfo_by_ids(chunk).await {
			Ok(json) => {
				let data = json
					.get("data")
					.and_then(|v| v.as_array())
					.ok_or_else(|| anyhow::anyhow!("ygoprodeck response missing 'data' array"))?;

				for card in data {
					process_fetched_ygoprodeck_card(pool, supabase, card).await?;
				}
			}
			Err(err) => {
				eprintln!(
					"Batch fetch failed for IDs {}: {:#}. Falling back to per-ID fetch.",
					chunk_str,
					err
				);

				for id in chunk {
					match services::ygoprodeck::fetch_cardinfo(None, None, Some(*id)).await {
						Ok(json) => {
							let data = json
								.get("data")
								.and_then(|v| v.as_array())
								.ok_or_else(|| {
									anyhow::anyhow!("ygoprodeck response missing 'data' array")
								})?;

							for card in data {
								process_fetched_ygoprodeck_card(pool, supabase, card).await?;
							}
						}
						Err(single_err) => {
							eprintln!(
								"Skipping unresolved YGOProDeck id {}: {:#}",
								id,
								single_err
							);
						}
					}
				}
			}
		}

		// Wait 1 second between requests to avoid API penalties.
		if idx + 1 < (missing_ids_u64.len() + 9) / 10 {
			tokio::time::sleep(Duration::from_secs(1)).await;
		}
	}

	let all_cards = fetch_cards_by_ids(pool, &unique_ids).await?;
	let by_id: HashMap<String, YugiohCard> = all_cards
		.into_iter()
		.map(|c| (c.id.clone(), c))
		.collect();

	let mut ordered_cards = Vec::with_capacity(ids.len());
	let mut not_found = Vec::new();
	for id in &ids {
		if let Some(card) = by_id.get(id) {
			ordered_cards.push(card.clone());
		} else {
			not_found.push(id.clone());
		}
	}

	Ok(LoadDeckCardsResponse {
		ids,
		cards: ordered_cards,
        not_found: not_found.join(", "),
	})
}

async fn fetch_cards_by_ids(pool: &PgPool, ids: &[String]) -> anyhow::Result<Vec<YugiohCard>> {
	if ids.is_empty() {
		return Ok(vec![]);
	}

	sqlx::query_as::<_, YugiohCard>(
		r#"
		SELECT
			id,
			name,
			card_type,
			description,
			attribute,
			monster_type,
			sub_type,
			is_tuner,
			level,
			atk,
			def,
			scale,
			link_rating,
			link_markers,
			spell_type,
			trap_type,
			img_url,
			user_id
		FROM yugioh_cards
		WHERE id = ANY($1)
		"#,
	)
	.bind(ids)
	.persistent(false)
	.fetch_all(pool)
	.await
	.context("failed to fetch yugioh cards by ids")
}
pub async fn load_deck_cards_from_ydk(
	pool: &PgPool,
	deck_path: &str,
	supabase: Option<&services::storage::SupabaseStorageConfig>,
) -> anyhow::Result<LoadDeckCardsResponse> {
	let path = Path::new(deck_path);
	let contents = std::fs::read_to_string(path)
		.with_context(|| format!("failed to read deck file: {}", path.display()))?;

	load_deck_cards_from_ydk_contents(pool, &contents, supabase).await
}
