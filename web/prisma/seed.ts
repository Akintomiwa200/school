import "dotenv/config";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("Password123!", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@school.com" },
    update: { onboardingCompleted: true },
    create: {
      email: "admin@school.com",
      password: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
      onboardingCompleted: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "principal@school.com" },
    update: { onboardingCompleted: true },
    create: {
      email: "principal@school.com",
      password: hashedPassword,
      firstName: "School",
      lastName: "Principal",
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      onboardingCompleted: true,
    },
  });

  const accountant = await prisma.user.upsert({
    where: { email: "accountant@school.com" },
    update: { onboardingCompleted: true },
    create: {
      email: "accountant@school.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Accountant",
      role: UserRole.ACCOUNTANT,
      emailVerified: new Date(),
      onboardingCompleted: true,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@school.com" },
    update: { onboardingCompleted: true },
    create: {
      email: "teacher@school.com",
      password: hashedPassword,
      firstName: "Jane",
      lastName: "Teacher",
      role: UserRole.TEACHER,
      emailVerified: new Date(),
      onboardingCompleted: true,
    },
  });

  const academicYear = await prisma.academicYear.upsert({
    where: { id: "default-year" },
    update: {},
    create: {
      id: "default-year",
      name: "2025-2026",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-06-30"),
      isCurrent: true,
    },
  });

  const defaultClass = await prisma.class.upsert({
    where: { id: "default-class" },
    update: {},
    create: {
      id: "default-class",
      name: "Grade 10",
      section: "A",
      academicYearId: academicYear.id,
      capacity: 40,
    },
  });

  await prisma.staff.upsert({
    where: { userId: teacher.id },
    update: {},
    create: {
      userId: teacher.id,
      employeeId: "EMP001",
      department: "Academic",
      designation: "Senior Teacher",
      joiningDate: new Date("2020-01-15"),
    },
  });

  console.log("Seed completed:", {
    superAdmin: superAdmin.email,
    admin: admin.email,
    accountant: accountant.email,
    teacher: teacher.email,
    academicYear: academicYear.name,
    defaultClass: defaultClass.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
