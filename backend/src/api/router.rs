use std::time::{Duration, Instant};

use crate::{
    api::routes::{lock_commands::lock_commands_router, lock_queries::lock_queries_router},
    setup::app_state::AppState,
};

use super::{exception_handler::handle_error, routes::admin::admin_router};
use http::header::{AUTHORIZATION, CONTENT_TYPE};
use http_body_util::BodyExt;

use axum::{
    Router,
    body::{Body, Bytes},
    error_handling::HandleErrorLayer,
    extract::Request,
    http::{HeaderValue, Method, Response, StatusCode},
    middleware::{self, Next},
    response::IntoResponse,
};

use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tower_http::services::ServeDir;
use tracing::{debug, info};

pub fn create_router(state: AppState) -> Router {
    let origins: Vec<HeaderValue> = state.config.cors_origins
        .split(',')
        .filter_map(|origin| {
            let trimmed = origin.trim();
            if trimmed.is_empty() {
                None
            } else {
                trimmed.parse::<HeaderValue>().ok()
            }
        })
        .collect();
    
    let cors = CorsLayer::new()
        .allow_origin(origins)
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE, Method::OPTIONS])
        .allow_headers([AUTHORIZATION, CONTENT_TYPE])
        .allow_credentials(true);

    let middleware_stack = ServiceBuilder::new()
        .layer(HandleErrorLayer::new(handle_error))
        .timeout(Duration::from_secs(1800))
        .layer(cors)
        .layer(middleware::from_fn(log_request_response));

    let app_routes = Router::new()
        .merge(admin_router())
        .merge(lock_queries_router())
        .merge(lock_commands_router());

    Router::new()
        .nest("/api/v1", app_routes)
        .fallback_service(ServeDir::new("assets"))
        .layer(middleware_stack)
        .with_state(state)
}

async fn log_request_response(
    req: Request,
    next: Next,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let method = req.method().clone();
    let uri = req.uri().clone();

    info!("--> {} {}", method, uri);

    let (req_parts, req_body) = req.into_parts();
    let req_bytes = buffer_and_print("request", req_body).await?;
    let req = Request::from_parts(req_parts, Body::from(req_bytes));

    let start = Instant::now();
    let res = next.run(req).await;
    let latency = start.elapsed();

    let status = res.status();

    let (res_parts, res_body) = res.into_parts();
    let res_bytes = buffer_and_print("response", res_body).await?;
    let res = Response::from_parts(res_parts, Body::from(res_bytes));

    info!(
        "<-- {} {} {} {}",
        status.as_u16(),
        method,
        uri,
        latency.as_micros()
    );

    Ok(res)
}

async fn buffer_and_print<B>(direction: &str, body: B) -> Result<Bytes, (StatusCode, String)>
where
    B: axum::body::HttpBody<Data = Bytes>,
    B::Error: std::fmt::Display,
{
    let bytes = match body.collect().await {
        Ok(collected) => collected.to_bytes(),
        Err(err) => {
            return Err((
                StatusCode::BAD_REQUEST,
                format!("failed to read {direction} body: {err}"),
            ));
        }
    };

    if let Ok(body) = std::str::from_utf8(&bytes) {
        debug!("{direction} body = {body:?}");
    }

    Ok(bytes)
}
