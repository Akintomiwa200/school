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

async function main() {
  const schools = await prisma.school.findMany();
  if (schools.length === 0) {
    console.log("No schools found. Run seed-schools.ts first.");
    return;
  }

  const usersToCreate = [
    // Greenfield
    { firstName: "James", lastName: "Admin", email: "admin@greenfield.edu", role: "ADMIN" as const, schoolName: "Greenfield International School" },
    { firstName: "Sarah", lastName: "Chen", email: "s.chen@greenfield.edu", role: "TEACHER" as const, schoolName: "Greenfield International School" },
    { firstName: "David", lastName: "Okafor", email: "d.okafor@greenfield.edu", role: "TEACHER" as const, schoolName: "Greenfield International School" },
    { firstName: "Fatima", lastName: "Abubakar", email: "f.abubakar@greenfield.edu", role: "STUDENT" as const, schoolName: "Greenfield International School" },
    { firstName: "Kemi", lastName: "Adeyemi", email: "k.adeyemi@greenfield.edu", role: "STUDENT" as const, schoolName: "Greenfield International School" },
    { firstName: "Chioma", lastName: "Eze", email: "c.eze@greenfield.edu", role: "ACCOUNTANT" as const, schoolName: "Greenfield International School" },
    // Riverside
    { firstName: "Michael", lastName: "Taiwo", email: "m.taiwo@riverside.edu", role: "ADMIN" as const, schoolName: "Riverside Academy" },
    { firstName: "Amara", lastName: "Osei", email: "a.osei@riverside.edu", role: "TEACHER" as const, schoolName: "Riverside Academy" },
    { firstName: "Tunde", lastName: "Bakare", email: "t.bakare@riverside.edu", role: "STUDENT" as const, schoolName: "Riverside Academy" },
    { firstName: "Ngozi", lastName: "Umeh", email: "n.umeh@riverside.edu", role: "STUDENT" as const, schoolName: "Riverside Academy" },
    // Summit
    { firstName: "Wanjiku", lastName: "Kamau", email: "w.kamau@summitprep.ac.ke", role: "ADMIN" as const, schoolName: "Summit Preparatory School" },
    { firstName: "Peter", lastName: "Otieno", email: "p.otieno@summitprep.ac.ke", role: "TEACHER" as const, schoolName: "Summit Preparatory School" },
    { firstName: "Aisha", lastName: "Mohamed", email: "a.mohamed@summitprep.ac.ke", role: "STUDENT" as const, schoolName: "Summit Preparatory School" },
    // Horizon
    { firstName: "Kwame", lastName: "Mensah", email: "k.mensah@horizon.edu.gh", role: "ADMIN" as const, schoolName: "Horizon College" },
  ];

  let created = 0;
  for (const u of usersToCreate) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      // Update schoolId if missing
      if (!existing.schoolId) {
        const school = schools.find((s) => s.name === u.schoolName);
        if (school) {
          await prisma.user.update({ where: { id: existing.id }, data: { schoolId: school.id } });
          console.log(`Linked ${u.email} to ${u.schoolName}`);
        }
      }
      continue;
    }
    const school = schools.find((s) => s.name === u.schoolName);
    if (!school) continue;
    await prisma.user.create({
      data: {
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        schoolId: school.id,
        isActive: true,
      },
    });
    created++;
    console.log(`Created: ${u.firstName} ${u.lastName} (${u.role}) @ ${u.schoolName}`);
  }

  console.log(`\nDone! Created ${created} users, linked ${usersToCreate.length - created} existing.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
