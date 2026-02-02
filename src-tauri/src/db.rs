use anyhow::Context;
use sqlx::{postgres::PgConnectOptions, postgres::PgPoolOptions, PgPool};
use std::str::FromStr;

pub async fn init_db(db_url: &str) -> anyhow::Result<PgPool> {
	let is_pooler = {
		let u = db_url.to_lowercase();
		u.contains("pooler.supabase.com") || u.contains(":6543") || u.contains("pgbouncer=true")
	};

	let options = PgConnectOptions::from_str(db_url)
		.context("invalid Postgres connection string")?
		.statement_cache_capacity(0);

	let mut pool_options = PgPoolOptions::new().max_connections(5);
	if is_pooler {
		pool_options = pool_options.before_acquire(|conn, _meta| {
			Box::pin(async move {
				// Best-effort: clear any prepared statements left on the server connection.
				// This prevents `prepared statement "sqlx_s_*" already exists` errors.
				let _ = sqlx::query("DEALLOCATE ALL").execute(conn).await;
				Ok(true)
			})
		});
	}

	let pool = pool_options
		.connect_with(options)
		.await
		.context("failed to connect to Postgres")?;
    let result = sqlx::migrate!("./migrations")
		.run(&pool)
		.await
		.context("failed to run database migrations");
    match result {
		Ok(_) => Ok(pool),
		Err(_) => Ok(pool),
	}
}

pub async fn healthcheck(pool: &PgPool) -> anyhow::Result<()> {
	sqlx::query_scalar::<_, i32>("SELECT 1")
		.persistent(false)
		.fetch_one(pool)
		.await
		.context("database healthcheck failed")?;
	Ok(())
}
