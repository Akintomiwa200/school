import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config();
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

const DEFAULT_PASSWORD = "herdey20";

async function upsertStaffUser(
  email: string,
  firstName: string,
  lastName: string,
  role: UserRole,
  employeeId: string,
  department: string,
  designation: string,
  password: string = DEFAULT_PASSWORD,
) {
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role,
      isActive: true,
      emailVerified: new Date(),
      onboardingCompleted: true,
    },
    create: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      emailVerified: new Date(),
      onboardingCompleted: true,
      isActive: true,
    },
  });

  await prisma.staff.upsert({
    where: { userId: user.id },
    update: { department, designation, employeeId },
    create: {
      userId: user.id,
      employeeId,
      department,
      designation,
      joiningDate: new Date("2020-01-15"),
    },
  });

  return user;
}

async function upsertConsumerUser(
  email: string,
  firstName: string,
  lastName: string,
  role: UserRole,
  onboardingCompleted: boolean,
  password: string = DEFAULT_PASSWORD,
) {
  const hashedPassword = await bcrypt.hash(password, 12);

  return prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role,
      isActive: true,
      emailVerified: new Date(),
      onboardingCompleted,
    },
    create: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      emailVerified: new Date(),
      onboardingCompleted,
      isActive: true,
    },
  });
}

async function main() {
  console.log("Seeding database...");
  console.log(`Default password for all seeded accounts: ${DEFAULT_PASSWORD}`);

  const superAdmin = await upsertStaffUser(
    "admin@school.com",
    "Super",
    "Admin",
    UserRole.SUPER_ADMIN,
    "EMP-SA-001",
    "Executive",
    "Super Administrator",
  );

  const ownerSuperAdmin = await upsertStaffUser(
    "herkintormiwer@gmail.com",
    "Herkintor",
    "Mwer",
    UserRole.SUPER_ADMIN,
    "EMP-SA-OWNER",
    "Executive",
    "Super Administrator",
  );

  const admin = await upsertStaffUser(
    "principal@school.com",
    "School",
    "Principal",
    UserRole.ADMIN,
    "EMP-AD-001",
    "Administration",
    "Principal",
  );

  const accountant = await upsertStaffUser(
    "accountant@school.com",
    "John",
    "Accountant",
    UserRole.ACCOUNTANT,
    "EMP-AC-001",
    "Finance",
    "Accountant",
  );

  const teacher = await upsertStaffUser(
    "teacher@school.com",
    "Jane",
    "Teacher",
    UserRole.TEACHER,
    "EMP-TE-001",
    "Academic",
    "Senior Teacher",
  );

  const opsStaff = await upsertStaffUser(
    "staff@school.com",
    "Alex",
    "Operations",
    UserRole.NON_TEACHING_STAFF,
    "EMP-NT-001",
    "Operations",
    "Operations Officer",
  );

  const librarian = await upsertStaffUser(
    "librarian@school.com",
    "Lisa",
    "Librarian",
    UserRole.LIBRARIAN,
    "EMP-LI-001",
    "Library",
    "Head Librarian",
  );

  const hr = await upsertStaffUser(
    "hr@school.com",
    "Helen",
    "Resources",
    UserRole.HR,
    "EMP-HR-001",
    "Human Resources",
    "HR Manager",
  );

  const receptionist = await upsertStaffUser(
    "reception@school.com",
    "Rita",
    "Reception",
    UserRole.RECEPTIONIST,
    "EMP-RE-001",
    "Front Desk",
    "Receptionist",
  );

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

  const parentUser = await upsertConsumerUser(
    "parent@school.com",
    "Patricia",
    "Parent",
    UserRole.PARENT,
    true,
  );

  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      occupation: "Engineer",
      relationship: "Mother",
    },
  });

  const studentUser = await upsertConsumerUser(
    "student@school.com",
    "Sam",
    "Student",
    UserRole.STUDENT,
    true,
  );

  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: { parentId: parent.id, classId: defaultClass.id },
    create: {
      userId: studentUser.id,
      admissionNumber: "ADM-2025-001",
      classId: defaultClass.id,
      rollNumber: "10A-01",
      parentId: parent.id,
    },
  });

  console.log("\n✓ Seed completed. Test accounts:\n");
  console.log("Staff portal (/staff/login):");
  console.log("  herkintormiwer@gmail.com  — Super Admin (owner)");
  console.log("  admin@school.com          — Super Admin");
  console.log("  principal@school.com      — Admin");
  console.log("  teacher@school.com        — Teacher");
  console.log("  accountant@school.com     — Accountant");
  console.log("  staff@school.com          — Non-teaching staff");
  console.log("  librarian@school.com      — Librarian");
  console.log("  hr@school.com             — HR");
  console.log("  reception@school.com      — Receptionist");
  console.log("\nStudent/parent portal (/login):");
  console.log("  student@school.com        — Student (OTP after password)");
  console.log("  parent@school.com         — Parent (OTP after password)");
  console.log(`\nPassword for all: ${DEFAULT_PASSWORD}`);
  console.log("\nStaff users:", {
    ownerSuperAdmin: ownerSuperAdmin.email,
    superAdmin: superAdmin.email,
    admin: admin.email,
    teacher: teacher.email,
    accountant: accountant.email,
    opsStaff: opsStaff.email,
    librarian: librarian.email,
    hr: hr.email,
    receptionist: receptionist.email,
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
