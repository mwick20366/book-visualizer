import { extractScenes } from "@/server/ai/extract-scenes";
import { generateSceneImage } from "@/server/ai/generate-scene-image";
import { persistSceneImage } from "@/server/ai/persist-scene-image";
import { persistScenes } from "@/server/ai/persist-scenes";
import { db } from "@/server/db";
import { enqueueJob } from "@/server/jobs/enqueue-job";
import { triggerWorker } from "@/server/jobs/trigger-worker";

export async function prepareChapter(chapterId: string) {
  const started = Date.now();

  const chapter = await db.chapter.findUnique({
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

  if (chapter.processingStatus === "ready") {
    return;
  }

  await db.chapter.update({
    where: {
      id: chapterId,
    },

    data: {
      processingStatus: "processing",
    },
  });

  try {
    // extract scenes
    var extractionResult = await extractScenes(
      chapter.title ?? "Untitled Chapter",
      chapter.content,
    );

    // persist scenes
    var createdScenes = await persistScenes({
      chapterId,
      extractionResult: {
        scenes: extractionResult.scenes,
        rawResponse: extractionResult.rawResponse,
      },
    });

    // generate image for first scene
    if (createdScenes.length > 0) {
      const firstScene = createdScenes[0];

      if (firstScene) {
        await enqueueJob(
          "CREATE_SCENE_IMAGE",
          {
            sceneId: firstScene.id,
          },
          `scene:${firstScene.id}`,
        );

        void triggerWorker();
      }
    }

    await db.chapter.update({
      where: {
        id: chapterId,
      },

      data: {
        processingStatus: "ready",
      },
    });

    const duration = Date.now() - started;

    console.log(`Chapter ${chapterId} prepared in ${duration}ms`);
  } catch (error) {
    await db.chapter.update({
      where: {
        id: chapterId,
      },

      data: {
        processingStatus: "failed",
      },
    });

    throw error;
  }
}
