use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(PartialEq, Debug, Deserialize, Serialize)]
pub struct CreateLockRequest {
    pub label: Option<String>,
    pub total_shares: u8,
    pub threshold: u8,
    pub quests: Vec<CreateQuestRequest>,
}

#[derive(PartialEq, Debug, Deserialize, Serialize)]
pub struct CreateQuestRequest {
    pub share: String, // base64 encoded
    pub quest_type: String,
    pub data: HashMap<String, String>,
}
