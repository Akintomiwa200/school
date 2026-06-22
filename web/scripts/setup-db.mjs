/**
 * Probe local PostgreSQL and write DATABASE_URL to .env.local when found.
 * Usage: node scripts/setup-db.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env.local");

const CANDIDATES = [
  process.env.DATABASE_URL,
  "postgresql://school:school123@localhost:5432/school_lms?schema=public",
  "postgresql://postgres:postgres@localhost:5432/school_lms?schema=public",
  "postgresql://postgres:postgres@localhost:5432/postgres?schema=public",
  "postgresql://postgres:@localhost:5432/school_lms?schema=public",
  "postgresql://postgres:admin@localhost:5432/school_lms?schema=public",
  "postgresql://postgres:password@localhost:5432/school_lms?schema=public",
].filter(Boolean);

async function tryConnect(url) {
  const pool = new pg.Pool({ connectionString: url, connectionTimeoutMillis: 4000 });
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  } finally {
    await pool.end();
  }
}

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
  console.log("Probing local PostgreSQL...\n");

  for (const url of CANDIDATES) {
    const masked = url.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
    process.stdout.write(`  Trying ${masked} ... `);
    if (await tryConnect(url)) {
      console.log("OK");
      updateEnvLocal(url);
      console.log(`\n✓ Updated web/.env.local with working DATABASE_URL`);
      console.log("\nNext steps:");
      console.log("  pnpm db:setup");
      console.log("  pnpm auth:verify");
      console.log("  pnpm dev");
      return;
    }
    console.log("failed");
  }

  console.error("\n✗ Could not connect to PostgreSQL with any known credentials.");
  console.error("\nEnsure PostgreSQL is running and create the database/user:");
  console.error(`
  CREATE USER school WITH PASSWORD 'school123';
  CREATE DATABASE school_lms OWNER school;
  GRANT ALL PRIVILEGES ON DATABASE school_lms TO school;
`);
  console.error("Then set DATABASE_URL in web/.env.local and run: pnpm db:setup");
  process.exit(1);
}

main();
