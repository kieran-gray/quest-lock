use super::entity::Quest;

use async_trait::async_trait;
use uuid::Uuid;

#[async_trait]
/// Trait representing repository-level operations for Quest entities.
/// Provides methods for saving, retrieving, updating, and deleting Quests in the database.
pub trait QuestRepository: Send + Sync {
    async fn get_by_id(&self, id: Uuid) -> Result<Option<Quest>, sqlx::Error>;

    async fn save(&self, quest: &Quest) -> Result<bool, sqlx::Error>;

    async fn delete(&self, quest: &Quest) -> Result<bool, sqlx::Error>;
}
