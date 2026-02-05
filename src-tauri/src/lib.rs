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
	pub supabase_url: Mutex<Option<String>>,
	pub supabase_service_role_key: Mutex<Option<String>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(AppState {
				db: Mutex::new(None),
				supabase_url: Mutex::new(None),
				supabase_service_role_key: Mutex::new(None),
			});

			// Load persisted non-secret app config.
			let handle = app.handle().clone();
			let state = app.state::<AppState>();
			tauri::async_runtime::block_on(async move {
				if let Ok(Some((sb_url, sb_key))) = persisted_config::load_supabase_config(&handle) {
					*state.supabase_url.lock().await = Some(sb_url);
					*state.supabase_service_role_key.lock().await = Some(sb_key);
				}
			});

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
			commands::greet::greet,
			commands::db::db_healthcheck,
			commands::db::set_database_url
			,commands::supabase::get_supabase_url
			,commands::supabase::set_supabase_config
			,commands::ygoprodeck::fetch_ygoprodeck_card
			,commands::cards::store_yugioh_card
			,commands::cards::assign_yugioh_card_to_user
			,commands::cards::get_cards_by_user_id
			,commands::background::set_current_background
			,commands::background::get_current_background
			,commands::decks::load_deck_cards_from_ydk
			,commands::decks::load_deck_cards_from_ydk_bytes
			,commands::images::convert_image_to_webp
			,commands::card_maker_images::store_card_maker_image			
		])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
