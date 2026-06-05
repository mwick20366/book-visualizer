// src/server/services/books/process-book.ts

import { db } from "@/server/db";

import { processBookCharacters } from "@/server/ai/process-book-characters";

import { processBookScenes } from "@/server/ai/process-book-scenes";

import { generateSceneImage } from "@/server/ai/generate-scene-image";

export async function processBook(bookId: string) {
  // Get all main characters
  await db.book.update({
    where: {
      id: bookId,
    },

    data: {
      processingStatus: "PROCESSING_CHARACTERS",
    },
  });

  await processBookCharacters({
    bookId,
  });

  // Get scenes for first chapter, and generate preview image for the first scene
  await db.book.update({
    where: {
      id: bookId,
    },

    data: {
      processingStatus: "PROCESSING_SCENES",
    },
  });

  const firstChapter = await db.chapter.findFirst({
    where: {
      bookId,
    },
    orderBy: {
      order: "asc",
    },
  });

  await processBookScenes({
    bookId,
    chapterId: firstChapter?.id,
  });

  await db.chapter.update({
    where: {
      id: firstChapter?.id,
    },
    data: {
      processingStatus: "ready",
    },
  });

  // Generate first scene image automatically

  const firstScene = await db.scene.findFirst({
    where: {
      chapter: {
        bookId,
      },
    },

    orderBy: [
      {
        chapter: {
          order: "asc",
        },
      },

      {
        order: "asc",
      },
    ],
  });

  if (firstScene) {
    await db.book.update({
      where: {
        id: bookId,
      },

      data: {
        processingStatus: "GENERATING_PREVIEW",
      },
    });

    try {
      const result = await generateSceneImage({
        sceneId: firstScene.id,
      });

      await db.generatedAsset.create({
        data: {
          type: "image",

          prompt: result.prompt,

          imageUrl: result.imageUrl,

          sceneId: firstScene.id,
        },
      });

      await db.book.update({
        where: {
          id: bookId,
        },

        data: {
          heroImageUrl: result.imageUrl,
        },
      });
    } catch (error) {
      console.error("Failed to generate preview image:", error);
    }
  }

  // Done

  await db.book.update({
    where: {
      id: bookId,
    },

    data: {
      processingStatus: "READY",
    },
  });
}
