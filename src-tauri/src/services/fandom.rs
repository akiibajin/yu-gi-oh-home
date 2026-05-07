use anyhow::Context;

const FANDOM_API_URL: &str = "https://yugioh.fandom.com/api.php";

pub struct SpanishCardText {
	pub name: String,
	pub lore: String,
	pub pendulum_effect: Option<String>,
}

fn decode_basic_html_entities(input: &str) -> String {
	input
		.replace("&nbsp;", " ")
		.replace("&quot;", "\"")
		.replace("&#039;", "'")
		.replace("&amp;", "&")
		.replace("&lt;", "<")
		.replace("&gt;", ">")
}

fn strip_ref_tags(input: &str) -> String {
	let mut out = input.to_string();

	loop {
		if let Some(start) = out.find("<ref") {
			// Handle self-closing: <ref .../>
			if let Some(end) = out[start..].find("/>") {
				let end_idx = start + end + 2;
				out.replace_range(start..end_idx, "");
				continue;
			}

			// Handle paired: <ref ...> ... </ref>
			if let Some(end) = out[start..].find("</ref>") {
				let end_idx = start + end + "</ref>".len();
				out.replace_range(start..end_idx, "");
				continue;
			}

			// If malformed, stop to avoid infinite loop.
			break;
		}
		break;
	}

	out
}

fn strip_wiki_markup(mut input: String) -> String {
	input = strip_ref_tags(&input);

	// Line breaks.
	input = input
		.replace("<br />", "\n")
		.replace("<br/>", "\n")
		.replace("<br>", "\n");

	// Bold/italic markup.
	input = input.replace("'''", "").replace("''", "");

	// Replace wiki links: [[A|B]] -> B, [[A]] -> A
	let mut out = String::with_capacity(input.len());
	let mut i = 0;
	while i < input.len() {
		let rest = &input[i..];
		if rest.starts_with("[[") {
			if let Some(end) = rest.find("]]" ) {
				let inner = &rest[2..end];
				let display = inner.rsplit('|').next().unwrap_or(inner);
				out.push_str(display);
				i += end + 2;
				continue;
			}
		}
		let ch = rest.chars().next().unwrap();
		out.push(ch);
		i += ch.len_utf8();
	}

	decode_basic_html_entities(out.trim())
}

fn extract_template_param(content: &str, param: &str) -> Option<String> {
	// We intentionally keep this lightweight (no regex dep).
	// Strategy:
	// 1) Find "| <param>" (case-insensitive by lowercasing a copy)
	// 2) From there, find '=' and take everything after it
	// 3) Stop at the next line that starts with "|" (template next param) or end

	let content_lc = content.to_lowercase();
	let needle = format!("| {}", param.to_lowercase());
	let start = content_lc.find(&needle)?;

	let after_start = &content[start..];
	let eq_rel = after_start.find('=')?;
	let value_start = start + eq_rel + 1;

	let value_rest = &content[value_start..];

	let mut end = value_rest.len();
	for (idx, _) in value_rest.match_indices("\n|") {
		end = idx;
		break;
	}

	Some(value_rest[..end].trim().to_string()).filter(|s| !s.is_empty())
}

pub async fn fetch_spanish_name_and_lore(
	client: &reqwest::Client,
	title: &str,
) -> anyhow::Result<Option<SpanishCardText>> {
	let trimmed = title.trim();
	if trimmed.is_empty() {
		return Ok(None);
	}

	let mut url = reqwest::Url::parse(FANDOM_API_URL).context("failed to parse fandom api url")?;
	{
		let mut qp = url.query_pairs_mut();
		qp.append_pair("action", "query");
		qp.append_pair("format", "json");
		qp.append_pair("formatversion", "2");
		qp.append_pair("prop", "revisions");
		qp.append_pair("rvprop", "content");
		qp.append_pair("rvslots", "main");
		qp.append_pair("titles", trimmed);
	}

	let resp = client
		.get(url)
		.header(
			reqwest::header::USER_AGENT,
			"yu-gi-oh-home/0.1 (+https://github.com)",
		)
		.send()
		.await
		.context("fandom request failed")?;

	let status = resp.status();
	let body = resp
		.text()
		.await
		.context("failed to read fandom response body")?;

	if !status.is_success() {
		return Err(anyhow::anyhow!("fandom returned {status}: {body}"));
	}

	let json = serde_json::from_str::<serde_json::Value>(&body)
		.context("failed to parse fandom response as JSON")?;

	let content = json
		.get("query")
		.and_then(|v| v.get("pages"))
		.and_then(|v| v.as_array())
		.and_then(|arr| arr.first())
		.and_then(|p| p.get("revisions"))
		.and_then(|v| v.as_array())
		.and_then(|arr| arr.first())
		.and_then(|rev| rev.get("slots"))
		.and_then(|v| v.get("main"))
		.and_then(|v| v.get("content"))
		.and_then(|v| v.as_str());

	let Some(wikitext) = content else {
		return Ok(None);
	};

	let es_name_raw = extract_template_param(wikitext, "es_name");
	let es_lore_raw = extract_template_param(wikitext, "es_lore");
	let es_pendulum_effect_raw = extract_template_param(wikitext, "es_pendulum_effect");

	let (Some(es_name_raw), Some(es_lore_raw)) = (es_name_raw, es_lore_raw) else {
		return Ok(None);
	};

	let es_name = strip_wiki_markup(es_name_raw);
	let es_lore = strip_wiki_markup(es_lore_raw);
	let es_pendulum_effect = es_pendulum_effect_raw
		.map(strip_wiki_markup)
		.map(|s| s.trim().to_string())
		.filter(|s| !s.is_empty());

	if es_name.trim().is_empty() || es_lore.trim().is_empty() {
		return Ok(None);
	}

	Ok(Some(SpanishCardText {
		name: es_name.trim().to_string(),
		lore: es_lore.trim().to_string(),
		pendulum_effect: es_pendulum_effect,
	}))
}
