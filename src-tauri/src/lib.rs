// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod commands;
mod services;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
			commands::greet::greet,
			commands::ygoprodeck::fetch_ygoprodeck_card,
			commands::decks::load_deck_cards_from_ydk,
			commands::decks::load_deck_cards_from_ydk_bytes,
			commands::images::convert_image_to_webp,
			commands::images::download_image_bytes,
			commands::card_maker_images::store_card_maker_image,
			commands::card_maker_images::get_card_maker_images_dir,
		])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
