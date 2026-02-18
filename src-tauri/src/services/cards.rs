use anyhow::Context;
use sqlx::PgPool;

#[derive(serde::Serialize, Debug, Clone, sqlx::FromRow)]
pub struct YugiohCard {
	pub id: String,
	pub name: String,
	pub card_type: String,
	pub description: String,
	pub attribute: Option<String>,

	pub monster_type: Option<String>,
	pub sub_type: Option<String>,
	pub is_tuner: Option<bool>,

	pub level: i32,
	pub atk: i32,
	pub def: i32,
	pub scale: i32,

	pub link_rating: Option<i32>,
	pub link_markers: Option<Vec<String>>,

	pub spell_type: Option<String>,
	pub trap_type: Option<String>,

	pub img_url: Option<String>,
	pub user_id: Option<String>,
}

#[derive(serde::Deserialize, Debug, Clone)]
pub struct StoreYugiohCardRequest {
	pub id: String,
	pub name: String,
	pub card_type: String,
	pub description: String,
	pub attribute: Option<String>,

	pub monster_type: Option<String>,
	pub sub_type: Option<String>,
	pub is_tuner: Option<bool>,

	pub level: i32,
	pub atk: i32,
	pub def: i32,
	pub scale: i32,

	pub link_rating: Option<i32>,
	pub link_markers: Option<Vec<String>>,

	pub spell_type: Option<String>,
	pub trap_type: Option<String>,

	pub img_url: Option<String>,
	pub user_id: Option<String>,
}

#[derive(serde::Serialize, Debug, Clone)]
pub struct StoreYugiohCardResponse {
	pub id: String,
}

pub async fn store_yugioh_card(
	pool: &PgPool,
	req: StoreYugiohCardRequest,
) -> anyhow::Result<StoreYugiohCardResponse> {
	sqlx::query(
		r#"
		INSERT INTO yugioh_cards (
			id,
			name,
			card_type,
			description,
			attribute,
			monster_type,
			sub_type,
			is_tuner,
			level,
			atk,
			def,
			scale,
			link_rating,
			link_markers,
			spell_type,
			trap_type,
			img_url,
			user_id
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			card_type = EXCLUDED.card_type,
			description = EXCLUDED.description,
			attribute = EXCLUDED.attribute,
			monster_type = EXCLUDED.monster_type,
			sub_type = EXCLUDED.sub_type,
			is_tuner = EXCLUDED.is_tuner,
			level = EXCLUDED.level,
			atk = EXCLUDED.atk,
			def = EXCLUDED.def,
			scale = EXCLUDED.scale,
			link_rating = EXCLUDED.link_rating,
			link_markers = EXCLUDED.link_markers,
			spell_type = EXCLUDED.spell_type,
			trap_type = EXCLUDED.trap_type,
			img_url = EXCLUDED.img_url,
			user_id = EXCLUDED.user_id
		"#,
	)
	.bind(&req.id)
	.bind(&req.name)
	.bind(&req.card_type)
	.bind(&req.description)
	.bind(&req.attribute)
	.bind(&req.monster_type)
	.bind(&req.sub_type)
	.bind(req.is_tuner)
	.bind(req.level)
	.bind(req.atk)
	.bind(req.def)
	.bind(req.scale)
	.bind(req.link_rating)
	.bind(&req.link_markers)
	.bind(&req.spell_type)
	.bind(&req.trap_type)
	.bind(&req.img_url)
	.bind(&req.user_id)
	.persistent(false)
	.execute(pool)
	.await
	.context("failed to store yugioh card")?;

	Ok(StoreYugiohCardResponse { id: req.id })
}

pub async fn update_yugioh_card_img_url(
	pool: &PgPool,
	card_id: &str,
	img_url: &str,
) -> anyhow::Result<()> {
	sqlx::query(
		r#"
		UPDATE yugioh_cards
		SET img_url = $2
		WHERE id = $1
		"#,
	)
	.bind(card_id)
	.bind(img_url)
	.persistent(false)
	.execute(pool)
	.await
	.context("failed to update yugioh card img_url")?;
	Ok(())
}

pub async fn update_yugioh_card_user_id(
	pool: &PgPool,
	card_id: &str,
	user_id: Option<&str>,
) -> anyhow::Result<()> {
	let card_id = card_id.trim();
	if card_id.is_empty() {
		return Err(anyhow::anyhow!("card_id cannot be empty"));
	}

	let result = sqlx::query(
		r#"
		UPDATE yugioh_cards
		SET user_id = $2
		WHERE id = $1
		"#,
	)
	.bind(card_id)
	.bind(user_id)
	.persistent(false)
	.execute(pool)
	.await
	.context("failed to update yugioh card user_id")?;

	if result.rows_affected() == 0 {
		return Err(anyhow::anyhow!("card not found: {card_id}"));
	}
	Ok(())
}

pub async fn fetch_yugioh_card_by_id(pool: &PgPool, id: &str) -> anyhow::Result<Option<YugiohCard>> {
	let id = id.trim();
	if id.is_empty() {
		return Ok(None);
	}

	sqlx::query_as::<_, YugiohCard>(
		r#"
		SELECT
			id,
			name,
			card_type,
			description,
			attribute,
			monster_type,
			sub_type,
			is_tuner,
			level,
			atk,
			def,
			scale,
			link_rating,
			link_markers,
			spell_type,
			trap_type,
			img_url,
			user_id
		FROM yugioh_cards
		WHERE id = $1
		LIMIT 1
		"#,
	)
	.bind(id)
	.persistent(false)
	.fetch_optional(pool)
	.await
	.context("failed to fetch yugioh card by id")
}

pub async fn fetch_yugioh_cards_by_name(pool: &PgPool, name: &str) -> anyhow::Result<Vec<YugiohCard>> {
	let name = name.trim();
	if name.is_empty() {
		return Ok(vec![]);
	}

	sqlx::query_as::<_, YugiohCard>(
		r#"
		SELECT
			id,
			name,
			card_type,
			description,
			attribute,
			monster_type,
			sub_type,
			is_tuner,
			level,
			atk,
			def,
			scale,
			link_rating,
			link_markers,
			spell_type,
			trap_type,
			img_url,
			user_id
		FROM yugioh_cards
		WHERE name ILIKE $1
		ORDER BY name ASC
		LIMIT 50
		"#,
	)
	.bind(name)
	.persistent(false)
	.fetch_all(pool)
	.await
	.context("failed to fetch yugioh cards by name")
}

pub async fn fetch_yugioh_cards_by_fname(pool: &PgPool, fname: &str) -> anyhow::Result<Vec<YugiohCard>> {
	let fname = fname.trim();
	if fname.is_empty() {
		return Ok(vec![]);
	}

	let pattern = format!("%{}%", fname);
	sqlx::query_as::<_, YugiohCard>(
		r#"
		SELECT
			id,
			name,
			card_type,
			description,
			attribute,
			monster_type,
			sub_type,
			is_tuner,
			level,
			atk,
			def,
			scale,
			link_rating,
			link_markers,
			spell_type,
			trap_type,
			img_url,
			user_id
		FROM yugioh_cards
		WHERE name ILIKE $1
		ORDER BY name ASC
		LIMIT 50
		"#,
	)
	.bind(pattern)
	.persistent(false)
	.fetch_all(pool)
	.await
	.context("failed to fetch yugioh cards by fname")
}

pub async fn fetch_yugioh_cards_by_user_id(
	pool: &PgPool,
	user_id: &str,
) -> anyhow::Result<Vec<YugiohCard>> {
	let user_id = user_id.trim();
	if user_id.is_empty() {
		return Ok(vec![]);
	}

	sqlx::query_as::<_, YugiohCard>(
		r#"
		SELECT
			*
		FROM yugioh_cards
		WHERE user_id = $1
		ORDER BY name ASC
		"#,
	)
	.bind(user_id)
	.persistent(false)
	.fetch_all(pool)
	.await
	.context("failed to fetch yugioh cards by user_id")
}