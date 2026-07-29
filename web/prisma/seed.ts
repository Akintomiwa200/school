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

  const teacherStaff = await prisma.staff.findUniqueOrThrow({ where: { userId: teacher.id } });
  const librarianStaff = await prisma.staff.findUniqueOrThrow({ where: { userId: librarian.id } });
  const accountantStaff = await prisma.staff.findUniqueOrThrow({ where: { userId: accountant.id } });
  const opsStaffRecord = await prisma.staff.findUniqueOrThrow({ where: { userId: opsStaff.id } });

  await prisma.leaveRequest.upsert({
    where: { id: "leave-seed-1" },
    update: { status: "APPROVED", approvedBy: hr.id, approvedAt: new Date() },
    create: {
      id: "leave-seed-1",
      userId: librarian.id,
      type: "Sick leave",
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      reason: "Medical recovery period approved by HR.",
      status: "APPROVED",
      approvedBy: hr.id,
      approvedAt: new Date(),
    },
  });

  await prisma.leaveRequest.upsert({
    where: { id: "leave-seed-2" },
    update: {},
    create: {
      id: "leave-seed-2",
      userId: accountant.id,
      type: "Annual leave",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
      reason: "Family travel plans during mid-term break.",
      status: "PENDING",
    },
  });

  await prisma.leaveRequest.upsert({
    where: { id: "leave-seed-3" },
    update: {},
    create: {
      id: "leave-seed-3",
      userId: opsStaff.id,
      type: "Personal leave",
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      reason: "Personal appointment — request half-day coverage.",
      status: "PENDING",
    },
  });

  for (const job of [
    {
      id: "job-seed-1",
      title: "Mathematics Teacher",
      department: "Academic",
      description: "Full-time position for senior secondary mathematics instruction.",
      status: "OPEN" as const,
      postedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      id: "job-seed-2",
      title: "IT Support Specialist",
      department: "Technology",
      description: "Maintain school network, devices, and learning platforms.",
      status: "OPEN" as const,
      postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "job-seed-3",
      title: "School Counselor",
      department: "Student Services",
      description: "Support student wellbeing and university guidance.",
      status: "INTERVIEWING" as const,
      postedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
  ]) {
    await prisma.jobPosting.upsert({
      where: { id: job.id },
      update: job,
      create: job,
    });
  }

  for (const app of [
    { id: "app-seed-1", jobId: "job-seed-1", name: "Ada Okoro", email: "ada.okoro@example.com", status: "applied" },
    { id: "app-seed-2", jobId: "job-seed-1", name: "Chidi Nwosu", email: "chidi.nwosu@example.com", status: "screening" },
    { id: "app-seed-3", jobId: "job-seed-3", name: "Grace Adebayo", email: "grace.adebayo@example.com", status: "interview" },
  ]) {
    await prisma.jobApplication.upsert({
      where: { id: app.id },
      update: app,
      create: app,
    });
  }

  const now = new Date();
  for (const staffRecord of [teacherStaff, accountantStaff, librarianStaff]) {
    await prisma.payroll.upsert({
      where: { staffId_month_year: { staffId: staffRecord.id, month: now.getMonth() + 1, year: now.getFullYear() } },
      update: {},
      create: {
        staffId: staffRecord.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        basicSalary: 4200,
        allowances: 600,
        deductions: 350,
        netSalary: 4450,
        status: "COMPLETED",
        paidAt: new Date(),
      },
    });
  }

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
