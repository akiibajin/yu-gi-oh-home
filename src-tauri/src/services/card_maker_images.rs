use anyhow::Context;
use std::path::PathBuf;
use tauri::Manager;

fn sanitize_filename_stem(input: &str) -> String {
	let mut out = String::with_capacity(input.len());
	for ch in input.chars() {
		let ok = ch.is_ascii_alphanumeric() || ch == '-' || ch == '_' || ch == '.';
		if ok {
			out.push(ch);
		} else if ch.is_whitespace() {
			out.push('-');
		}
	}

	let out = out.trim_matches(&['.', '-', '_'][..]).to_string();
	if out.is_empty() {
		"image".to_string()
	} else {
		out
	}
}

pub fn card_maker_images_dir(app: &tauri::AppHandle) -> anyhow::Result<PathBuf> {
	// Windows requirement: keep images under Documents/card-maker-ims
	let base_dir = if cfg!(target_os = "windows") {
		app.path().document_dir().context("failed to resolve documents dir")?
	} else if cfg!(target_os = "android") {
		// Best default on Android: internal app data (no permissions, always writable).
		app.path().app_data_dir().context("failed to resolve app data dir")?
	} else {
		// Desktop fallback: prefer app data (private), but fall back to documents.
		app.path()
			.app_data_dir()
			.or_else(|_| app.path().document_dir())
			.context("failed to resolve base dir")?
	};

	let dir = base_dir.join("card-maker-ims");
	std::fs::create_dir_all(&dir).context("failed to create card-maker-ims dir")?;
	Ok(dir)
}

pub struct StoredCardMakerImage {
	pub dir: PathBuf,
	pub filename: String,
	pub path: PathBuf,
}

pub fn store_card_maker_image(
	app: &tauri::AppHandle,
	bytes: &[u8],
	id: &str,
) -> anyhow::Result<StoredCardMakerImage> {
	if bytes.is_empty() {
		return Err(anyhow::anyhow!("image bytes are empty"));
	}
	let id = id.trim();
	if id.is_empty() {
		return Err(anyhow::anyhow!("id is empty"));
	}

	let dir = card_maker_images_dir(app)?;

	// The card-maker export will always be WebP. We sanitize to ensure a safe filename
	// (card names often include spaces and punctuation).
	let stem = sanitize_filename_stem(id);
	let filename = format!("{stem}.webp");
	let path = dir.join(&filename);

	std::fs::write(&path, bytes).with_context(|| format!("failed to write image: {path:?}"))?;

	Ok(StoredCardMakerImage { dir, filename, path })
}
