use std::{sync::Arc, time::Duration};

use async_trait::async_trait;
use jwtk::jwk::RemoteJwksVerifier;
use serde_json::{Map, Value};

use crate::application::{exceptions::AppError, services::auth_service::AuthServiceTrait};

pub struct AuthService {
    pub jwks_verifier: RemoteJwksVerifier,
}

impl AuthService {
    pub fn create(auth_jwks_url: &str) -> Arc<dyn AuthServiceTrait> {
        Arc::new(Self {
            jwks_verifier: RemoteJwksVerifier::new(
                auth_jwks_url.to_string(),
                None,
                Duration::from_secs(3600),
            ),
        })
    }
}

#[async_trait]
impl AuthServiceTrait for AuthService {
    async fn verify(&self, token: &str) -> Result<String, AppError> {
        match self.jwks_verifier.verify::<Map<String, Value>>(token).await {
            Ok(res) => Ok(res.claims().sub.clone().unwrap()),
            Err(err) => Err(AppError::Unauthorised(err.to_string())),
        }
    }
}
