// src/server/ai/process-book-scenes.ts

import { db } from "@/server/db";

import { extractScenes } from "./extract-scenes";

import { persistScenes } from "./persist-scenes";

type ProcessBookScenesInput = {
  bookId: string;
  chapterId?: string;
};

export async function processBookScenes({ bookId, chapterId }: ProcessBookScenesInput) {
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

  const results = [];

  for (const chapter of book.chapters) {
    if (chapterId && chapter.id !== chapterId) {
      continue;
    }

    console.log(`Processing ${chapter.title}...`);

    if (!chapter.content?.trim()) {
      console.warn(`Skipping ${chapter.title} because content is empty`);

      continue;
    }

    await db.generatedAsset.deleteMany({
      where: {
        scene: {
          chapterId: chapter.id,
        },
      },
    });

    await db.scene.deleteMany({
      where: {
        chapterId: chapter.id,
      },
    });

    const extractionResult = await extractScenes(
      chapter.title ?? "Untitled",
      chapter.content,
    );

    const scenes = await persistScenes({
      chapterId: chapter.id,

      extractionResult,
    });

    console.log(`Extracted ${scenes.length} scenes from ${chapter.title}`);

    results.push({
      chapterId: chapter.id,

      chapterTitle: chapter.title,

      sceneCount: scenes.length,
    });
  }

  return {
    bookId: book.id,

    bookTitle: book.title,

    processedChapters: results.length,

    results,
  };
}
