use crate::services;

fn typeline_contains(typeline: &[String], tag: &str) -> bool {
	typeline
		.iter()
		.any(|s| s.trim().eq_ignore_ascii_case(tag))
}

fn monster_type_from_typeline(typeline: &[String], fallback_ygotype: &str) -> Option<String> {
	if typeline.is_empty() {
		return Some(fallback_ygotype.to_string()).filter(|s| !s.trim().is_empty());
	}

	let has_pendulum = typeline_contains(typeline, "Pendulum");
	let has_normal = typeline_contains(typeline, "Normal");
	let has_effect = typeline_contains(typeline, "Effect");
	let has_fusion = typeline_contains(typeline, "Fusion");
	let has_synchro = typeline_contains(typeline, "Synchro");
	let has_xyz = typeline_contains(typeline, "Xyz");
	let has_link = typeline_contains(typeline, "Link");
	let has_ritual = typeline_contains(typeline, "Ritual");
	let has_trap = typeline_contains(typeline, "Trap");

	let base = if has_pendulum {
		if has_normal {
			"Pendulum Normal"
		} else if has_fusion {
			"Pendulum Fusion"
		} else if has_synchro {
			"Pendulum Synchro"
		} else if has_xyz {
			"Pendulum Xyz"
		} else if has_ritual {
			"Pendulum Ritual"
		} else {
			// Most pendulum monsters are Effect if not otherwise specified.
			"Pendulum Effect"
		}
	} else if has_fusion {
		"Fusion"
	} else if has_synchro {
		"Synchro"
	} else if has_xyz {
		"Xyz"
	} else if has_link {
		"Link"
	} else if has_ritual {
		"Ritual"
	} else if has_trap {
		"Trap"
	} else if has_normal {
		"Normal"
	} else if has_effect {
		"Effect"
	} else {
		"Effect"
	};

	Some(format!("{base} Monster"))
}

fn normalize_link_marker(marker: &str) -> String {
	match marker {
		"Bottom-Left" => "Bottom-left".to_string(),
		"Bottom-Right" => "Bottom-right".to_string(),
		"Top-Left" => "Top-left".to_string(),
		"Top-Right" => "Top-right".to_string(),
		other => other.to_string(),
	}
}

pub fn ygoprodeck_card_to_store_req(
	card: &serde_json::Value,
) -> anyhow::Result<services::cards::StoreYugiohCardRequest> {
	let id = card
		.get("id")
		.and_then(|v| v.as_u64())
		.ok_or_else(|| anyhow::anyhow!("ygoprodeck card missing numeric id"))?
		.to_string();

	let name = card
		.get("name")
		.and_then(|v| v.as_str())
		.ok_or_else(|| anyhow::anyhow!("ygoprodeck card missing name"))?
		.to_string();

	let desc = card
		.get("desc")
		.and_then(|v| v.as_str())
		.unwrap_or("")
		.to_string();

	let ygotype = card.get("type").and_then(|v| v.as_str()).unwrap_or("");
	let race = card.get("race").and_then(|v| v.as_str()).map(|s| s.to_string());
	let typeline: Vec<String> = card
		.get("typeline")
		.and_then(|v| v.as_array())
		.map(|arr| {
			arr.iter()
				.filter_map(|v| v.as_str())
				.map(|s| s.to_string())
				.collect::<Vec<String>>()
		})
		.unwrap_or_default();

	let (card_type, spell_type, trap_type) = if ygotype.contains("Spell") {
		let is_field = race
			.as_deref()
			.map(|r| r.eq_ignore_ascii_case("Field"))
			.unwrap_or(false);
		(
			if is_field { "Field" } else { "Spell" }.to_string(),
			race.clone(),
			None,
		)
	} else if ygotype.contains("Trap") {
		("Trap".to_string(), None, race.clone())
	} else {
		("Monster".to_string(), None, None)
	};

	let attribute = card
		.get("attribute")
		.and_then(|v| v.as_str())
		.map(|s| s.to_string());

	let level = card
		.get("level")
		.and_then(|v| v.as_i64())
		.unwrap_or(0)
		.clamp(0, i32::MAX as i64) as i32;

	let atk = card
		.get("atk")
		.and_then(|v| v.as_i64())
		.unwrap_or(0)
		.clamp(i32::MIN as i64, i32::MAX as i64) as i32;

	let def = card
		.get("def")
		.and_then(|v| v.as_i64())
		.unwrap_or(0)
		.clamp(i32::MIN as i64, i32::MAX as i64) as i32;

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
				.map(normalize_link_marker)
				.collect::<Vec<String>>()
		})
		.and_then(|markers| if markers.is_empty() { None } else { Some(markers) });

	let image_url = card
		.get("card_images")
		.and_then(|v| v.as_array())
		.and_then(|arr| arr.first())
		.and_then(|v| v.get("image_url_cropped"))
		.and_then(|v| v.as_str())
		.map(|s| s.to_string());

	let is_tuner = {
		let type_str = ygotype.to_lowercase();
		if typeline_contains(&typeline, "Tuner") || type_str.contains("tuner") {
			Some(true)
		} else {
			None
		}
	};

	let monster_type = if card_type == "Monster" {
		monster_type_from_typeline(&typeline, ygotype)
	} else {
		None
	};

	// Keep these aligned with the shape stored by the app.
	Ok(services::cards::StoreYugiohCardRequest {
		id,
		name,
		card_type,
		description: desc,
		attribute,

		monster_type,
		sub_type: race.clone(),
		is_tuner,

		level,
		atk,
		def,

		link_rating,
		link_markers,

		spell_type,
		trap_type,

		img_url: image_url,
		user_id: None,
	})
}
