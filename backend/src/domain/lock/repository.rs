use super::entity::Lock;

use async_trait::async_trait;
use uuid::Uuid;

#[async_trait]
/// Trait representing repository-level operations for Lock entities.
/// Provides methods for saving, retrieving, updating, and deleting Locks in the database.
pub trait LockRepository: Send + Sync {
    async fn get_by_id(&self, id: Uuid) -> Result<Option<Lock>, sqlx::Error>;

    async fn get_by_user_id(&self, user_id: String) -> Result<Vec<Lock>, sqlx::Error>;

    async fn save(&self, lock: &Lock) -> Result<bool, sqlx::Error>;

    async fn delete(&self, lock: &Lock) -> Result<bool, sqlx::Error>;
}
