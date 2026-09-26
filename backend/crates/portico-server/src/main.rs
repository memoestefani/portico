#![allow(clippy::collapsible_if, clippy::uninlined_format_args)]

use std::net::SocketAddr;
use std::path::PathBuf;
use clap::Parser;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing::info;

use portico_server::{routes, state};

#[derive(Parser, Debug)]
#[command(name = "portico-server", version = "0.1.0", about = "Portico OS Backend Runtime")]
struct Args {
    #[arg(short, long, default_value = "3000")]
    port: u16,

    #[arg(short, long, default_value = "./data")]
    data_dir: PathBuf,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "portico_server=info,tower_http=info".into()),
        )
        .init();

    let args = Args::parse();
    info!("Starting Portico OS Server on port {} with data dir {:?}", args.port, args.data_dir);

    std::fs::create_dir_all(&args.data_dir)?;

    let app_state = state::AppState::new(args.data_dir);
    let app = routes::create_router(app_state)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([0, 0, 0, 0], args.port));
    info!("Listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
