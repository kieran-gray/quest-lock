use sqlx::PgPool;

use crate::infrastructure::services::auth_service::AuthService;
use crate::infrastructure::services::lock_query_service::LockQueryService;
use crate::infrastructure::{lock_repository::LockRepository, services::lock_service::LockService};
use crate::setup::app_state::AppState;
use crate::setup::config::Config;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

pub fn build_app_state(pool: PgPool, config: Config) -> AppState {
    let lock_repository = LockRepository::create(pool.clone());

    let lock_service = LockService::create(lock_repository.clone());

    let lock_query_service = LockQueryService::create(lock_repository.clone());

    let auth_service = AuthService::create(&config.auth_jwks_url);

    AppState::new(config, lock_service, lock_query_service, auth_service)
}

pub fn setup_tracing() {
    dotenv::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,sqlx=info,tower_http=info,axum::rejection=trace".into()),
        )
        .with(
            tracing_subscriber::fmt::layer()
                .with_file(true)
                .with_line_number(true)
                .with_thread_ids(true)
                .with_thread_names(true)
                .with_target(true)
                .with_span_events(tracing_subscriber::fmt::format::FmtSpan::CLOSE),
        )
        .init();
}

pub async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("Failed to install CTRL+C signal handler");
}
