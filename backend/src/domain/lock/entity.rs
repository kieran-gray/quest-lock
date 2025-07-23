use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::quest::entity::Quest;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Lock {
    pub id: Uuid,
    pub label: Option<String>,
    pub total_shares: u8,
    pub threshold: u8,
    pub quests: Vec<Quest>,
}

impl Lock {
    pub fn create(
        label: Option<String>,
        total_shares: u8,
        threshold: u8,
        quests: Vec<Quest>,
    ) -> Self {
        return Self {
            id: Uuid::now_v7(),
            label,
            total_shares,
            threshold,
            quests,
        };
    }
}
