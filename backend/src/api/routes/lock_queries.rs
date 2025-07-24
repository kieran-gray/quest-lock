use axum::{
    extract::{Path, State}, response::IntoResponse, routing::get, Json, Router
};
use axum_auth::AuthBearer;

use crate::{
    application::exceptions::AppError,
    setup::app_state::AppState,
};

pub async fn get_lock_by_id_handler(
    State(state): State<AppState>,
    AuthBearer(token): AuthBearer,
    Path(lock_id): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    state.auth_service.verify(&token).await?;
    let lock = state
        .lock_query_service
        .get_lock_by_id("test".to_string(), lock_id)
        .await?;
    Ok(Json(lock))
}

pub fn lock_router() -> Router<AppState> {
    Router::new().route("/lock/{lock_id}", get(get_lock_by_id_handler))
}
