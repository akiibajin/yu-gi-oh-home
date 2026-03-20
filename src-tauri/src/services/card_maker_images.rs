use anyhow::Context;
use std::path::PathBuf;
use tauri::Manager;

#[cfg(target_os = "android")]
use crate::services::android_public_documents;

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
		// Android: put exports under a user-visible Documents subfolder.
		// This typically maps to the app-specific external Documents directory, so it
		// remains writable without broad storage permissions.
		let docs = app
			.path()
			.document_dir()
			.or_else(|_| app.path().app_data_dir())
			.context("failed to resolve documents/app data dir")?;
		docs.join("yu-gi-oh-home")
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

pub fn card_maker_images_target_dir(
	app: &tauri::AppHandle,
	folder_name: Option<&str>,
) -> anyhow::Result<PathBuf> {
	let mut dir = card_maker_images_dir(app)?;
	let folder = folder_name
		.map(str::trim)
		.filter(|v| !v.is_empty())
		.map(sanitize_filename_stem)
		.filter(|v| !v.is_empty());

	if let Some(folder) = folder.as_ref() {
		dir = dir.join(folder);
		std::fs::create_dir_all(&dir).context("failed to create deck export folder")?;
	}
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
	folder_name: Option<&str>,
) -> anyhow::Result<StoredCardMakerImage> {
	if bytes.is_empty() {
		return Err(anyhow::anyhow!("image bytes are empty"));
	}
	let id = id.trim();
	if id.is_empty() {
		return Err(anyhow::anyhow!("id is empty"));
	}

	// The card-maker export will always be WebP. We sanitize to ensure a safe filename
	// (card names often include spaces and punctuation).
	let stem = sanitize_filename_stem(id);
	let filename = format!("{stem}.webp");

	let folder = folder_name
		.map(str::trim)
		.filter(|v| !v.is_empty())
		.map(sanitize_filename_stem)
		.filter(|v| !v.is_empty());

	#[cfg(target_os = "android")]
	{
		let folder_name = folder.as_deref();
		match android_public_documents::store_webp_in_public_documents_with_folder(
			&filename,
			bytes,
			folder_name,
		) {
			Ok(uri) => {
				let dir = match folder_name {
					Some(folder) => PathBuf::from("Documents/yu-gi-oh-home").join(folder),
					None => PathBuf::from("Documents/yu-gi-oh-home"),
				};
				let path = PathBuf::from(uri);
				return Ok(StoredCardMakerImage { dir, filename, path });
			}
			Err(_e) => {
				// Fallback: keep exporting working even if public Documents writing fails.
				// (e.g. OEM restrictions).
			}
		}
	}

	let mut dir = card_maker_images_dir(app)?;
	if let Some(folder) = folder.as_ref() {
		dir = dir.join(folder);
		std::fs::create_dir_all(&dir).context("failed to create deck export folder")?;
	}
	let path = dir.join(&filename);

	std::fs::write(&path, bytes).with_context(|| format!("failed to write image: {path:?}"))?;

	Ok(StoredCardMakerImage { dir, filename, path })
}
