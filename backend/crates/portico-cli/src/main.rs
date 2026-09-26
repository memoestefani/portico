use std::path::PathBuf;
use chrono::Utc;
use clap::{Parser, Subcommand};
use portico_core::db::control_plane::{
    get_tenant_by_slug, initialize_control_plane, insert_tenant, list_all_tenants,
    update_license_status,
};
use portico_core::db::data_plane::initialize_data_plane;
use portico_core::db::seed::seed_master_and_tenants;
use portico_core::domain::{LicenseStatus, NamingScheme, Tenant};
use rusqlite::Connection;
use uuid::Uuid;

#[derive(Parser)]
#[command(name = "portico-cli", version = "0.1.0", about = "Portico OS Multi-Tenant CLI")]
struct Cli {
    #[arg(short, long, default_value = "./data")]
    data_dir: PathBuf,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Seed the environment with Amor y Gracia Durango and Synthetic Church B
    Seed,

    /// Tenant management operations
    Tenant {
        #[command(subcommand)]
        command: TenantCommands,
    },
}

#[derive(Subcommand)]
enum TenantCommands {
    /// Create a new tenant with dedicated SQLite database
    Create {
        #[arg(long)]
        slug: String,
        #[arg(long)]
        name: String,
        #[arg(long)]
        domain: Option<String>,
        #[arg(long, default_value = "campus")]
        naming: String,
    },
    /// List all registered tenants in the Control Plane
    List,
    /// Suspend a tenant license
    Suspend {
        #[arg(long)]
        slug: String,
    },
    /// Activate a tenant license
    Activate {
        #[arg(long)]
        slug: String,
    },
}

fn get_master_conn(data_dir: &std::path::Path) -> rusqlite::Result<Connection> {
    std::fs::create_dir_all(data_dir).expect("Failed to create data dir");
    let master_path = data_dir.join("portico_master.db");
    let conn = Connection::open(&master_path)?;
    initialize_control_plane(&conn).expect("Failed to initialize control plane");
    Ok(conn)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();
    let data_dir = cli.data_dir;

    match cli.command {
        Commands::Seed => {
            println!("Seeding Portico OS master and tenant databases in {:?}...", data_dir);
            let master_conn = get_master_conn(&data_dir)?;
            let result = seed_master_and_tenants(&master_conn, &data_dir)?;
            println!("Seeding complete!");
            println!("  [Tenant A] Slug: {} | Church: {} | DB: {}", result.tenant_a.slug, result.tenant_a.church_name, result.tenant_a.db_path);
            println!("  [Tenant B] Slug: {} | Church: {} | DB: {}", result.tenant_b.slug, result.tenant_b.church_name, result.tenant_b.db_path);
        }
        Commands::Tenant { command } => {
            let master_conn = get_master_conn(&data_dir)?;
            match command {
                TenantCommands::Create { slug, name, domain, naming } => {
                    let tenants_dir = data_dir.join("tenants");
                    std::fs::create_dir_all(&tenants_dir)?;

                    let tenant_id = Uuid::new_v4().to_string();
                    let db_path = tenants_dir.join(format!("{}.db", tenant_id));

                    let naming_scheme = match naming.to_lowercase().as_str() {
                        "iglesia" => NamingScheme::iglesia(),
                        "casa" => NamingScheme::casa(),
                        _ => NamingScheme::campus(),
                    };

                    let tenant = Tenant {
                        id: tenant_id.clone(),
                        slug: slug.clone(),
                        domain,
                        church_name: name.clone(),
                        db_path: db_path.to_string_lossy().to_string(),
                        license_status: LicenseStatus::Active,
                        naming_scheme,
                        created_at: Utc::now(),
                        updated_at: Utc::now(),
                    };

                    insert_tenant(&master_conn, &tenant)?;

                    // Initialize tenant SQLite database DDL
                    let tenant_conn = Connection::open(&tenant.db_path)?;
                    initialize_data_plane(&tenant_conn)?;

                    println!("Tenant successfully provisioned:");
                    println!("  ID: {}", tenant.id);
                    println!("  Slug: {}", tenant.slug);
                    println!("  Church Name: {}", tenant.church_name);
                    println!("  Database: {}", tenant.db_path);
                }
                TenantCommands::List => {
                    let tenants = list_all_tenants(&master_conn)?;
                    println!("\nRegistered Tenants ({})", tenants.len());
                    println!("{:<36} {:<16} {:<10} {:<30}", "ID", "SLUG", "STATUS", "CHURCH NAME");
                    println!("{}", "-".repeat(95));
                    for t in tenants {
                        let status_str = match t.license_status {
                            LicenseStatus::Active => "active",
                            LicenseStatus::Trial => "trial",
                            LicenseStatus::Suspended => "suspended",
                        };
                        println!("{:<36} {:<16} {:<10} {:<30}", t.id, t.slug, status_str, t.church_name);
                    }
                }
                TenantCommands::Suspend { slug } => {
                    if let Some(t) = get_tenant_by_slug(&master_conn, &slug)? {
                        update_license_status(&master_conn, &t.id, LicenseStatus::Suspended)?;
                        println!("Tenant '{}' ({}) suspended.", t.church_name, slug);
                    } else {
                        eprintln!("Error: Tenant with slug '{}' not found.", slug);
                    }
                }
                TenantCommands::Activate { slug } => {
                    if let Some(t) = get_tenant_by_slug(&master_conn, &slug)? {
                        update_license_status(&master_conn, &t.id, LicenseStatus::Active)?;
                        println!("Tenant '{}' ({}) activated.", t.church_name, slug);
                    } else {
                        eprintln!("Error: Tenant with slug '{}' not found.", slug);
                    }
                }
            }
        }
    }

    Ok(())
}
