// TODO move to application layer at some point
use std::{collections::HashMap, str::FromStr, sync::Arc};

use async_trait::async_trait;
use uuid::Uuid;

use crate::{
    application::{
        dtos::lock::LockDTO, exceptions::AppError, services::lock_service::LockServiceTrait,
    },
    domain::{
        lock::{entity::Lock, repository::LockRepository as LockRepositoryInterface},
        quest::{entity::Quest, enums::QuestType},
    },
};

pub struct LockService {
    pub repo: Arc<dyn LockRepositoryInterface + Send + Sync>,
}

impl LockService {
    pub fn create(lock_repo: Arc<dyn LockRepositoryInterface>) -> Arc<dyn LockServiceTrait> {
        Arc::new(Self { repo: lock_repo })
    }

    fn _parse_id(&self, lock_id: &str) -> Result<Uuid, AppError> {
        match Uuid::try_parse(&lock_id) {
            Ok(id) => Ok(id),
            Err(_) => return Err(AppError::ValidationError(lock_id.to_string())),
        }
    }

    async fn _get_lock(&self, lock_id: &str) -> Result<Option<Lock>, AppError> {
        let lock_id = self._parse_id(lock_id).unwrap();
        match self.repo.get_by_id(lock_id).await {
            Ok(lock) => Ok(lock),
            Err(err) => Err(AppError::DatabaseError(err)),
        }
    }
}

#[async_trait]
impl LockServiceTrait for LockService {
    async fn create_lock(
        &self,
        user_id: String,
        label: Option<String>,
        total_shares: u8,
        threshold: u8,
    ) -> Result<LockDTO, AppError> {
        let lock = Lock::create(user_id, label, total_shares, threshold, vec![]);

        if let Err(err) = self.repo.save(&lock).await {
            tracing::error!("Error creating lock: {err}");
            return Err(AppError::DatabaseError(err));
        }

        Ok(LockDTO::from(lock))
    }

    async fn plan_quest(
        &self,
        lock_id: String,
        share: String,
        quest_type: String,
        data: HashMap<String, String>,
    ) -> Result<LockDTO, AppError> {
        let quest_type = QuestType::from_str(&quest_type);
        if let Err(error) = quest_type {
            return Err(AppError::ValidationError(error.to_string()));
        }
        let quest_type = quest_type.unwrap();
        let mut lock = self._get_lock(&lock_id).await.unwrap().unwrap();
        let quest = Quest::create(lock.id, share, quest_type, None, data);

        lock.quests.push(quest);
        if let Err(err) = self.repo.save(&lock).await {
            tracing::error!("Error planning quest: {err}");
            return Err(AppError::DatabaseError(err));
        }

        Ok(LockDTO::from(lock))
    }
}
