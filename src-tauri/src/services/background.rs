use anyhow::Context;
use sqlx::PgPool;
#[derive(sqlx::FromRow)]
pub struct CurrentBackground {
	pub name: String,
	pub img_url: String,
}

pub async fn set_current_background(
	pool: &PgPool,
	name: &str,
	img_url: &str,
) -> anyhow::Result<()> {
	let name = name.trim();
	let img_url = img_url.trim();
	if name.is_empty() {
		return Err(anyhow::anyhow!("name cannot be empty"));
	}
	if img_url.is_empty() {
		return Err(anyhow::anyhow!("img_url cannot be empty"));
	}

	sqlx::query(
		r#"
		INSERT INTO current_background (id, name, img_url)
		VALUES (1, $1, $2)
		ON CONFLICT (id) DO UPDATE
		SET
			name = EXCLUDED.name,
			img_url = EXCLUDED.img_url,
			updated_at = now()
		"#,
	)
	.bind(name)
	.bind(img_url)
	.persistent(false)
	.execute(pool)
	.await
	.context("failed to set current background")?;

	Ok(())
}

pub async fn get_current_background(
	pool: &PgPool,
) -> anyhow::Result<CurrentBackground> {
	let record = sqlx::query_as::<_, CurrentBackground>(
		r#"
		SELECT name, img_url
		FROM current_background
		WHERE id = 1
		"#,
	)
	.persistent(false)
	.fetch_one(pool)
	.await
	.context("failed to get current background")?;

	Ok(record)
}