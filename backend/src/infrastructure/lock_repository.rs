use std::collections::HashMap;
use std::sync::Arc;

use crate::domain::{
    lock::entity::Lock, lock::repository::LockRepository as LockRepositoryInterface,
};
use crate::infrastructure::models::{LockModel, LockWithQuests, QuestModel};
use async_trait::async_trait;
use sqlx::{Pool, Postgres};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct LockRepository {
    pool: Pool<Postgres>,
}

impl LockRepository {
    pub fn create(pool: Pool<Postgres>) -> Arc<dyn LockRepositoryInterface> {
        Arc::new(Self { pool })
    }

    fn serialize_quest_data(
        data: &HashMap<String, String>,
    ) -> Result<serde_json::Value, sqlx::Error> {
        serde_json::to_value(data).map_err(|e| sqlx::Error::Encode(Box::new(e)))
    }
}

#[async_trait]
impl LockRepositoryInterface for LockRepository {
    async fn get_by_id(&self, id: Uuid) -> Result<Option<Lock>, sqlx::Error> {
        let lock_row = sqlx::query!(
            r#"SELECT 
                id,
                label,
                total_shares,
                threshold
            FROM locks
            WHERE id = $1"#,
            id
        )
        .fetch_optional(&self.pool)
        .await?;

        match lock_row {
            Some(lock_row) => {
                let quest_rows = sqlx::query!(
                    r#"SELECT
                        id,
                        lock_id,
                        share,
                        quest_type,
                        status,
                        data as "data: serde_json::Value"
                    FROM quests
                    WHERE lock_id = $1
                    ORDER BY id"#,
                    id
                )
                .fetch_all(&self.pool)
                .await?;

                let mut quest_models = Vec::new();
                for quest_row in quest_rows {
                    let data: HashMap<String, String> = serde_json::from_value(quest_row.data)
                        .map_err(|e| sqlx::Error::Decode(Box::new(e)))?;

                    let quest_model = QuestModel::create(
                        quest_row.id,
                        quest_row.lock_id,
                        quest_row.share,
                        quest_row.quest_type,
                        quest_row.status,
                        sqlx::types::Json(data),
                    );
                    quest_models.push(quest_model);
                }

                let lock_model = LockModel::create(
                    lock_row.id,
                    lock_row.label,
                    lock_row.total_shares,
                    lock_row.threshold,
                );

                let lock_with_quests = LockWithQuests {
                    lock: lock_model,
                    quests: quest_models,
                };

                match Lock::try_from(lock_with_quests) {
                    Ok(lock) => Ok(Some(lock)),
                    Err(conv_err) => Err(sqlx::Error::Decode(Box::new(conv_err))),
                }
            }
            None => Ok(None),
        }
    }

    async fn save(&self, lock: &Lock) -> Result<bool, sqlx::Error> {
        let mut tx = self.pool.begin().await?;

        let lock_res = sqlx::query!(
            r#"
            INSERT INTO locks (
                id, label, total_shares, threshold
            ) VALUES (
                $1, $2, $3, $4
            )
            ON CONFLICT (id) DO UPDATE SET
                label = EXCLUDED.label,
                total_shares = EXCLUDED.total_shares,
                threshold = EXCLUDED.threshold,
                updated_at = NOW()
            "#,
            lock.id,
            lock.label,
            lock.total_shares as i16,
            lock.threshold as i16
        )
        .execute(&mut *tx)
        .await?;

        for quest in &lock.quests {
            let data_json = Self::serialize_quest_data(&quest.data)?;

            sqlx::query!(
                r#"
                INSERT INTO quests (
                    id, lock_id, share, quest_type, status, data
                ) VALUES (
                    $1, $2, $3, $4, $5, $6
                )
                ON CONFLICT (id) DO UPDATE SET
                    status = EXCLUDED.status,
                    updated_at = NOW()
                "#,
                quest.id,
                quest.lock_id,
                quest.share,
                quest.quest_type.to_string(),
                quest.status.to_string(),
                data_json
            )
            .execute(&mut *tx)
            .await?;
        }
        tx.commit().await?;

        Ok(lock_res.rows_affected() > 0)
    }

    async fn delete(&self, lock: &Lock) -> Result<bool, sqlx::Error> {
        let res = sqlx::query!(r#"DELETE FROM locks WHERE id = $1"#, lock.id)
            .execute(&self.pool)
            .await?;

        Ok(res.rows_affected() > 0)
    }
}
