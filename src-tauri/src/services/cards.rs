use anyhow::Context;
use sqlx::PgPool;

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
			link_rating,
			link_markers,
			spell_type,
			trap_type,
			img_url,
			user_id
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
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
