import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
config();

import { prisma } from "../src/lib/db";

const BOOKS = [
  { title: "Introduction to Algorithms", author: "Cormen et al.", isbn: "978-0262033848", quantity: 5, category: "Computer Science", shelfLocation: "CS-A12", description: "Comprehensive guide to algorithms and data structures." },
  { title: "Physics for Scientists", author: "Serway", isbn: "978-1337094160", quantity: 8, category: "Science", shelfLocation: "SCI-B04", description: "Standard physics textbook for university students." },
  { title: "Things Fall Apart", author: "Chinua Achebe", isbn: "978-0385474542", quantity: 12, category: "Literature", shelfLocation: "LIT-C01", description: "Landmark novel of African literature." },
  { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "978-0553380163", quantity: 4, category: "Science", shelfLocation: "SCI-B08", description: "Exploration of cosmology for general readers." },
  { title: "Algebra II Workbook", author: "McGraw-Hill", isbn: "978-0076639908", quantity: 20, category: "Mathematics", shelfLocation: "MATH-D02", description: "Practice workbook for algebra concepts." },
  { title: "English Literature Anthology", author: "Norton", isbn: "978-0393913009", quantity: 15, category: "English", shelfLocation: "ENG-A03", description: "Comprehensive anthology of English literature." },
  { title: "World History: Patterns", author: "Beck et al.", isbn: "978-0133720489", quantity: 10, category: "History", shelfLocation: "HIS-E11", description: "Survey of world history patterns and civilizations." },
  { title: "Clean Code", author: "Robert Martin", isbn: "978-0132350884", quantity: 6, category: "Computer Science", shelfLocation: "CS-A18", description: "Handbook of agile software craftsmanship." },
  { title: "Calculus: Early Transcendentals", author: "Stewart", isbn: "978-1285741550", quantity: 9, category: "Mathematics", shelfLocation: "MATH-D09", description: "Standard calculus textbook." },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565", quantity: 18, category: "Literature", shelfLocation: "LIT-C14", description: "Classic American novel set in the Jazz Age." },
  { title: "Oxford English Dictionary", author: "Oxford Press", isbn: "978-0198611868", quantity: 3, category: "Reference", shelfLocation: "REF-F01", description: "Definitive English language dictionary." },
  { title: "Biology: Life on Earth", author: "Audesirk", isbn: "978-0134160768", quantity: 11, category: "Science", shelfLocation: "SCI-B15", description: "Introductory biology textbook." },
  { title: "Pride and Prejudice", author: "Jane Austen", isbn: "978-0141439518", quantity: 14, category: "Literature", shelfLocation: "LIT-C22", description: "Beloved Regency romance and social commentary." },
  { title: "Data Structures in Java", author: "Goodrich", isbn: "978-1118771334", quantity: 7, category: "Computer Science", shelfLocation: "CS-A25", description: "Data structures implementation guide in Java." },
  { title: "Geometry Essentials", author: "Larson", isbn: "978-0547315171", quantity: 16, category: "Mathematics", shelfLocation: "MATH-D14", description: "Fundamental geometry concepts and problems." },
  { title: "African Civilizations", author: "Davidson", isbn: "978-0852551388", quantity: 5, category: "History", shelfLocation: "HIS-E05", description: "History of African civilizations before colonialism." },
  { title: "Technical Writing Guide", author: "Anderson", isbn: "978-1133607379", quantity: 8, category: "English", shelfLocation: "ENG-A19", description: "Guide to technical and professional writing." },
  { title: "Encyclopedia Britannica", author: "Britannica", isbn: "978-1593392925", quantity: 2, category: "Reference", shelfLocation: "REF-F04", description: "Comprehensive general encyclopedia." },
  { title: "Organic Chemistry", author: "Wade", isbn: "978-0321971371", quantity: 6, category: "Science", shelfLocation: "SCI-B22", description: "Organic chemistry principles and reactions." },
  { title: "Hamlet", author: "William Shakespeare", isbn: "978-0743477123", quantity: 22, category: "English", shelfLocation: "ENG-A28", description: "Shakespeare's tragedy of the Prince of Denmark." },
  { title: "Linear Algebra Done Right", author: "Axler", isbn: "978-3319110790", quantity: 4, category: "Mathematics", shelfLocation: "MATH-D21", description: "Approach to linear algebra focusing on vector spaces." },
  { title: "The Republic", author: "Plato", isbn: "978-0140455113", quantity: 9, category: "History", shelfLocation: "HIS-E18", description: "Plato's dialogue on justice and the ideal state." },
];

const COVER_TONES = [
  "from-violet-200 via-purple-100 to-fuchsia-100",
  "from-sky-200 via-blue-100 to-indigo-100",
  "from-amber-200 via-orange-100 to-yellow-100",
  "from-emerald-200 via-teal-100 to-cyan-100",
  "from-rose-200 via-pink-100 to-fuchsia-100",
  "from-indigo-200 via-violet-100 to-purple-100",
];

const IMAGES = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < BOOKS.length; i++) {
    const b = BOOKS[i];
    const existing = await prisma.book.findFirst({ where: { isbn: b.isbn } });
    if (existing) { skipped++; continue; }

    await prisma.book.create({
      data: {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        category: b.category,
        description: b.description,
        coverImage: IMAGES[i % IMAGES.length],
        coverTone: COVER_TONES[i % COVER_TONES.length],
        bookAccess: i < 5 ? "free" : "paid",
        price: i < 5 ? null : (9 + (i % 10)),
        format: "eBook",
        pages: 150 + (i * 23) % 250,
        quantity: b.quantity,
        available: b.quantity,
        shelfLocation: b.shelfLocation,
      },
    });
    created++;
  }

  console.log(`Done. Created: ${created}, Skipped: ${skipped}, Total books in DB: ${await prisma.book.count()}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
