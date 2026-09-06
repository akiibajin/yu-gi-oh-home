use std::env;
use std::fs;
use std::path::PathBuf;

const TOKEN_KEY: &str = "TAURI_UPDATER_GITHUB_TOKEN";

fn emit_token(token: &str) {
	println!("cargo:rustc-env={TOKEN_KEY}={token}");
	println!("cargo:rerun-if-env-changed={TOKEN_KEY}");
}

fn load_from_process_env() -> bool {
	if let Ok(token) = env::var(TOKEN_KEY) {
		let token = token.trim().trim_matches(['"', '\'']);
		if !token.is_empty() {
			emit_token(token);
			return true;
		}
	}
	false
}

fn load_from_files(workspace_root: &PathBuf) -> bool {
	for name in [".env.local", ".env"] {
		let path = workspace_root.join(name);
		if path.exists() {
			println!("cargo:rerun-if-changed={}", path.display());
			if let Ok(content) = fs::read_to_string(&path) {
				if let Some(token) = content.lines().find_map(|line| {
					let line = line.trim();
					if line.is_empty() || line.starts_with('#') {
						return None;
					}
					let (key, value) = line.split_once('=')?;
					(key.trim() == TOKEN_KEY).then(|| {
						value.trim().trim_matches(['"', '\'']).to_string()
					})
				}) {
					if !token.is_empty() {
						emit_token(&token);
						return true;
					}
				}
			}
		}
	}
	false
}

fn workspace_root(manifest_dir: &str) -> PathBuf {
	PathBuf::from(manifest_dir)
		.parent()
		.map(PathBuf::from)
		.unwrap_or_else(|| PathBuf::from("."))
}

fn main() {
	tauri_build::build();

	let manifest_dir = env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR is not set");
	if !(load_from_process_env() || load_from_files(&workspace_root(&manifest_dir))) {
		println!("cargo:rerun-if-env-changed={TOKEN_KEY}");
	}
}