use axum::{
    Json, Router,
    extract::{Path, State},
    response::IntoResponse,
    routing::get,
};
use axum_auth::AuthBearer;

use crate::{application::exceptions::AppError, setup::app_state::AppState};

pub async fn get_lock_by_id_handler(
    State(state): State<AppState>,
    AuthBearer(token): AuthBearer,
    Path(lock_id): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = state.auth_service.verify(&token).await?;
    let lock = state
        .lock_query_service
        .get_lock_by_id(user_id, lock_id)
        .await?;
    Ok(Json(lock))
}

pub async fn get_locks_handler(
    State(state): State<AppState>,
    AuthBearer(token): AuthBearer,
) -> Result<impl IntoResponse, AppError> {
    let user_id = state.auth_service.verify(&token).await?;
    let locks = state.lock_query_service.get_locks(user_id).await?;
    Ok(Json(locks))
}

pub fn lock_queries_router() -> Router<AppState> {
    Router::new()
        .route("/lock-query/{lock_id}", get(get_lock_by_id_handler))
        .route("/lock-query/", get(get_locks_handler))
}
