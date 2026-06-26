import { NextRequest } from "next/server";
import { jsonData, jsonList } from "@/lib/api/route-handlers";
import { addBook, getMutableBooks } from "@/lib/api/library-entity-store";
import type { LibraryBookRecord } from "@/components/dashboard/librarian/librarian-data";

export async function GET(request: NextRequest) {
  return jsonList(getMutableBooks(), "Books loaded", request, ["title", "author", "isbn", "category"]);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<LibraryBookRecord>;
  if (!body.title || !body.author || !body.isbn || !body.category || !body.copies) {
    return jsonData({ error: "Missing required fields" }, "Validation failed", 400);
  }
  const book = addBook({
    title: body.title,
    author: body.author,
    isbn: body.isbn,
    category: body.category,
    copies: Number(body.copies),
    shelfLocation: body.shelfLocation ?? "TBD",
    publishedYear: Number(body.publishedYear) || new Date().getFullYear(),
    available: body.available,
  });
  return jsonData(book, "Book created", 201);
}
