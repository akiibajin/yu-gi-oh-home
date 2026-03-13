use anyhow::Context;
use std::time::Duration;

const YGOPRODECK_CARDINFO_URL: &str = "https://db.ygoprodeck.com/api/v7/cardinfo.php";

pub async fn fetch_cardinfo(
	name: Option<String>,
	fname: Option<String>,
	id: Option<u64>,
) -> anyhow::Result<serde_json::Value> {
	if name.as_ref().map(|s| s.trim().is_empty()).unwrap_or(false) {
		return Err(anyhow::anyhow!("name cannot be empty"));
	}
	if fname.as_ref().map(|s| s.trim().is_empty()).unwrap_or(false) {
		return Err(anyhow::anyhow!("fname cannot be empty"));
	}
	if name.is_some() && fname.is_some() {
		return Err(anyhow::anyhow!("provide either name (exact) or fname (inexact), not both"));
	}
	if name.is_none() && fname.is_none() && id.is_none() {
		return Err(anyhow::anyhow!("provide name, fname, or id"));
	}

	let mut url = reqwest::Url::parse(YGOPRODECK_CARDINFO_URL)
		.context("failed to parse ygoprodeck url")?;
	{
		let mut qp = url.query_pairs_mut();
		if let Some(n) = name {
			qp.append_pair("name", n.trim());
		}
		if let Some(n) = fname {
			qp.append_pair("fname", n.trim());
		}
		if let Some(i) = id {
			qp.append_pair("id", &i.to_string());
		}
	}

	let client = reqwest::Client::new();
	let resp = client
		.get(url)
		.send()
		.await
		.context("ygoprodeck request failed")?;

	// Throttle requests to avoid rate limits.
	tokio::time::sleep(Duration::from_millis(500)).await;

	let status = resp.status();
	let body = resp
		.text()
		.await
		.context("failed to read ygoprodeck response body")?;

	if !status.is_success() {
		return Err(anyhow::anyhow!("ygoprodeck returned {status}: {body}"));
	}

	serde_json::from_str::<serde_json::Value>(&body)
		.context("failed to parse ygoprodeck response as JSON")
}

pub async fn fetch_cardinfo_by_ids(ids: &[u64]) -> anyhow::Result<serde_json::Value> {
	if ids.is_empty() {
		return Err(anyhow::anyhow!("ids cannot be empty"));
	}

	let mut url = reqwest::Url::parse(YGOPRODECK_CARDINFO_URL)
		.context("failed to parse ygoprodeck url")?;
	{
		// YGOPRODeck supports a comma-separated list in the `id` query param:
		// https://db.ygoprodeck.com/api/v7/cardinfo.php?id=1,2,3
		let mut qp = url.query_pairs_mut();
		let ids_csv = ids
			.iter()
			.map(|id| id.to_string())
			.collect::<Vec<_>>()
			.join(",");
		qp.append_pair("id", &ids_csv);
	}

	let client = reqwest::Client::new();
	let resp = client
		.get(url)
		.send()
		.await
		.context("ygoprodeck request failed")?;

	// Throttle requests to avoid rate limits.
	tokio::time::sleep(Duration::from_millis(500)).await;

	let status = resp.status();
	let body = resp
		.text()
		.await
		.context("failed to read ygoprodeck response body")?;

	if !status.is_success() {
		return Err(anyhow::anyhow!("ygoprodeck returned {status}: {body}"));
	}

	serde_json::from_str::<serde_json::Value>(&body)
		.context("failed to parse ygoprodeck response as JSON")
}
