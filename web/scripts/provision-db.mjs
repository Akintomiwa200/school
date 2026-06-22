/**
 * Provision school_lms database and school user on local PostgreSQL.
 * Usage:
 *   $env:POSTGRES_ADMIN_PASSWORD="your-postgres-password"
 *   node scripts/provision-db.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env.local");

const ADMIN_USER = process.env.POSTGRES_ADMIN_USER ?? "postgres";
const ADMIN_PASSWORD = process.env.POSTGRES_ADMIN_PASSWORD ?? "";
const DB_USER = "school";
const DB_PASSWORD = "school123";
const DB_NAME = "school_lms";
const TARGET_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public`;

function updateEnvLocal(url) {
  if (!existsSync(envPath)) {
    console.error("Missing .env.local — copy from .env.example first.");
    process.exit(1);
  }
  let content = readFileSync(envPath, "utf8");
  const line = `DATABASE_URL="${url}"`;
  if (/^DATABASE_URL=/m.test(content)) {
    content = content.replace(/^DATABASE_URL=.*$/m, line);
  } else {
    content += `\n${line}\n`;
  }
  writeFileSync(envPath, content, "utf8");
}

async function main() {
  if (!ADMIN_PASSWORD) {
    console.error("Set POSTGRES_ADMIN_PASSWORD to your local postgres superuser password.");
    console.error("Example (PowerShell):");
    console.error('  $env:POSTGRES_ADMIN_PASSWORD="your-password"');
    console.error("  node scripts/provision-db.mjs");
    process.exit(1);
  }

  const adminPool = new pg.Pool({
    connectionString: `postgresql://${ADMIN_USER}:${encodeURIComponent(ADMIN_PASSWORD)}@localhost:5432/postgres`,
    connectionTimeoutMillis: 5000,
  });

  try {
    await adminPool.query("SELECT 1");
    console.log(`✓ Connected as ${ADMIN_USER}`);
  } catch (err) {
    console.error("✗ Admin connection failed:", err.message);
    process.exit(1);
  }

  const roleExists = await adminPool.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [DB_USER]);
  if (roleExists.rowCount === 0) {
    await adminPool.query(`CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}'`);
    console.log(`✓ Created user ${DB_USER}`);
  } else {
    await adminPool.query(`ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}'`);
    console.log(`✓ Reset password for user ${DB_USER}`);
  }

  const dbExists = await adminPool.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
  if (dbExists.rowCount === 0) {
    await adminPool.query(`CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}`);
    console.log(`✓ Created database ${DB_NAME}`);
  } else {
    console.log(`✓ Database ${DB_NAME} already exists`);
  }

  await adminPool.query(`GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER}`);
  await adminPool.end();

  const appPool = new pg.Pool({ connectionString: TARGET_URL, connectionTimeoutMillis: 5000 });
  await appPool.query("SELECT 1");
  await appPool.end();

  updateEnvLocal(TARGET_URL);
  console.log(`✓ Updated .env.local`);
  console.log(`\nDATABASE_URL=${TARGET_URL}`);
  console.log("\nNext: pnpm db:setup && pnpm auth:verify");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
