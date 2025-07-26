use axum::{Json, Router, extract::State, response::IntoResponse, routing::post};
use axum_auth::AuthBearer;
use base64::prelude::*;

use crate::{
    api::schemas::requests::CreateLockRequest, application::exceptions::AppError,
    setup::app_state::AppState,
};

pub fn deserialize_quest_share(share: String) -> Result<String, AppError> {
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
    let user_id = state.auth_service.verify(&token).await?;
    let quests: Result<Vec<_>, AppError> = payload
        .quests
        .into_iter()
        .map(|quest| {
            let share = deserialize_quest_share(quest.share)?;
            Ok((share, quest.quest_type, quest.data))
        })
        .collect();
    let quests = quests?;

    let lock = state
        .lock_service
        .create_lock_with_quests(
            user_id.clone(),
            payload.label,
            payload.total_shares,
            payload.threshold,
            quests,
        )
        .await?;

    Ok(Json(lock))
}

pub fn lock_commands_router() -> Router<AppState> {
    Router::new().route("/lock/", post(create_lock_handler))
}
