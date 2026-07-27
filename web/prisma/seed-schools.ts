import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const schools = [
  { name: "Greenfield International School", location: "Lagos, Nigeria", email: "info@greenfield.edu", phone: "+234-1-234-5678", status: "active" },
  { name: "Riverside Academy", location: "Abuja, Nigeria", email: "info@riverside.edu", phone: "+234-8-901-2345", status: "active" },
  { name: "Summit Preparatory School", location: "Nairobi, Kenya", email: "info@summitprep.ac.ke", phone: "+254-20-123-4567", status: "active" },
  { name: "Horizon College", location: "Accra, Ghana", email: "info@horizon.edu.gh", phone: "+233-30-123-4567", status: "provisioning" },
];

async function main() {
  for (const school of schools) {
    const existing = await prisma.school.findFirst({ where: { name: school.name } });
    if (!existing) {
      await prisma.school.create({ data: school });
      console.log(`Created: ${school.name}`);
    } else {
      console.log(`Exists: ${school.name}`);
    }
  }
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
