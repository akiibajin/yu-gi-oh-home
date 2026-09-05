use anyhow::Context;

const FANDOM_API_URL: &str = "https://yugioh.fandom.com/api.php";

pub struct SpanishCardText {
    pub name: String,
    pub lore: String,
    pub pendulum_effect: Option<String>,
}

/// Parsed card data from a Fandom wiki page HTML.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct WikiCardData {
    pub name: Option<String>,
    pub english_name: Option<String>,
    pub card_type: Option<String>,
    pub card_sub_type: Option<String>,
    pub attribute: Option<String>,
    pub race: Option<String>,
    pub level: Option<String>,
    pub atk: Option<String>,
    pub def: Option<String>,
    pub scale: Option<String>,
    pub pendulum_effect: Option<String>,
    pub description: Option<String>,
    pub anime_effect: Option<String>,
    pub image_url: Option<String>,
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

    // Line breaks and bold/italic markup, stripped in a single pass to avoid
    // allocating an intermediate String per replacement.
    let mut out = String::with_capacity(input.len());
    let bytes = input.as_bytes();
    let mut i = 0;
    while i < input.len() {
        if bytes[i] == b'<' {
            if bytes[i..].starts_with(b"<br />") {
                out.push('\n');
                i += b"<br />".len();
                continue;
            }
            if bytes[i..].starts_with(b"<br/>") {
                out.push('\n');
                i += b"<br/>".len();
                continue;
            }
            if bytes[i..].starts_with(b"<br>") {
                out.push('\n');
                i += b"<br>".len();
                continue;
            }
        }
        if bytes[i] == b'\'' {
            if bytes[i..].starts_with(b"'''") {
                i += b"'''".len();
                continue;
            }
            if bytes[i..].starts_with(b"''") {
                i += b"''".len();
                continue;
            }
        }
        let ch = input[i..].chars().next().expect("i is on a char boundary");
        out.push(ch);
        i += ch.len_utf8();
    }

    // Replace wiki links: [[A|B]] -> B, [[A]] -> A
    let mut link_stripped = String::with_capacity(out.len());
    let mut j = 0;
    while j < out.len() {
        let rest = &out[j..];
        if rest.starts_with("[[") {
            if let Some(end) = rest.find("]]") {
                let inner = &rest[2..end];
                let display = inner.rsplit('|').next().unwrap_or(inner);
                link_stripped.push_str(display);
                j += end + 2;
                continue;
            }
        }
        let ch = rest.chars().next().expect("j is on a char boundary");
        link_stripped.push(ch);
        j += ch.len_utf8();
    }

    decode_basic_html_entities(link_stripped.trim())
}

fn find_ascii_case_insensitive(haystack: &str, needle: &str) -> Option<usize> {
    if needle.is_empty() {
        return Some(0);
    }
    let hb = haystack.as_bytes();
    let nb = needle.as_bytes();
    hb.windows(nb.len()).position(|w| {
        w.iter()
            .zip(nb.iter())
            .all(|(a, b)| a.eq_ignore_ascii_case(b))
    })
}

fn extract_template_param(content: &str, param: &str) -> Option<String> {
    // We intentionally keep this lightweight (no regex dep).
    // Strategy:
    // 1) Find "| <param>" (case-insensitively, without copying the whole content)
    // 2) From there, find '=' and take everything after it
    // 3) Stop at the next line that starts with "|" (template next param) or end

    let needle = format!("| {}", param.to_lowercase());
    let start = find_ascii_case_insensitive(content, &needle)?;

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

// ---------------------------------------------------------------------------
// Wiki page HTML parsing helpers
// ---------------------------------------------------------------------------

fn extract_meta_content(html: &str, property: &str) -> Option<String> {
    let needle = format!("property=\"{property}\"");
    let pos = html.find(&needle)?;
    // Look for content="..." after the property match.
    let after = &html[pos..];
    let content_start = after.find("content=\"")? + "content=\"".len();
    let content_end = after[content_start..].find('"')?;
    let raw = &after[content_start..content_start + content_end];
    Some(decode_basic_html_entities(raw))
}

/// Find a `data-source="<name>"` section and return the text inside the
/// following `.pi-data-value` element.
fn extract_infobox_field(html: &str, source: &str) -> Option<String> {
    let needle = format!("data-source=\"{source}\"");
    let pos = html.find(&needle)?;

    // Find the pi-data-value div after the data-source.
    let after = &html[pos..];
    let value_start = after.find("pi-data-value")?;
    let after_value = &after[value_start..];

    // Find the closing > of the opening tag.
    let tag_end = after_value.find('>')? + 1;
    let inner = &after_value[tag_end..];

    // Take everything up to the next closing tag.
    let tag_close = inner.find("</div>").or_else(|| inner.find("</span>"))?;
    let raw = &inner[..tag_close];

    // Strip inner HTML tags to get plain text.
    let text = strip_html_tags(raw);
    let decoded = decode_basic_html_entities(&text);
    let trimmed = decoded.trim().to_string();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed)
    }
}

/// Find a data field by its label text (e.g. "Atributo", "ATK", "DEF").
/// The label appears in a `.pi-data-label` element, and the value is in the
/// next `.pi-data-value` sibling.
/// The HTML may have whitespace/newlines between `>` and the label text.
fn extract_field_by_label(html: &str, label: &str) -> Option<String> {
    // Find each pi-data-label element and check if it contains our label text.
    let mut search_from = 0;
    loop {
        let label_pos = html[search_from..].find("pi-data-label")?;
        let abs_pos = search_from + label_pos;
        let after = &html[abs_pos..];

        // Find the closing </h3> of the label element.
        let h3_close = after.find("</h3>")?;
        let label_element = &after[..h3_close];

        if label_element.contains(label) {
            // Found our label! Now find the pi-data-value after it.
            let after_h3 = &after[h3_close..];
            let value_start = after_h3.find("pi-data-value")?;
            let after_value = &after_h3[value_start..];

            let tag_end = after_value.find('>')? + 1;
            let inner = &after_value[tag_end..];

            let tag_close = inner.find("</div>").or_else(|| inner.find("</span>"))?;
            let raw = &inner[..tag_close];

            let text = strip_html_tags(raw);
            let decoded = decode_basic_html_entities(&text);
            let trimmed = decoded.trim().to_string();
            return if trimmed.is_empty() {
                None
            } else {
                Some(trimmed)
            };
        }

        // Move past this label element and try the next one.
        search_from = abs_pos + h3_close;
    }
}

fn strip_html_tags(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    let mut inside_tag = false;
    for ch in input.chars() {
        match ch {
            '<' => inside_tag = true,
            '>' => inside_tag = false,
            _ if !inside_tag => out.push(ch),
            _ => {}
        }
    }
    out
}

/// Determine the card type from the "Carta" field value.
/// Values like "Carta de Trampa", "Carta Mágica", "Monstruo de Péndulo de Sincronía", etc.
fn extract_card_type_from_carta(html: &str) -> Option<String> {
    let carta_value = extract_infobox_field(html, "carta")?;

    // Pendulum subtypes must be checked before generic "Monstruo de Péndulo".
    if carta_value.contains("Monstruo de P\u{e9}ndulo de Sincron\u{ed}a")
        || carta_value.contains("Monstruo de Péndulo de Sincronía")
    {
        Some("Pendulum Synchro Monster".to_string())
    } else if carta_value.contains("Monstruo de P\u{e9}ndulo de Fusion")
        || carta_value.contains("Monstruo de Péndulo de Fusión")
    {
        Some("Pendulum Fusion Monster".to_string())
    } else if carta_value.contains("Monstruo de P\u{e9}ndulo Xyz")
        || carta_value.contains("Monstruo de Péndulo Xyz")
    {
        Some("Pendulum Xyz Monster".to_string())
    } else if carta_value.contains("Monstruo de P\u{e9}ndulo de Ritual")
        || carta_value.contains("Monstruo de Péndulo de Ritual")
    {
        Some("Pendulum Ritual Monster".to_string())
    } else if carta_value.contains("Monstruo de P\u{e9}ndulo")
        || carta_value.contains("Monstruo de Péndulo")
    {
        Some("Pendulum Monster".to_string())
    } else if carta_value.contains("Carta de Trampa") {
        Some("Trap".to_string())
    } else if carta_value.contains("Carta M\u{e1}gica") || carta_value.contains("Carta Mágica") {
        let is_field = extract_field_by_label(html, "Icono")
            .map(|icono| icono.eq_ignore_ascii_case("De campo"))
            .unwrap_or(false);
        if is_field {
            Some("Field".to_string())
        } else {
            Some("Spell".to_string())
        }
    } else if carta_value.contains("Monstruo de Efecto") {
        Some("Effect Monster".to_string())
    } else if carta_value.contains("Monstruo Normal") {
        Some("Normal Monster".to_string())
    } else if carta_value.contains("Monstruo de Fusi\u{f3}n")
        || carta_value.contains("Monstruo de Fusión")
    {
        Some("Fusion Monster".to_string())
    } else if carta_value.contains("Monstruo de Sincron\u{ed}a")
        || carta_value.contains("Monstruo de Sincronía")
    {
        Some("Synchro Monster".to_string())
    } else if carta_value.contains("Monstruo Xyz") {
        Some("Xyz Monster".to_string())
    } else if carta_value.contains("Monstruo de Enlace") {
        Some("Link Monster".to_string())
    } else if carta_value.contains("Monstruo de Ritual") {
        Some("Ritual Monster".to_string())
    } else if carta_value.contains("Ficha") {
        Some("Token".to_string())
    } else {
        None
    }
}

/// Extract the anime effect from the wiki page HTML.
/// The anime effect appears after a paragraph like
///   "Según el anime, el efecto original de ... es el siguiente:"
///   "Según el manga/anime, el efecto original de ... es el siguiente:"
///   "Según el manga/anime original, el efecto de ... es el siguiente:"
/// followed by a `<table>` with the effect text in a cell.
fn extract_anime_effect(html: &str) -> Option<String> {
    const ANIME_EFFECT_PREFIXES: [&str; 2] = ["Seg\u{fa}n el anime", "Seg\u{fa}n el manga/anime"];

    for prefix in ANIME_EFFECT_PREFIXES {
        let mut search_from = 0;
        while let Some(rel) = html[search_from..].find(prefix) {
            let pos = search_from + rel;
            let after = &html[pos + prefix.len()..];

            // Validate the intro sentence, which reads
            // ".. (original)?, el efecto (original)? de "<name>" es el siguiente:".
            let intro_end = after
                .find("<table")
                .or_else(|| after.find("</p>"))
                .unwrap_or(after.len());
            let intro = &after[..intro_end];
            if !intro.contains(", el efecto")
                || !intro.contains("de \"")
                || !intro.contains("es el siguiente:")
            {
                search_from = pos + prefix.len();
                continue;
            }

            if let Some(text) = extract_effect_cell_text(after) {
                return Some(text);
            }
            search_from = pos + prefix.len();
        }
    }

    None
}

/// Extract the first non-label cell of the effect table that follows the
/// intro paragraph. Some tables prefix the effect with a "Descripción carta"
/// label cell, which is skipped.
fn extract_effect_cell_text(html: &str) -> Option<String> {
    let table_start = html.find("<table")?;
    let table_end = html[table_start..].find("</table>")? + table_start;

    let mut search_from = table_start;
    while search_from < table_end {
        let open_at = find_next_cell(html, search_from)?;
        if open_at >= table_end {
            break;
        }

        let (open_tag, close_tag) = if html[open_at..].starts_with("<td>") {
            ("<td>", "</td>")
        } else {
            ("<th>", "</th>")
        };
        let inner_start = open_at + open_tag.len();
        let rel = html[inner_start..].find(close_tag)?;
        let raw = &html[inner_start..inner_start + rel];

        let text = strip_html_tags(raw);
        let decoded = decode_basic_html_entities(&text);
        let trimmed = decoded.trim().to_string();

        search_from = inner_start + rel + close_tag.len();
        if !trimmed.is_empty() && !trimmed.eq_ignore_ascii_case("Descripción carta") {
            return Some(trimmed);
        }
    }

    None
}

/// Find the next `<td>` or `<th>` opening tag at or after `from`.
fn find_next_cell(html: &str, from: usize) -> Option<usize> {
    let body = &html[from..];
    match (body.find("<td>"), body.find("<th>")) {
        (Some(td), Some(th)) => Some(from + td.min(th)),
        (Some(td), None) => Some(from + td),
        (None, Some(th)) => Some(from + th),
        (None, None) => None,
    }
}

/// Extract the card description from the `InfoboxDescripcion` section.
fn extract_description(html: &str) -> Option<String> {
    let marker = "InfoboxDescripcion";
    let pos = html.find(marker)?;

    let after = &html[pos..];

    // Find the first <p> or <ul> after the marker.
    let p_start = after.find("<p>").or_else(|| after.find("<ul>"))?;
    let inner = &after[p_start..];

    // Find the closing </p> or </ul>.
    let close_tag = if inner.starts_with("<p>") {
        "</p>"
    } else {
        "</ul>"
    };
    let end = inner.find(close_tag)?;
    let raw = &inner[..end];

    let text = strip_html_tags(raw);
    let decoded = decode_basic_html_entities(&text);
    let trimmed = decoded.trim().to_string();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed)
    }
}

/// Extract the pendulum scale from the `InfoboxPendulo` section.
/// Format in HTML: `<b>Escala:</b> [icon] X / Y [icon]` inside a `<p>` tag.
/// We strip HTML tags first, then parse the left scale value from the clean text.
fn extract_pendulum_scale(html: &str) -> Option<String> {
    let marker = "InfoboxPendulo";
    let pos = html.find(marker)?;

    let after = &html[pos..];

    // Find "Escala:" text.
    let escala_pos = after.find("Escala:")?;
    let after_escala = &after[escala_pos..];

    // Find the end of the enclosing <p> tag so we only look at the relevant text.
    let p_close = after_escala.find("</p>")?;
    let raw = &after_escala[..p_close];

    // Strip HTML tags to remove markup and URLs that contain stray digits.
    let text = strip_html_tags(raw);
    let decoded = decode_basic_html_entities(&text);

    // Find the first number after "Escala:" in the cleaned text.
    let label_offset = decoded.find("Escala:")? + "Escala:".len();
    let rest = &decoded[label_offset..];

    let mut digits = String::new();
    let mut found_digit = false;
    for ch in rest.chars() {
        if ch.is_ascii_digit() {
            digits.push(ch);
            found_digit = true;
        } else if found_digit {
            break;
        }
    }

    if digits.is_empty() {
        None
    } else {
        Some(digits)
    }
}

/// Extract the pendulum effect from the `InfoboxPendulo` section.
fn extract_pendulum_effect(html: &str) -> Option<String> {
    let marker = "InfoboxPendulo";
    let pos = html.find(marker)?;

    let after = &html[pos..];

    // Find the pendulum effect text in an <i> tag inside the section.
    let i_start = after.find("<i>")?;
    let inner = &after[i_start + 3..];
    let i_end = inner.find("</i>")?;
    let raw = &inner[..i_end];

    let text = strip_html_tags(raw);
    let decoded = decode_basic_html_entities(&text);
    let trimmed = decoded.trim().to_string();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed)
    }
}

pub async fn fetch_wiki_card_data(
    client: &reqwest::Client,
    url: &str,
) -> anyhow::Result<WikiCardData> {
    let resp = client
        .get(url)
        .header(
            reqwest::header::USER_AGENT,
            "yu-gi-oh-home/0.1 (+https://github.com)",
        )
        .send()
        .await
        .context("wiki page request failed")?;

    let status = resp.status();
    if !status.is_success() {
        let body = resp.text().await.unwrap_or_default();
        return Err(anyhow::anyhow!("wiki returned {status}: {body}"));
    }

    let html = resp.text().await.context("failed to read wiki page body")?;

    let name = extract_infobox_field(&html, "nombre");
    let english_name = extract_infobox_field(&html, "ingl\u{e9}s");
    let card_type = extract_card_type_from_carta(&html);
    let attribute = extract_field_by_label(&html, "Atributo");
    let race = extract_field_by_label(&html, "Tipo");

    // Level (Nivel) for most monsters, or Rank (Rango) for Xyz monsters.
    let level_raw =
        extract_field_by_label(&html, "Nivel").or_else(|| extract_field_by_label(&html, "Rango"));
    // Clean up: "x 5" → "5"
    let level = level_raw
        .map(|v| {
            let digits: String = v.chars().filter(|c| c.is_ascii_digit()).collect();
            digits
        })
        .filter(|s| !s.is_empty());

    let description = extract_description(&html);
    let image_url = extract_meta_content(&html, "og:image");

    // ATK / DEF is a combined field for monsters.
    let atk_def = extract_field_by_label(&html, "ATK / DEF");
    let (atk, def) = if let Some(ref ad) = atk_def {
        let parts: Vec<&str> = ad.split('/').collect();
        let a = parts
            .first()
            .map(|s| {
                s.trim()
                    .chars()
                    .filter(|c| c.is_ascii_digit())
                    .collect::<String>()
            })
            .filter(|s| !s.is_empty());
        let d = parts
            .get(1)
            .map(|s| {
                s.trim()
                    .chars()
                    .filter(|c| c.is_ascii_digit())
                    .collect::<String>()
            })
            .filter(|s| !s.is_empty());
        (a, d)
    } else {
        (None, None)
    };

    // Spell/trap sub-type (Normal, Continua, Equip, etc.)
    let card_sub_type = extract_field_by_label(&html, "Icono");

    // Scale and pendulum effect are in the InfoboxPendulo section (pendulum monsters).
    let scale = extract_pendulum_scale(&html);
    let pendulum_effect = extract_pendulum_effect(&html);

    // Anime effect (alternative effect from the anime).
    let anime_effect = extract_anime_effect(&html);

    Ok(WikiCardData {
        name,
        english_name,
        card_type,
        card_sub_type,
        attribute,
        race,
        level,
        atk,
        def,
        scale,
        pendulum_effect,
        description,
        anime_effect,
        image_url,
    })
}

#[cfg(test)]
mod tests {
    use super::extract_card_type_from_carta;

    #[test]
    fn detects_field_spell_by_icono_label() {
        // The Icono field on field spells is a plain <h3> label without a
        // data-source attribute, and its value is "De campo".
        let html = r#"
            <div class="pi-item" data-source="carta">
                <h3 class="pi-data-label pi-secondary-font">Tipo</h3>
                <div class="pi-data-value pi-font"><div class="data data-color">
                    <a href="/es/wiki/Carta_M%C3%A1gica">Carta Mágica</a>
                </div></div>
            </div>
            <div class="pi-item"><h3 class="pi-data-label pi-secondary-font"> Icono </h3>
                <div class="pi-data-value pi-font"><div class="data data-color">
                    <span><img alt="Icono de campo" src="icono"/></span> De campo
                </div></div>
            </div>
        "#;
        assert_eq!(
            extract_card_type_from_carta(html).as_deref(),
            Some("Field")
        );
    }

    #[test]
    fn keeps_regular_spell_when_not_field() {
        let html = r#"
            <div class="pi-item" data-source="carta">
                <h3 class="pi-data-label pi-secondary-font">Tipo</h3>
                <div class="pi-data-value pi-font"><div class="data data-color">
                    <a href="/es/wiki/Carta_M%C3%A1gica">Carta Mágica</a>
                </div></div>
            </div>
            <div class="pi-item"><h3 class="pi-data-label pi-secondary-font"> Icono </h3>
                <div class="pi-data-value pi-font"><div class="data data-color">
                    <span><img alt="Icono mágica" src="icono"/></span> Normal
                </div></div>
            </div>
        "#;
        assert_eq!(
            extract_card_type_from_carta(html).as_deref(),
            Some("Spell")
        );
    }
}
