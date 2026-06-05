import { extractScenes } from "@/server/ai/extract-scenes";
import { persistScenes } from "@/server/ai/persist-scenes";
import { db } from "@/server/db";

export async function prepareChapter(
  chapterId: string,
) {
  const chapter =
    await db.chapter.findUnique({
      where: {
        id: chapterId,
      },

      include: {
        book: {
          include: {
            characters: true,
          },
        },
      },
    });

  if (!chapter) {
    return;
  }

  if (
    chapter.processingStatus ===
    "ready"
  ) {
    return;
  }

  await db.chapter.update({
    where: {
      id: chapterId,
    },

    data: {
      processingStatus:
        "processing",
    },
  });

  try {
    // extract scenes
    var extractionResult = await extractScenes(
        chapter.title ?? "Untitled Chapter",
        chapter.content,
    );

    // persist scenes
    await persistScenes({
      chapterId,
      extractionResult: {
        scenes: extractionResult.scenes,
        rawResponse: extractionResult.rawResponse,
      },
    });

    await db.chapter.update({
      where: {
        id: chapterId,
      },

      data: {
        processingStatus:
          "ready",
      },
    });
  } catch (error) {
    await db.chapter.update({
      where: {
        id: chapterId,
      },

      data: {
        processingStatus:
          "failed",
      },
    });

    throw error;
  }
}