// src/server/ai/process-book-characters.ts

import { db } from "@/server/db";

import { extractCharacters } from "./extract-characters";

import { persistCharacters } from "./persist-characters";

type ProcessBookCharactersInput = {
  bookId: string;
};

export async function processBookCharacters({ bookId }: ProcessBookCharactersInput) {
  const book = await db.book.findUnique({
    where: {
      id: bookId,
    },

    include: {
      chapters: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  const bookText = book.chapters.map((chapter) => chapter.content).join("\n\n");

  const extractionResult = await extractCharacters(bookText);

  await persistCharacters({
    bookId: book.id,
    extractionResult,
  });
}
