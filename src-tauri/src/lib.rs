// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod commands;
mod services;

use std::time::Duration;

fn updater_plugin() -> tauri_plugin_updater::Builder {
    let mut builder = tauri_plugin_updater::Builder::new();
    if let Some(token) = option_env!("TAURI_UPDATER_GITHUB_TOKEN").filter(|t| !t.is_empty()) {
        builder = builder
            .header("Authorization", format!("Bearer {token}"))
            .expect("invalid updater Authorization header");
    }
    builder
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(updater_plugin().build())
        .plugin(tauri_plugin_opener::init())
        .manage(
            reqwest::Client::builder()
                .timeout(Duration::from_secs(30))
                .build()
                .expect("failed to build reqwest client"),
        )
		.invoke_handler(tauri::generate_handler![
			commands::greet::greet,
			commands::ygoprodeck::fetch_ygoprodeck_card,
			commands::decks::load_deck_cards_from_ydk,
			commands::decks::load_deck_cards_from_ydk_bytes,
			commands::images::convert_image_to_webp,
			commands::images::download_image_bytes,
			commands::card_maker_images::store_card_maker_image,
			commands::card_maker_images::get_card_maker_images_dir,
			commands::updater::check_update,
			commands::updater::install_update,
			commands::fandom::fetch_wiki_card_data,
			commands::fandom::fetch_spanish_name_and_lore,
		])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
