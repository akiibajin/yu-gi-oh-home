use anyhow::Context;

const YGOPRODECK_CARDINFO_URL: &str = "https://db.ygoprodeck.com/api/v7/cardinfo.php";

pub async fn fetch_cardinfo(
	name: Option<String>,
	id: Option<u64>,
) -> anyhow::Result<serde_json::Value> {
	if name.as_ref().map(|s| s.trim().is_empty()).unwrap_or(false) {
		return Err(anyhow::anyhow!("name cannot be empty"));
	}
	if name.is_none() && id.is_none() {
		return Err(anyhow::anyhow!("provide name or id"));
	}

	let mut url = reqwest::Url::parse(YGOPRODECK_CARDINFO_URL)
		.context("failed to parse ygoprodeck url")?;
	{
		let mut qp = url.query_pairs_mut();
		if let Some(n) = name {
			qp.append_pair("name", n.trim());
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
