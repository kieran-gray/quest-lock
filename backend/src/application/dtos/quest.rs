use std::collections::HashMap;

use crate::domain::quest::entity::Quest;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuestDTO {
    pub id: String,
    pub lock_id: String,
    pub share: Option<String>,
    pub quest_type: String,
    pub status: String,
    pub data: HashMap<String, String>,
}

impl From<Quest> for QuestDTO {
    fn from(quest: Quest) -> Self {
        Self {
            id: quest.id.to_string(),
            lock_id: quest.lock_id.to_string(),
            share: Some(quest.share), // TODO do not always return share duh
            quest_type: quest.quest_type.to_string(),
            status: quest.status.to_string(),
            data: quest.data,
        }
    }
}
