import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
config();

import { prisma } from "../src/lib/db";

function buildReceiptId(date: Date, seq: number) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `LIB-RCP-${y}${m}${d}-${String(seq).padStart(3, "0")}`;
}

function buildOrderId(date: Date, seq: number) {
  const key = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `ord-${key.slice(2)}-${String(seq).padStart(3, "0")}`;
}

async function main() {
  const students = await prisma.student.findMany({ take: 3 });
  if (students.length === 0) {
    console.log("No students found — skipping order seed.");
    return;
  }

  const shopItems = await prisma.libraryShopItem.findMany({ where: { isActive: true } });
  if (shopItems.length === 0) {
    console.log("No shop items found — run seed-shop.ts first.");
    return;
  }

  const existingOrders = await prisma.libraryOrder.count();

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const item = shopItems[i % shopItems.length];
    const now = new Date();
    const seq = existingOrders + i + 1;

    await prisma.libraryOrder.create({
      data: {
        studentId: student.id,
        amount: item.price,
        method: "card",
        status: "COMPLETED",
        receiptId: buildReceiptId(now, seq),
        cardLast4: "4242",
        lines: {
          create: {
            shopItemId: item.id,
            title: item.title,
            amount: item.price,
            format: item.format,
            bookId: item.bookId,
          },
        },
      },
    });
  }

  const count = await prisma.libraryOrder.count();
  console.log(`Done. Total orders: ${count}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
