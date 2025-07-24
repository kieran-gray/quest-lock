use serde::Deserialize;
use sqlx::{
    PgPool,
    postgres::{PgConnectOptions, PgPoolOptions},
};
use std::{env, str::FromStr};

#[derive(Default, Clone, Debug, Deserialize)]
pub struct Config {
    pub environment: String,

    pub database_url: String,

    pub database_max_connections: u32,
    pub database_min_connections: u32,

    pub service_host: String,
    pub service_port: String,

    pub auth_jwks_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self, env::VarError> {
        dotenv::dotenv().ok();

        Ok(Self {
            environment: env::var("ENVIRONMENT")?,

            database_url: env::var("DATABASE_URL")?,

            database_max_connections: env::var("DATABASE_MAX_CONNECTIONS")
                .map(|s| s.parse::<u32>().unwrap_or(5))
                .unwrap_or(5),
            database_min_connections: env::var("DATABASE_MIN_CONNECTIONS")
                .map(|s| s.parse::<u32>().unwrap_or(1))
                .unwrap_or(1),

            service_host: env::var("SERVICE_HOST")?,
            service_port: env::var("SERVICE_PORT")?,

            auth_jwks_url: env::var("AUTH_JWKS_URL")?,
        })
    }
}

pub async fn setup_database(config: &Config) -> Result<PgPool, sqlx::Error> {
    let connect_options = PgConnectOptions::from_str(&config.database_url)
        .map_err(|e| {
            tracing::error!("Failed to parse database URL: {}", e);
            e
        })?
        .clone();

    let pool = PgPoolOptions::new()
        .max_connections(config.database_max_connections)
        .min_connections(config.database_min_connections)
        .connect_with(connect_options)
        .await?;

    Ok(pool)
}
