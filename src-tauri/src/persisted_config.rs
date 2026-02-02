use anyhow::Context;
use std::path::PathBuf;
use tauri::Manager;

#[derive(serde::Serialize, serde::Deserialize)]
struct PersistedSupabaseConfig {
	url: String,
	service_role_key: String,
}

fn supabase_config_path(app: &tauri::AppHandle) -> anyhow::Result<PathBuf> {
	let dir = app
		.path()
		.app_config_dir()
		.context("failed to resolve app config dir")?;
	std::fs::create_dir_all(&dir).context("failed to create app config dir")?;
	Ok(dir.join("supabase.json"))
}

pub fn save_supabase_config(
	app: &tauri::AppHandle,
	url: &str,
	service_role_key: &str,
) -> anyhow::Result<()> {
	let path = supabase_config_path(app)?;
	let payload = PersistedSupabaseConfig {
		url: url.to_string(),
		service_role_key: service_role_key.to_string(),
	};
	let json = serde_json::to_string_pretty(&payload).context("failed to serialize supabase config")?;
	std::fs::write(&path, json)
		.with_context(|| format!("failed to write supabase config: {path:?}"))?;
	Ok(())
}

pub fn load_supabase_config(
	app: &tauri::AppHandle,
) -> anyhow::Result<Option<(String, String)>> {
	let path = supabase_config_path(app)?;
	if !path.exists() {
		return Ok(None);
	}
	let content = std::fs::read_to_string(&path)
		.with_context(|| format!("failed to read supabase config: {path:?}"))?;
	let parsed: PersistedSupabaseConfig =
		serde_json::from_str(&content).context("failed to parse supabase config")?;
	Ok(Some((parsed.url, parsed.service_role_key)))
}
