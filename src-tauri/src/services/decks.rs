use anyhow::Context;
use std::collections::{HashMap, HashSet};
use std::path::Path;

use crate::services;

#[derive(serde::Serialize, Debug, Clone)]
pub struct ExportableCardStats {
	pub level: i32,
	pub atk: String,
	pub def: String,
}

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ExportableCard {
	pub id: String,
	pub name: String,
	pub card_type: String,
	pub description: String,
	pub pendulum_description: Option<String>,
	pub attribute: String,
	pub monster_type: Option<String>,
	pub sub_type: Option<String>,
	pub is_tuner: Option<bool>,
	pub scale: Option<i32>,
	pub link_rating: Option<i32>,
	pub link_markers: Option<Vec<String>>,
	pub stats: ExportableCardStats,
	pub spell_type: Option<String>,
	pub trap_type: Option<String>,
	pub img_url: String,
}

#[derive(serde::Serialize, Debug, Clone)]
pub struct LoadDeckCardsResponse {
	/// All IDs from the deck file, in order (duplicates included).
	pub ids: Vec<String>,
	/// Cards matching `ids` order; duplicates included.
	pub cards: Vec<ExportableCard>,
	/// IDs that could not be resolved via YGOProdeck.
	pub not_found: String,
}

fn as_str_trimmed(v: Option<&serde_json::Value>) -> Option<&str> {
	v.and_then(|x| x.as_str())
		.map(|s| s.trim())
		.filter(|s| !s.is_empty())
}

fn stat_to_text(card: &serde_json::Value, key: &str) -> String {
	if let Some(v) = card.get(key) {
		if let Some(s) = v.as_str() {
			let trimmed = s.trim();
			if trimmed == "-1" {
				return "?".to_string();
			}
			if !trimmed.is_empty() {
				return trimmed.to_string();
			}
		}
		if let Some(n) = v.as_i64() {
			if n == -1 {
				return "?".to_string();
			}
			return n.to_string();
		}
	}
	"0".to_string()
}

fn normalize_monster_type_from_typeline(card: &serde_json::Value) -> Option<String> {
	let typeline = card
		.get("typeline")
		.and_then(|v| v.as_array())
		.map(|arr| {
			arr.iter()
				.filter_map(|v| v.as_str())
				.map(|s| s.trim().to_string())
				.collect::<Vec<String>>()
		})
		.unwrap_or_default();

	if typeline.is_empty() {
		let raw = as_str_trimmed(card.get("type"))?;
		let base = raw
			.replace("Monster", "")
			.replace("Card", "")
			.trim()
			.to_string();
		return Some(base).filter(|s| !s.is_empty());
	}

	let has = |tag: &str| typeline.iter().any(|s| s.eq_ignore_ascii_case(tag));
	let base = if has("Pendulum") {
		if has("Normal") {
			"Pendulum Normal"
		} else if has("Fusion") {
			"Pendulum Fusion"
		} else if has("Synchro") {
			"Pendulum Synchro"
		} else if has("Xyz") {
			"Pendulum Xyz"
		} else if has("Ritual") {
			"Pendulum Ritual"
		} else {
			"Pendulum Effect"
		}
	} else if has("Fusion") {
		"Fusion"
	} else if has("Synchro") {
		"Synchro"
	} else if has("Xyz") {
		"Xyz"
	} else if has("Link") {
		"Link"
	} else if has("Ritual") {
		"Ritual"
	} else if has("Normal") {
		"Normal"
	} else {
		"Effect"
	};

	Some(base.to_string())
}

fn ygopro_card_to_exportable(card: &serde_json::Value) -> anyhow::Result<ExportableCard> {
	let id = card
		.get("id")
		.and_then(|v| {
			v.as_u64()
				.map(|n| n.to_string())
				.or_else(|| v.as_str().map(|s| s.to_string()))
		})
		.ok_or_else(|| anyhow::anyhow!("ygoprodeck card missing id"))?;

	let name = as_str_trimmed(card.get("name"))
		.ok_or_else(|| anyhow::anyhow!("ygoprodeck card missing name"))?
		.to_string();

	let raw_type = as_str_trimmed(card.get("type")).unwrap_or("");
	let race = as_str_trimmed(card.get("race")).map(|s| s.to_string());

	let (card_type, spell_type, trap_type) = if raw_type.contains("Spell") {
		let is_field = race
			.as_deref()
			.map(|r| r.eq_ignore_ascii_case("Field"))
			.unwrap_or(false);
		(
			if is_field { "Field" } else { "Spell" }.to_string(),
			if is_field { None } else { race.clone() },
			None,
		)
	} else if raw_type.contains("Trap") {
		("Trap".to_string(), None, race.clone())
	} else {
		("Monster".to_string(), None, None)
	};

	let attribute = as_str_trimmed(card.get("attribute"))
		.unwrap_or("DARK")
		.to_string();

	let (description, pendulum_description) = {
		let desc = as_str_trimmed(card.get("desc")).unwrap_or("").to_string();
		let pend_desc = as_str_trimmed(card.get("pend_desc")).map(|s| s.to_string());
		let monster_desc = as_str_trimmed(card.get("monster_desc")).map(|s| s.to_string());
		match (pend_desc, monster_desc) {
			(Some(p), Some(m)) => (m, Some(p)),
			_ => (desc, None),
		}
	};

	let level = card
		.get("level")
		.and_then(|v| v.as_i64())
		.unwrap_or(0)
		.clamp(0, i32::MAX as i64) as i32;

	let scale = card
		.get("scale")
		.or_else(|| card.get("pscale"))
		.and_then(|v| {
			v.as_i64()
				.or_else(|| v.as_str().and_then(|s| s.trim().parse::<i64>().ok()))
		})
		.map(|v| v.clamp(0, i32::MAX as i64) as i32)
		.filter(|v| *v > 0);

	let link_rating = card
		.get("linkval")
		.and_then(|v| v.as_i64())
		.map(|v| v.clamp(0, i32::MAX as i64) as i32);

	let link_markers = card
		.get("linkmarkers")
		.and_then(|v| v.as_array())
		.map(|arr| {
			arr.iter()
				.filter_map(|v| v.as_str())
				.map(|s| s.to_string())
				.collect::<Vec<String>>()
		})
		.and_then(|markers| if markers.is_empty() { None } else { Some(markers) });

	let monster_type = if card_type == "Monster" {
		normalize_monster_type_from_typeline(card)
	} else {
		None
	};

	let is_tuner = {
		let type_str = raw_type.to_lowercase();
		let typeline_has_tuner = card
			.get("typeline")
			.and_then(|v| v.as_array())
			.map(|arr| {
				arr.iter()
					.filter_map(|v| v.as_str())
					.any(|s| s.trim().eq_ignore_ascii_case("Tuner"))
			})
			.unwrap_or(false);
		if typeline_has_tuner || type_str.contains("tuner") {
			Some(true)
		} else {
			None
		}
	};

	let sub_type = if card_type == "Monster" { race.clone() } else { None };

	let img_url = card
		.get("card_images")
		.and_then(|v| v.as_array())
		.and_then(|arr| arr.first())
		.and_then(|v| v.get("image_url_cropped").or_else(|| v.get("image_url")))
		.and_then(|v| v.as_str())
		.unwrap_or("")
		.to_string();

	Ok(ExportableCard {
		id,
		name,
		card_type,
		description,
		pendulum_description,
		attribute,
		monster_type,
		sub_type,
		is_tuner,
		scale,
		link_rating,
		link_markers,
		stats: ExportableCardStats {
			level,
			atk: stat_to_text(card, "atk"),
			def: stat_to_text(card, "def"),
		},
		spell_type,
		trap_type,
		img_url,
	})
}

pub fn parse_ydk_ids(input: &str) -> Vec<u64> {
	let mut out = Vec::new();

	for raw_line in input.lines() {
		let line = raw_line.trim();
		if line.is_empty() {
			continue;
		}
		if line.starts_with('#') || line.starts_with('!') {
			continue;
		}

		if let Ok(id) = line.parse::<u64>() {
			if id > 0 && id < 1_000_000_000 {
				out.push(id);
			} else {
				eprintln!("Skipping invalid card ID from .ydk: {}", id);
			}
		}
	}

	out
}

pub async fn load_deck_cards_from_ydk_contents(
	contents: &str,
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
	let unique_ids: Vec<u64> = {
		let mut seen = HashSet::<u64>::new();
		let mut out = Vec::new();
		for id in &ids_u64 {
			if seen.insert(*id) {
				out.push(*id);
			}
		}
		out
	};

	let mut by_id: HashMap<u64, ExportableCard> = HashMap::new();

	for chunk in unique_ids.chunks(10) {
		let json = services::ygoprodeck::fetch_cardinfo_by_ids(chunk).await?;
		let data = json
			.get("data")
			.and_then(|v| v.as_array())
			.ok_or_else(|| anyhow::anyhow!("ygoprodeck response missing 'data' array"))?;

		for card in data {
			let exportable = ygopro_card_to_exportable(card)?;
			if let Ok(id_u64) = exportable.id.parse::<u64>() {
				by_id.insert(id_u64, exportable);
			}
		}
	}

	let mut ordered_cards = Vec::with_capacity(ids_u64.len());
	let mut not_found = Vec::new();
	for id in &ids_u64 {
		if let Some(card) = by_id.get(id) {
			ordered_cards.push(card.clone());
		} else {
			not_found.push(id.to_string());
		}
	}

	Ok(LoadDeckCardsResponse {
		ids,
		cards: ordered_cards,
		not_found: not_found.join(", "),
	})
}

pub async fn load_deck_cards_from_ydk(
	deck_path: &str,
) -> anyhow::Result<LoadDeckCardsResponse> {
	let path = Path::new(deck_path);
	let contents = std::fs::read_to_string(path)
		.with_context(|| format!("failed to read deck file: {}", path.display()))?;

	load_deck_cards_from_ydk_contents(&contents).await
}
