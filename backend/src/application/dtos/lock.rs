use crate::{application::dtos::quest::QuestDTO, domain::lock::entity::Lock};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LockDTO {
    pub id: String,
    pub label: Option<String>,
    pub total_shares: u8,
    pub threshold: u8,
    pub quests: Vec<QuestDTO>,
}

impl From<Lock> for LockDTO {
    fn from(lock: Lock) -> Self {
        Self {
            id: lock.id.to_string(),
            label: lock.label,
            total_shares: lock.total_shares,
            threshold: lock.threshold,
            quests: lock.quests.into_iter().map(QuestDTO::from).collect(),
        }
    }
}
