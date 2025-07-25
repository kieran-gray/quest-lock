use axum::{Json, Router, extract::State, response::IntoResponse, routing::post};
use axum_auth::AuthBearer;
use base64::prelude::*;

use crate::{
    api::schemas::requests::CreateLockRequest, application::exceptions::AppError,
    setup::app_state::AppState,
};

pub fn serialize_quest_share(share: String) -> Result<String, AppError> {
    match BASE64_STANDARD.decode(share) {
        Ok(share_bytes) => match String::from_utf8(share_bytes) {
            Ok(share) => Ok(share),
            Err(_) => return Err(AppError::InvalidQuestShare),
        },
        Err(_) => return Err(AppError::InvalidQuestShare),
    }
}

pub async fn create_lock_handler(
    State(state): State<AppState>,
    AuthBearer(token): AuthBearer,
    Json(payload): Json<CreateLockRequest>,
) -> Result<impl IntoResponse, AppError> {
    // TODO: 1 million database calls lol (am I a startup yet)
    let user_id = state.auth_service.verify(&token).await?;

    let lock = state
        .lock_service
        .create_lock(
            user_id.clone(),
            payload.label,
            payload.total_shares,
            payload.threshold,
        )
        .await?;

    for quest in payload.quests {
        let share = serialize_quest_share(quest.share)?;
        state
            .lock_service
            .plan_quest(lock.id.clone(), share, quest.quest_type, quest.data)
            .await?;
    }

    let lock = state
        .lock_query_service
        .get_lock_by_id(user_id, lock.id)
        .await?;

    Ok(Json(lock))
}

pub fn lock_commands_router() -> Router<AppState> {
    Router::new().route("/lock/", post(create_lock_handler))
}
