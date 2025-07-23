use serde::{Deserialize, Serialize};
use sqlx::Type;
use strum_macros::EnumString;

#[derive(Debug, Clone, Deserialize, Serialize, EnumString, Type, PartialEq)]
#[sqlx(type_name = "quest_status", rename_all = "lowercase")]
pub enum QuestStatus {
    #[strum(serialize = "PENDING", serialize = "pending")]
    PENDING,
    #[strum(serialize = "COMPLETED", serialize = "completed")]
    COMPLETED,
}

impl std::fmt::Display for QuestStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            QuestStatus::PENDING => write!(f, "PENDING"),
            QuestStatus::COMPLETED => write!(f, "COMPLETED"),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize, EnumString, Type, PartialEq)]
#[sqlx(type_name = "quest_type", rename_all = "lowercase")]
pub enum QuestType {
    #[strum(serialize = "GEO", serialize = "geo")]
    GEO,
    #[strum(serialize = "TIME", serialize = "time")]
    TIME,
    #[strum(serialize = "FRIEND", serialize = "friend")]
    FRIEND,
    #[strum(serialize = "PAYWALL", serialize = "paywall")]
    PAYWALL,
}

impl std::fmt::Display for QuestType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            QuestType::GEO => write!(f, "GEO"),
            QuestType::TIME => write!(f, "TIME"),
            QuestType::FRIEND => write!(f, "FRIEND"),
            QuestType::PAYWALL => write!(f, "PAYWALL"),
        }
    }
}
