use anyhow::Context;
use std::path::PathBuf;
use tauri::Manager;

#[derive(serde::Serialize, serde::Deserialize)]
struct PersistedConfig {
	database_url: String,
}

fn config_path(app: &tauri::AppHandle) -> anyhow::Result<PathBuf> {
	let dir = app
		.path()
		.app_config_dir()
		.context("failed to resolve app config dir")?;
	std::fs::create_dir_all(&dir).context("failed to create app config dir")?;
	Ok(dir.join("db.json"))
}

pub fn save_database_url(app: &tauri::AppHandle, url: &str) -> anyhow::Result<()> {
	let path = config_path(app)?;
	let payload = PersistedConfig {
		database_url: url.to_string(),
	};
	let json = serde_json::to_string_pretty(&payload).context("failed to serialize config")?;
	std::fs::write(&path, json).with_context(|| format!("failed to write config: {path:?}"))?;
	Ok(())
}

pub fn load_database_url(app: &tauri::AppHandle) -> anyhow::Result<Option<String>> {
	let path = config_path(app)?;
	if !path.exists() {
		return Ok(None);
	}
	let content = std::fs::read_to_string(&path)
		.with_context(|| format!("failed to read config: {path:?}"))?;
	let parsed: PersistedConfig = serde_json::from_str(&content).context("failed to parse config")?;
	Ok(Some(parsed.database_url))
}
