# Markdown

Below is a practical “getting started” for **Axum** (Rust), including routing, common extractors, middleware, and error handling.

## 1) Create a new project + `Cargo.toml`

```toml
# Cargo.toml
[package]
name = "axum_app"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.8"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tower-http = { version = "0.6", features = ["trace", "cors"] }
```
