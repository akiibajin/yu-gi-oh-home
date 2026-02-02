use anyhow::Context;
use std::time::Duration;

use crate::services;

#[derive(Debug, Clone)]
pub struct SupabaseStorageConfig {
	pub url: String,
	pub service_role_key: String,
	pub bucket: String,
}

fn storage_object_url(cfg: &SupabaseStorageConfig, path: &str) -> anyhow::Result<reqwest::Url> {
	let base = cfg.url.trim_end_matches('/');
	let full = format!("{base}/storage/v1/object/{bucket}/{path}", bucket = cfg.bucket);
	reqwest::Url::parse(&full).context("failed to parse supabase storage object url")
}

pub fn public_object_url(cfg: &SupabaseStorageConfig, path: &str) -> String {
	let base = cfg.url.trim_end_matches('/');
	format!(
		"{base}/storage/v1/object/public/{bucket}/{path}",
		bucket = cfg.bucket
	)
}

pub async fn upload_object(
	cfg: &SupabaseStorageConfig,
	path: &str,
	bytes: Vec<u8>,
	content_type: &str,
	upsert: bool,
) -> anyhow::Result<()> {
	let url = storage_object_url(cfg, path)?;

	let client = reqwest::Client::builder()
		.timeout(Duration::from_secs(30))
		.build()
		.context("failed to build reqwest client")?;

	let mut req = client
		.put(url)
		.header("authorization", format!("Bearer {}", cfg.service_role_key))
		.header("apikey", &cfg.service_role_key)
		.header("content-type", content_type);

	if upsert {
		req = req.header("x-upsert", "true");
	}

	let resp = req
		.body(bytes)
		.send()
		.await
		.context("supabase storage upload request failed")?;

	let status = resp.status();
	let body = resp
		.text()
		.await
		.context("failed to read supabase upload response body")?;

	if !status.is_success() {
		return Err(anyhow::anyhow!("supabase storage upload failed ({status}): {body}"));
	}

	Ok(())
}

pub async fn cache_remote_image_as_webp(
	cfg: &SupabaseStorageConfig,
	source_url: &str,
	path: &str,
	quality: u8,
) -> anyhow::Result<String> {
	let client = reqwest::Client::builder()
		.timeout(Duration::from_secs(30))
		.build()
		.context("failed to build reqwest client")?;

	let resp = client
		.get(source_url)
		.send()
		.await
		.with_context(|| format!("failed to download card image: {source_url}"))?;

	let status = resp.status();
	let bytes = resp
		.bytes()
		.await
		.context("failed to read downloaded image bytes")?;

	if !status.is_success() {
		return Err(anyhow::anyhow!(
			"image download failed ({status}) from {source_url}"
		));
	}

	let webp = services::images::convert_to_webp(
		bytes.as_ref(),
		services::images::WebpOptions {
			quality: quality.min(100),
		},
	)
	.context("failed to convert downloaded image to webp")?;

	upload_object(cfg, path, webp, "image/webp", true).await?;
	Ok(public_object_url(cfg, path))
}
