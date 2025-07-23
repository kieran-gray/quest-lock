use std::collections::HashMap;

use crate::application::{dtos::lock::LockDTO, exceptions::AppError};

use async_trait::async_trait;

#[async_trait]
pub trait LockServiceTrait: Send + Sync {
    async fn create_lock(
        &self,
        label: Option<String>,
        total_shares: u8,
        threshold: u8,
    ) -> Result<LockDTO, AppError>;

    async fn plan_quest(
        &self,
        lock_id: String,
        share: String,
        quest_type: String,
        data: HashMap<String, String>,
    ) -> Result<LockDTO, AppError>;
}
