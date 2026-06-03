import { NextResponse } from "next/server";

import { db } from "@/server/db";

import { processBookScenes } from "@/server/ai/process-book-scenes";

export async function GET() {
  const book = await db.book.findFirst();

  if (!book) {
    return NextResponse.json(
      { error: "No book found" },
      { status: 404 },
    );
  }

  const result =
    await processBookScenes({
      bookId: book.id,
    });

  return NextResponse.json(result);
}