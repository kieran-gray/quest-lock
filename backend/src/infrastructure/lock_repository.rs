use std::collections::HashMap;
use std::sync::Arc;

use crate::domain::{
    lock::entity::Lock, lock::repository::LockRepository as LockRepositoryInterface,
};
use crate::infrastructure::exceptions::InfrastructureError;
use crate::infrastructure::models::{LockModel, LockWithQuests, QuestModel};
use async_trait::async_trait;
use sqlx::{Pool, Postgres};
use uuid::Uuid;

#[derive(sqlx::FromRow)]
struct FlatLockQuestRow {
    lock_id: Uuid,
    lock_user_id: String,
    lock_label: Option<String>,
    lock_total_shares: i16,
    lock_threshold: i16,

    quest_id: Option<Uuid>,
    quest_share: Option<String>,
    quest_type: Option<String>,
    quest_status: Option<String>,
    quest_data: Option<serde_json::Value>,
}

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
                user_id,
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
                    lock_row.user_id,
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

    async fn get_by_user_id(&self, user_id: String) -> Result<Vec<Lock>, sqlx::Error> {
        let rows = sqlx::query_as!(
            FlatLockQuestRow,
            r#"
            SELECT 
                l.id as "lock_id!",
                l.user_id as "lock_user_id!",
                l.label as "lock_label",
                l.total_shares as "lock_total_shares!",
                l.threshold as "lock_threshold!",
                q.id as "quest_id",
                q.share as "quest_share",
                q.quest_type,
                q.status as "quest_status",
                q.data as "quest_data"
            FROM 
                locks l
            LEFT JOIN 
                quests q ON l.id = q.lock_id
            WHERE 
                l.user_id = $1
            ORDER BY 
                l.id  -- Ordering is important for predictable grouping
            "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;

        let mut locks_with_quests_map: HashMap<Uuid, LockWithQuests> = HashMap::new();

        for row in rows {
            let lock_entry =
                locks_with_quests_map
                    .entry(row.lock_id)
                    .or_insert_with(|| LockWithQuests {
                        lock: LockModel::create(
                            row.lock_id,
                            row.lock_user_id.clone(),
                            row.lock_label.clone(),
                            row.lock_total_shares,
                            row.lock_threshold,
                        ),
                        quests: Vec::new(),
                    });

            if let (Some(quest_id), Some(share), Some(quest_type), Some(status), Some(data_json)) = (
                row.quest_id,
                row.quest_share,
                row.quest_type,
                row.quest_status,
                row.quest_data,
            ) {
                let data_map: HashMap<String, String> = serde_json::from_value(data_json)
                    .map_err(|e| sqlx::Error::Decode(Box::new(e)))?;

                let quest_model = QuestModel::create(
                    quest_id,
                    row.lock_id,
                    share,
                    quest_type,
                    status,
                    sqlx::types::Json(data_map),
                );
                lock_entry.quests.push(quest_model);
            }
        }

        let locks_result: Result<Vec<Lock>, InfrastructureError> = locks_with_quests_map
            .into_values()
            .map(Lock::try_from)
            .collect();

        locks_result.map_err(|e| sqlx::Error::Decode(Box::new(e)))
    }
    async fn save(&self, lock: &Lock) -> Result<bool, sqlx::Error> {
        let mut tx = self.pool.begin().await?;

        let lock_res = sqlx::query!(
            r#"
            INSERT INTO locks (
                id, user_id, label, total_shares, threshold
            ) VALUES (
                $1, $2, $3, $4, $5
            )
            ON CONFLICT (id) DO UPDATE SET
                label = EXCLUDED.label,
                updated_at = NOW()
            "#,
            lock.id,
            lock.user_id,
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
