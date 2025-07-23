FROM rust:1.86-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y libssl-dev pkg-config curl

COPY . .

ENV SQLX_OFFLINE=true

RUN cargo build --release

FROM debian:stable-slim AS production

WORKDIR /app

RUN apt-get update && apt-get install -y libssl3 ca-certificates curl file && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/quest_lock_backend .

ENV RUST_LOG=info

ENTRYPOINT ["/app/quest_lock_backend"]