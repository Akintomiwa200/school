import "dotenv/config";
import { defineConfig } from "prisma/config";

// Fallback allows `prisma generate` during install before .env.local exists
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://school:school123@localhost:5432/school_lms?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
