use tauri::WebviewWindow;

#[tauri::command]
pub fn zoom_in(window: WebviewWindow) -> Result<(), String> {
    let current = window.scale_factor().unwrap_or(1.0);
    window.set_scale_factor(current + 0.1).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn zoom_out(window: WebviewWindow) -> Result<(), String> {
    let current = window.scale_factor().unwrap_or(1.0);
    if current > 0.5 {
        window.set_scale_factor(current - 0.1).map_err(|e| e.to_string())
    } else {
        Err("Minimum zoom level reached".to_string())
    }
}

#[tauri::command]
pub fn reset_zoom(window: WebviewWindow) -> Result<(), String> {
    window.set_scale_factor(1.0).map_err(|e| e.to_string())
}
