export type BookAccess = "free" | "paid";
export type BookCategory = "popular" | "ongoing";

export type LibraryChapter = {
  id: string;
  title: string;
  content: string;
};

export type LibraryBook = {
  id: string;
  title: string;
  description: string;
  image: string;
  coverTone: string;
  category: BookCategory;
  access: BookAccess;
  price?: number;
  author: string;
  format: string;
  pages: number;
  chapters: LibraryChapter[];
  bookmarked?: boolean;
  liked?: boolean;
  readingProgress?: number;
};

export type ReadingAchievement = {
  id: string;
  title: string;
  avatarUrl: string;
  progress: number;
  daysLeft: number;
  goal: string;
};

export type LibrarySaleItem = {
  id: string;
  title: string;
  description: string;
  rating: number;
  icon: string;
  thumbTone: string;
  price: number;
  format: "physical" | "digital" | "bundle";
  bookId?: string;
};

export type LibraryOrderStatus = "completed" | "processing" | "cancelled";

export type LibraryOrderLine = {
  itemId: string;
  title: string;
  amount: number;
  format: LibrarySaleItem["format"];
  bookId?: string;
};

export type LibraryOrder = {
  id: string;
  lines: LibraryOrderLine[];
  amount: number;
  method: "card" | "bank";
  status: LibraryOrderStatus;
  date: string;
  receiptId: string;
  cardLast4?: string;
};

const CHAPTER = (id: string, title: string, preview: string): LibraryChapter => ({
  id,
  title,
  content: `${preview}\n\nThis chapter is part of your Schooli digital library. Continue reading to explore key ideas, worked examples, and reflection prompts aligned with your coursework.`,
});

export const POPULAR_BOOKS: LibraryBook[] = [
  {
    id: "pop-1",
    title: "The book is an essential companion",
    description: "This is just a general example of how knowledge opens doors.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    coverTone: "from-violet-200 via-purple-100 to-fuchsia-100",
    category: "popular",
    access: "free",
    author: "Dr. Elena Marsh",
    format: "eBook",
    pages: 184,
    liked: true,
    readingProgress: 40,
    chapters: [
      CHAPTER("c1", "Opening doors", "Every great learner begins with curiosity."),
      CHAPTER("c2", "Building habits", "Small daily reading sessions compound into mastery."),
      CHAPTER("c3", "Sharing insight", "Discussing ideas with peers deepens understanding."),
    ],
  },
  {
    id: "pop-2",
    title: "Stories that shape young minds",
    description: "A curated collection for curious readers exploring science and wonder.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
    coverTone: "from-sky-200 via-blue-100 to-indigo-100",
    category: "popular",
    access: "free",
    author: "James Okonkwo",
    format: "eBook",
    pages: 212,
    bookmarked: true,
    chapters: [
      CHAPTER("c1", "Wonder in nature", "Science begins when we ask why the sky changes color."),
      CHAPTER("c2", "Experiments at home", "Safe projects you can try with everyday materials."),
    ],
  },
  {
    id: "pop-3",
    title: "World history in vivid detail",
    description: "Travel through centuries with maps, portraits, and primary sources.",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80",
    coverTone: "from-amber-200 via-orange-100 to-yellow-100",
    category: "popular",
    access: "paid",
    price: 14,
    author: "Prof. Amira Khan",
    format: "eBook + maps",
    pages: 356,
    chapters: [
      CHAPTER("c1", "Ancient trade routes", "Silk, spice, and ideas moved across continents."),
      CHAPTER("c2", "Revolutions", "How societies transformed across the modern era."),
      CHAPTER("c3", "Primary sources", "Letters, treaties, and artifacts tell human stories."),
    ],
  },
  {
    id: "pop-4",
    title: "Creative writing workbook",
    description: "Prompts and exercises to build confidence in essays and storytelling.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
    coverTone: "from-emerald-200 via-teal-100 to-cyan-100",
    category: "popular",
    access: "paid",
    price: 9,
    author: "Lina Ortiz",
    format: "Workbook",
    pages: 128,
    chapters: [
      CHAPTER("c1", "Finding your voice", "Warm-up prompts to unlock creative flow."),
      CHAPTER("c2", "Structure & revision", "Turn rough drafts into polished pieces."),
    ],
  },
];

export const ONGOING_BOOKS: LibraryBook[] = [
  {
    id: "ong-1",
    title: "Physics for curious students",
    description: "Currently on chapter 6 — waves, light, and everyday applications.",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80",
    coverTone: "from-indigo-200 via-violet-100 to-purple-100",
    category: "ongoing",
    access: "free",
    author: "Dr. Samuel Reed",
    format: "eBook",
    pages: 290,
    bookmarked: true,
    readingProgress: 62,
    chapters: [
      CHAPTER("c1", "Motion basics", "Position, velocity, and acceleration in daily life."),
      CHAPTER("c2", "Forces", "Newton's laws with classroom demonstrations."),
      CHAPTER("c3", "Waves & light", "Frequency, reflection, and color."),
    ],
  },
  {
    id: "ong-2",
    title: "Modern poetry anthology",
    description: "Reading circle selection due for discussion next Friday.",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
    coverTone: "from-rose-200 via-pink-100 to-fuchsia-100",
    category: "ongoing",
    access: "paid",
    price: 12,
    author: "Various authors",
    format: "Anthology",
    pages: 240,
    readingProgress: 18,
    chapters: [
      CHAPTER("c1", "Voices of today", "Contemporary poets on identity and place."),
      CHAPTER("c2", "Form & rhythm", "How structure shapes meaning."),
    ],
  },
  {
    id: "ong-3",
    title: "Intro to data science",
    description: "Self-paced module with practice notebooks and quizzes.",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80",
    coverTone: "from-blue-200 via-sky-100 to-cyan-100",
    category: "ongoing",
    access: "free",
    author: "Maya Chen",
    format: "Interactive eBook",
    pages: 198,
    liked: true,
    readingProgress: 35,
    chapters: [
      CHAPTER("c1", "Data everywhere", "Collecting and cleaning real-world datasets."),
      CHAPTER("c2", "Visual stories", "Charts that communicate clearly."),
    ],
  },
  {
    id: "ong-4",
    title: "Digital art fundamentals",
    description: "Module three in progress — color theory and composition basics.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
    coverTone: "from-amber-200 via-orange-100 to-rose-100",
    category: "ongoing",
    access: "paid",
    price: 16,
    author: "Studio Pathway",
    format: "Course book",
    pages: 164,
    readingProgress: 44,
    chapters: [
      CHAPTER("c1", "Color theory", "Hue, value, and harmony in digital canvases."),
      CHAPTER("c2", "Composition", "Balance, focus, and visual flow."),
    ],
  },
];

export const READING_ACHIEVEMENTS: ReadingAchievement[] = [
  {
    id: "ach-1",
    title: "Spring reading sprint",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
    progress: 66,
    daysLeft: 7,
    goal: "Finish 3 books this month",
  },
  {
    id: "ach-2",
    title: "Poetry circle badge",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
    progress: 22,
    daysLeft: 12,
    goal: "Discuss anthology by Friday",
  },
];

export const BEST_SALES: LibrarySaleItem[] = [
  {
    id: "sale-1",
    title: "Grow green",
    description: "Illustrated guide to classroom plants and care routines.",
    rating: 4.5,
    icon: "🪴",
    thumbTone: "from-brand-pink/30 to-brand-pink/50",
    price: 8,
    format: "physical",
  },
  {
    id: "sale-2",
    title: "Raise a plant",
    description: "Hands-on science kit with seeds and observation journal.",
    rating: 4.5,
    icon: "🌱",
    thumbTone: "from-brand-purple/25 to-primary/40",
    price: 15,
    format: "bundle",
  },
  {
    id: "sale-3",
    title: "Morning brew",
    description: "Literary essays on creativity, focus, and study rituals.",
    rating: 4.0,
    icon: "☕",
    thumbTone: "from-primary/25 to-brand-blue/40",
    price: 11,
    format: "digital",
    bookId: "pop-4",
  },
  {
    id: "sale-4",
    title: "Story books",
    description: "Premium history edition with interactive maps.",
    rating: 4.5,
    icon: "📚",
    thumbTone: "from-brand-blue/30 to-brand-blue/50",
    price: 14,
    format: "digital",
    bookId: "pop-3",
  },
  {
    id: "sale-5",
    title: "Desk garden",
    description: "Poetry anthology for reading circle — digital access.",
    rating: 4.0,
    icon: "🌿",
    thumbTone: "from-brand-purple/20 to-brand-pink/35",
    price: 12,
    format: "digital",
    bookId: "ong-2",
  },
  {
    id: "sale-6",
    title: "Digital art fundamentals",
    description: "Full course book with color theory modules.",
    rating: 4.2,
    icon: "🎨",
    thumbTone: "from-brand-orange/25 to-brand-pink/35",
    price: 16,
    format: "digital",
    bookId: "ong-4",
  },
];

export const DEMO_ORDERS: LibraryOrder[] = [
  {
    id: "ord-240601",
    lines: [{ itemId: "sale-1", title: "Grow green", amount: 8, format: "physical" }],
    amount: 8,
    method: "card",
    status: "completed",
    date: "2026-05-28",
    receiptId: "LIB-RCP-20260528-001",
    cardLast4: "4242",
  },
];

export function getAllBooks(): LibraryBook[] {
  return [...POPULAR_BOOKS, ...ONGOING_BOOKS];
}

export function getBookById(bookId: string): LibraryBook | undefined {
  return getAllBooks().find((book) => book.id === bookId);
}

export function getBooksByCategory(category?: BookCategory | "all"): LibraryBook[] {
  if (!category || category === "all") return getAllBooks();
  return getAllBooks().filter((book) => book.category === category);
}

export function getFreeBooks(): LibraryBook[] {
  return getAllBooks().filter((book) => book.access === "free");
}

export function getPaidBooks(): LibraryBook[] {
  return getAllBooks().filter((book) => book.access === "paid");
}

export function getSaleItemById(itemId: string): LibrarySaleItem | undefined {
  return BEST_SALES.find((item) => item.id === itemId);
}

export function getSaleItemForBook(bookId: string): LibrarySaleItem | undefined {
  return BEST_SALES.find((item) => item.bookId === bookId);
}

export function getOrderById(orderId: string): LibraryOrder | undefined {
  return DEMO_ORDERS.find((order) => order.id === orderId);
}

export function libraryHref(segment?: string) {
  const base = "/student/library";
  return segment ? `${base}/${segment}` : base;
}

export function booksHref(query?: { category?: string; access?: string }) {
  const base = libraryHref("books");
  const params = new URLSearchParams();
  if (query?.category) params.set("category", query.category);
  if (query?.access) params.set("access", query.access);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function bookHref(bookId: string) {
  return libraryHref(`books/${bookId}`);
}

export function bookReadHref(bookId: string, chapterId?: string) {
  const base = libraryHref(`books/${bookId}/read`);
  return chapterId ? `${base}?chapter=${chapterId}` : base;
}

export function shopHref(itemId?: string) {
  return itemId ? libraryHref(`shop/${itemId}`) : libraryHref("shop");
}

export function payHref(itemId?: string) {
  const base = libraryHref("pay");
  return itemId ? `${base}?item=${itemId}` : base;
}

export function orderHref(orderId?: string) {
  return orderId ? libraryHref(`orders/${orderId}`) : libraryHref("orders");
}

export function orderReceiptHref(orderId: string) {
  return libraryHref(`orders/${orderId}/receipt`);
}

export function payCheckoutHref(itemIds?: string[]) {
  const base = libraryHref("pay/checkout");
  if (!itemIds?.length) return base;
  return `${base}?items=${itemIds.join(",")}`;
}

export function payConfirmationHref(orderId: string) {
  return `${libraryHref("pay/confirmation")}?orderId=${orderId}`;
}

export function formatLibraryPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function canReadBook(bookId: string, ownedBookIds: string[]): boolean {
  const book = getBookById(bookId);
  if (!book) return false;
  if (book.access === "free") return true;
  return ownedBookIds.includes(bookId);
}
