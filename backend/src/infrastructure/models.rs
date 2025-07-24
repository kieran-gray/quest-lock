use crate::domain::{
    lock::entity::Lock,
    quest::entity::Quest,
    quest::enums::{QuestStatus, QuestType},
};
use crate::infrastructure::exceptions::InfrastructureError;
use sqlx::{FromRow, types::Json};
use std::{collections::HashMap, str::FromStr};
use uuid::Uuid;

#[derive(FromRow, Debug)]
pub struct LockModel {
    id: Uuid,
    user_id: String,
    label: Option<String>,
    total_shares: i16,
    threshold: i16,
}

impl LockModel {
    pub fn create(id: Uuid, user_id: String, label: Option<String>, total_shares: i16, threshold: i16) -> Self {
        Self {
            id,
            user_id,
            label,
            total_shares,
            threshold,
        }
    }
}

impl From<Lock> for LockModel {
    fn from(lock: Lock) -> Self {
        Self {
            id: lock.id,
            user_id: lock.user_id,
            label: lock.label,
            total_shares: lock.total_shares as i16,
            threshold: lock.threshold as i16,
        }
    }
}

#[derive(FromRow, Debug)]
pub struct QuestModel {
    id: Uuid,
    lock_id: Uuid,
    share: String,
    quest_type: String,
    status: String,
    data: Json<HashMap<String, String>>,
}

impl QuestModel {
    pub fn create(
        id: Uuid,
        lock_id: Uuid,
        share: String,
        quest_type: String,
        status: String,
        data: Json<HashMap<String, String>>,
    ) -> Self {
        Self {
            id,
            lock_id,
            share,
            quest_type,
            status,
            data,
        }
    }
}

impl From<Quest> for QuestModel {
    fn from(quest: Quest) -> Self {
        Self {
            id: quest.id,
            lock_id: quest.lock_id,
            share: quest.share,
            quest_type: quest.quest_type.to_string(),
            status: quest.status.to_string(),
            data: Json(quest.data),
        }
    }
}

impl TryFrom<QuestModel> for Quest {
    type Error = InfrastructureError;

    fn try_from(row: QuestModel) -> Result<Self, Self::Error> {
        Ok(Quest {
            id: row.id,
            lock_id: row.lock_id,
            share: row.share,
            quest_type: QuestType::from_str(&row.quest_type).map_err(|e| {
                InfrastructureError::DatabaseRowToDomainConversionError(format!(
                    "Failed to parse quest_type '{}': {}",
                    row.quest_type, e
                ))
            })?,
            status: QuestStatus::from_str(&row.status).map_err(|e| {
                InfrastructureError::DatabaseRowToDomainConversionError(format!(
                    "Failed to parse status '{}': {}",
                    row.status, e
                ))
            })?,
            data: row.data.0,
        })
    }
}

#[derive(Debug)]
pub struct LockWithQuests {
    pub lock: LockModel,
    pub quests: Vec<QuestModel>,
}

impl TryFrom<LockWithQuests> for Lock {
    type Error = InfrastructureError;

    fn try_from(data: LockWithQuests) -> Result<Self, Self::Error> {
        let quests: Result<Vec<Quest>, InfrastructureError> =
            data.quests.into_iter().map(Quest::try_from).collect();

        Ok(Lock {
            id: data.lock.id,
            user_id: data.lock.user_id,
            label: data.lock.label,
            total_shares: data.lock.total_shares as u8,
            threshold: data.lock.threshold as u8,
            quests: quests?,
        })
    }
}
