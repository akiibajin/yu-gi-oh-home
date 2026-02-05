use anyhow::Context;
use sqlx::PgPool;

pub async fn get_or_create_user_id_by_name(
	pool: &PgPool,
	name: &str,
) -> anyhow::Result<Option<String>> {
	let name = name.trim();
	if name.is_empty() {
		return Ok(None);
	}

	let existing = sqlx::query_scalar::<_, String>(
		r#"
		SELECT id
		FROM users
		WHERE name ILIKE $1
		LIMIT 1
		"#,
	)
	.bind(name)
	.persistent(false)
	.fetch_optional(pool)
	.await
	.context("failed to fetch user by name")?;

	if existing.is_some() {
		return Ok(existing);
	}

	let generated_id = name.to_lowercase().replace(' ', "-");

	let inserted = sqlx::query_scalar::<_, String>(
		r#"
		INSERT INTO users (id, name)
		VALUES ($1, $2)
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name
		RETURNING id
		"#,
	)
	.bind(&generated_id)
	.bind(name)
	.persistent(false)
	.fetch_one(pool)
	.await
	.context("failed to insert user")?;

	Ok(Some(inserted))
}
