/**
 * Verify auth flows against local PostgreSQL.
 * Usage: node scripts/verify-auth.mjs
 * Requires: pnpm db:setup completed, dev server optional for staff sign-in API test
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://school:school123@localhost:5432/school_lms?schema=public",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PASSWORD = "Password123!";

const STAFF_ACCOUNTS = [
  { email: "admin@school.com", role: "SUPER_ADMIN" },
  { email: "principal@school.com", role: "ADMIN" },
  { email: "teacher@school.com", role: "TEACHER" },
  { email: "accountant@school.com", role: "ACCOUNTANT" },
  { email: "staff@school.com", role: "NON_TEACHING_STAFF" },
  { email: "librarian@school.com", role: "LIBRARIAN" },
  { email: "hr@school.com", role: "HR" },
  { email: "reception@school.com", role: "RECEPTIONIST" },
];

const CONSUMER_ACCOUNTS = [
  { email: "student@school.com", role: "STUDENT" },
  { email: "parent@school.com", role: "PARENT" },
];

async function checkPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.password) return { ok: false, reason: "no user/password" };
  const valid = await bcrypt.compare(PASSWORD, user.password);
  return {
    ok: valid,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
    emailVerified: Boolean(user.emailVerified),
  };
}

async function main() {
  console.log("Connecting to PostgreSQL...");
  await prisma.$queryRaw`SELECT 1`;
  console.log("✓ Database connected\n");

  console.log("Staff accounts (password login via /staff/login):");
  for (const account of STAFF_ACCOUNTS) {
    const result = await checkPassword(account.email);
    const status = result.ok && result.role === account.role ? "✓" : "✗";
    console.log(
      `  ${status} ${account.email} — ${result.role ?? "missing"} (onboarding: ${result.onboardingCompleted})`,
    );
  }

  console.log("\nConsumer accounts (password + OTP via /login):");
  for (const account of CONSUMER_ACCOUNTS) {
    const result = await checkPassword(account.email);
    const status = result.ok && result.role === account.role ? "✓" : "✗";
    console.log(
      `  ${status} ${account.email} — ${result.role ?? "missing"} (verified: ${result.emailVerified})`,
    );
  }

  const totalUsers = await prisma.user.count();
  console.log(`\nTotal users in database: ${totalUsers}`);
  console.log(`\nDefault password: ${PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("\n✗ Auth verification failed:");
    console.error(err.message ?? err);
    console.error("\nFix DATABASE_URL in web/.env.local to match your local Postgres, then run:");
    console.error("  pnpm db:setup");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
