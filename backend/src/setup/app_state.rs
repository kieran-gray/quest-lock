use std::sync::Arc;

use crate::application::services::{
    auth_service::AuthServiceTrait, lock_query_service::LockQueryServiceTrait,
    lock_service::LockServiceTrait,
};

use super::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub lock_service: Arc<dyn LockServiceTrait>,
    pub lock_query_service: Arc<dyn LockQueryServiceTrait>,
    pub auth_service: Arc<dyn AuthServiceTrait>,
}

impl AppState {
    pub fn new(
        config: Config,
        lock_service: Arc<dyn LockServiceTrait>,
        lock_query_service: Arc<dyn LockQueryServiceTrait>,
        auth_service: Arc<dyn AuthServiceTrait>,
    ) -> Self {
        Self {
            config,
            lock_service,
            lock_query_service,
            auth_service,
        }
    }
}
