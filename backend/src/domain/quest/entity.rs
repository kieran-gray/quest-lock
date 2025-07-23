use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::enums::{QuestStatus, QuestType};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Quest {
    pub id: Uuid,
    pub lock_id: Uuid,
    pub share: String,
    pub quest_type: QuestType,
    pub status: QuestStatus,
    pub data: HashMap<String, String>,
}

impl Quest {
    pub fn create(
        lock_id: Uuid,
        share: String,
        quest_type: QuestType,
        status: Option<QuestStatus>,
        data: HashMap<String, String>,
    ) -> Self {
        return Self {
            id: Uuid::now_v7(),
            lock_id,
            share,
            quest_type,
            status: status.unwrap_or(QuestStatus::PENDING),
            data,
        };
    }
}
