import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });
config();

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://school:school123@localhost:5432/school_lms?schema=public",
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const email = "herkintormiwer@gmail.com";
const password = "herdey20";

const hash = await bcrypt.hash(password, 12);
const user = await prisma.user.upsert({
  where: { email },
  update: {
    password: hash,
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    emailVerified: new Date(),
    onboardingCompleted: true,
  },
  create: {
    email,
    password: hash,
    firstName: "Herkintor",
    lastName: "Mwer",
    role: UserRole.SUPER_ADMIN,
    emailVerified: new Date(),
    onboardingCompleted: true,
    isActive: true,
  },
});

await prisma.staff.upsert({
  where: { userId: user.id },
  update: {
    department: "Executive",
    designation: "Super Administrator",
    employeeId: "EMP-SA-OWNER",
  },
  create: {
    userId: user.id,
    employeeId: "EMP-SA-OWNER",
    department: "Executive",
    designation: "Super Administrator",
    joiningDate: new Date("2020-01-15"),
  },
});

console.log(`✓ Super admin ready: ${user.email} (${user.role})`);

await prisma.$disconnect();
await pool.end();
