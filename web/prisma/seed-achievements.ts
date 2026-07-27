import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
config();

import { prisma } from "../src/lib/db";

async function main() {
  const students = await prisma.student.findMany({ take: 5 });
  if (students.length === 0) {
    console.log("No students found — skipping achievement seed.");
    return;
  }

  const achievements = [
    {
      title: "Spring reading sprint",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
      goal: "Finish 3 books this month",
      progress: 66,
      daysLeft: 7,
    },
    {
      title: "Poetry circle badge",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
      goal: "Discuss anthology by Friday",
      progress: 22,
      daysLeft: 12,
    },
    {
      title: "Science explorer",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
      goal: "Complete 5 science chapters",
      progress: 40,
      daysLeft: 14,
    },
  ];

  for (const student of students) {
    for (const ach of achievements) {
      const id = `ach-${student.id.slice(-6)}-${ach.title.toLowerCase().replace(/\s+/g, "-")}`;
      await prisma.readingAchievement.upsert({
        where: { id },
        update: {},
        create: {
          id,
          studentId: student.id,
          ...ach,
        },
      });
    }
  }

  const count = await prisma.readingAchievement.count();
  console.log(`Done. Total achievements: ${count}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
