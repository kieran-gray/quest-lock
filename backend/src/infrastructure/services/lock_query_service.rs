// TODO move to application layer at some point
use std::sync::Arc;

use async_trait::async_trait;
use tracing::info;
use uuid::Uuid;

use crate::{
    application::{
        dtos::lock::LockDTO, exceptions::AppError,
        services::lock_query_service::LockQueryServiceTrait,
    },
    domain::{
        lock::{repository::LockRepository as LockRepositoryInterface},
    },
};

pub struct LockQueryService {
    pub repo: Arc<dyn LockRepositoryInterface + Send + Sync>,
}

impl LockQueryService {
    pub fn create(lock_repo: Arc<dyn LockRepositoryInterface>) -> Arc<dyn LockQueryServiceTrait> {
        Arc::new(Self { repo: lock_repo })
    }

    fn _parse_id(&self, lock_id: &str) -> Result<Uuid, AppError> {
        match Uuid::try_parse(&lock_id) {
            Ok(id) => Ok(id),
            Err(_) => return Err(AppError::ValidationError(lock_id.to_string())),
        }
    }
}

#[async_trait]
impl LockQueryServiceTrait for LockQueryService {
    async fn get_lock_by_id(&self, user_id: String, lock_id: String) -> Result<LockDTO, AppError> {
        info!("Get lock by id - user_id: {user_id}, lock_id: {lock_id}");
        let parsed_lock_id = self._parse_id(&lock_id)?;

        let lock = self
            .repo
            .get_by_id(parsed_lock_id)
            .await
            .map_err(AppError::DatabaseError)?
            .ok_or_else(|| AppError::NotFound("Lock not found".to_string()))?;

        if lock.user_id != user_id {
            return Err(AppError::Unauthorised(
                "You are not authorised to access this resource".to_string(),
            ));
        }
        Ok(LockDTO::from(lock))
    }

    async fn get_locks(&self, user_id: String) -> Result<Vec<LockDTO>, AppError> {
        info!("Get locks request - user_id: {user_id}");
        let locks = self
            .repo
            .get_by_user_id(user_id)
            .await
            .map_err(AppError::DatabaseError)?;

        let lock_dtos = locks.into_iter().map(|lock| LockDTO::from(lock)).collect();

        Ok(lock_dtos)
    }
}
