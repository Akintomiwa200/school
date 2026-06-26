import { NextRequest, NextResponse } from "next/server";
import { createApiResponse, createPaginationMeta, getPaginationParams } from "@/shared";

export function filterBySearch<T>(items: T[], search: string | undefined, fields: (keyof T)[]) {
  if (!search?.trim()) return items;
  const q = search.trim().toLowerCase();
  return items.filter((item) =>
    fields.some((field) => String(item[field] ?? "").toLowerCase().includes(q)),
  );
}

export function paginate<T>(items: T[], page: number, limit: number, skip: number) {
  return {
    items: items.slice(skip, skip + limit),
    meta: createPaginationMeta(items.length, page, limit),
  };
}

export function jsonList<T>(items: T[], message: string, request: NextRequest, searchFields: (keyof T)[]) {
  const { page, limit, search, skip } = getPaginationParams(request.nextUrl.searchParams);
  const filtered = filterBySearch(items, search, searchFields);
  const { items: slice, meta } = paginate(filtered, page, limit, skip);
  return NextResponse.json(createApiResponse(slice, message, meta));
}

export function jsonData<T>(data: T, message: string, status = 200) {
  return NextResponse.json(createApiResponse(data, message), { status });
}
