use std::sync::Arc;

use crate::application::services::lock_service::LockServiceTrait;

use super::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub lock_service: Arc<dyn LockServiceTrait>,
}

impl AppState {
    pub fn new(config: Config, lock_service: Arc<dyn LockServiceTrait>) -> Self {
        Self {
            config,
            lock_service,
        }
    }
}
