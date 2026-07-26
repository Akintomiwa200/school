import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
config();

import { prisma } from "../src/lib/db";

const SHOP_ITEMS = [
  { title: "Grow green", description: "Illustrated guide to classroom plants and care routines.", rating: 4.5, icon: "🪴", thumbTone: "from-brand-pink/30 to-brand-pink/50", price: 8, format: "physical" },
  { title: "Raise a plant", description: "Hands-on science kit with seeds and observation journal.", rating: 4.5, icon: "🌱", thumbTone: "from-brand-purple/25 to-primary/40", price: 15, format: "bundle" },
  { title: "Morning brew", description: "Literary essays on creativity, focus, and study rituals.", rating: 4.0, icon: "☕", thumbTone: "from-primary/25 to-brand-blue/40", price: 11, format: "digital" },
  { title: "Story books", description: "Premium history edition with interactive maps.", rating: 4.5, icon: "📚", thumbTone: "from-brand-blue/30 to-brand-blue/50", price: 14, format: "digital" },
  { title: "Desk garden", description: "Poetry anthology for reading circle — digital access.", rating: 4.0, icon: "🌿", thumbTone: "from-brand-purple/20 to-brand-pink/35", price: 12, format: "digital" },
  { title: "Digital art fundamentals", description: "Full course book with color theory modules.", rating: 4.2, icon: "🎨", thumbTone: "from-brand-orange/25 to-brand-pink/35", price: 16, format: "digital" },
];

async function main() {
  console.log("Seeding library shop items...");
  for (const item of SHOP_ITEMS) {
    await prisma.libraryShopItem.upsert({
      where: { id: item.title.toLowerCase().replace(/\s+/g, "-") },
      update: item,
      create: { id: item.title.toLowerCase().replace(/\s+/g, "-"), ...item },
    });
    console.log(`  Upserted "${item.title}"`);
  }
  const count = await prisma.libraryShopItem.count();
  console.log(`Done. Total shop items: ${count}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
