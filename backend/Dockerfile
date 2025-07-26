FROM rust:1.86-slim AS chef
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libssl-dev \
    pkg-config && \
    rm -rf /var/lib/apt/lists/*

RUN cargo install cargo-chef
WORKDIR /app

FROM chef AS planner
COPY Cargo.toml Cargo.lock ./
COPY src/ src/
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

COPY . .
ENV SQLX_OFFLINE=true
RUN cargo build --release --locked && \
    cargo build --release --locked --bin health_check && \
    strip target/release/quest_lock_backend && \
    strip target/release/health_check

FROM gcr.io/distroless/cc-debian12 AS runtime
WORKDIR /app
COPY --from=builder /app/target/release/quest_lock_backend ./quest_lock_backend
COPY --from=builder /app/target/release/health_check ./health_check

ENV RUST_LOG=info

EXPOSE 8000
USER 1000

ENTRYPOINT ["./quest_lock_backend"]