use crate::application::{exceptions::AppError};
use async_trait::async_trait;

#[async_trait]
pub trait AuthServiceTrait: Send + Sync {
    async fn verify(
        &self,
        token: &str,
    ) -> Result<bool, AppError>;
}
