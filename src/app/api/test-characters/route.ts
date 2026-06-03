import { NextResponse } from "next/server";

import { db } from "@/server/db";

import { extractCharacters } from "@/server/ai/extract-characters";

import { persistCharacters } from "@/server/ai/persist-characters";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");

  if (!bookId) {
    return NextResponse.json(
      {
        error: "Missing bookId",
      },
      {
        status: 400,
      },
    );
  }

  const book = await db.book.findUnique({
    where: {
      id: bookId,
    },
    include: {
      chapters: true,
    },
  });

  if (!book) {
    return NextResponse.json({ error: "No book found" }, { status: 404 });
  }

  const bookText = book.chapters.map((chapter) => chapter.content).join("\n\n");

  const extractionResult = await extractCharacters(bookText);

  const characters = await persistCharacters({
    bookId: book.id,

    extractionResult,
  });

  return NextResponse.json({
    book: book.title,

    characterCount: characters.length,

    characters,
  });
}
