use crate::application::{dtos::lock::LockDTO, exceptions::AppError};

use async_trait::async_trait;

#[async_trait]
pub trait LockQueryServiceTrait: Send + Sync {
    async fn get_lock_by_id(&self, user_id: String, lock_id: String) -> Result<LockDTO, AppError>;

    async fn get_locks(&self, user_id: String) -> Result<Vec<LockDTO>, AppError>;
}
