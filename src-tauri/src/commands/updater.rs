use serde::Serialize;
use tauri_plugin_updater::UpdaterExt;

#[derive(Debug, Serialize)]
pub struct UpdateInfo {
	pub version: String,
	pub date: Option<String>,
	pub body: Option<String>,
}

#[tauri::command]
pub async fn check_update(app: tauri::AppHandle) -> Result<Option<UpdateInfo>, String> {
	let updater = app.updater().map_err(|e| e.to_string())?;
	match updater.check().await {
		Ok(Some(update)) => Ok(Some(UpdateInfo {
			version: update.version.to_string(),
			date: update.date.map(|d| d.to_string()),
			body: update.body,
		})),
		Ok(None) => Ok(None),
		Err(e) => Err(e.to_string()),
	}
}

#[tauri::command]
pub async fn install_update(app: tauri::AppHandle) -> Result<(), String> {
	let updater = app.updater().map_err(|e| e.to_string())?;
	match updater.check().await {
		Ok(Some(update)) => {
			update
				.download_and_install(|_, _| {}, || {})
				.await
				.map_err(|e| e.to_string())?;
			Ok(())
		}
		Ok(None) => Err("No update available".to_string()),
		Err(e) => Err(e.to_string()),
	}
}
