use anyhow::Context;
use sqlx::{postgres::PgPoolOptions, PgPool};

pub async fn init_db(db_url: &str) -> anyhow::Result<PgPool> {
	let pool = PgPoolOptions::new()
		.max_connections(5)
		.connect(db_url)
		.await
		.context("failed to connect to Postgres")?;

	sqlx::migrate!("./migrations")
		.run(&pool)
		.await
		.context("failed to run database migrations")?;

	Ok(pool)
}

pub async fn healthcheck(pool: &PgPool) -> anyhow::Result<()> {
	sqlx::query_scalar::<_, i32>("SELECT 1")
		.fetch_one(pool)
		.await
		.context("database healthcheck failed")?;
	Ok(())
}
