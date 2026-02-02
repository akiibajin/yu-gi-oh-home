// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod commands;
mod db;
mod persisted_config;
mod services;

use sqlx::PgPool;
use tauri::Manager;
use tauri::async_runtime::Mutex;

pub struct AppState {
	pub db: Mutex<Option<PgPool>>,
	pub db_url: Mutex<Option<String>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(AppState {
				db: Mutex::new(None),
				db_url: Mutex::new(None),
			});

			// If we previously saved a DB URL on this device, eagerly connect and migrate.
			let handle = app.handle().clone();
			let state = app.state::<AppState>();
			tauri::async_runtime::block_on(async move {
				if let Ok(Some(saved_url)) = persisted_config::load_database_url(&handle) {
					match db::init_db(&saved_url).await {
						Ok(pool) => {
							*state.db.lock().await = Some(pool);
							*state.db_url.lock().await = Some(saved_url);
						}
						Err(err) => {
							eprintln!("DB init failed (will allow reconfigure in UI): {err:#}");
						}
					}
				}
			});

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
			commands::greet::greet,
			commands::db::db_healthcheck,
			commands::db::get_database_url,
			commands::db::set_database_url
			,commands::ygoprodeck::fetch_ygoprodeck_card
			,commands::cards::store_yugioh_card
			,commands::images::convert_image_to_webp
		])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
