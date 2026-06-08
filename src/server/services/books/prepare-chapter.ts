import { extractScenes } from "@/server/ai/extract-scenes";
import { generateSceneImage } from "@/server/ai/generate-scene-image";
import { persistSceneImage } from "@/server/ai/persist-scene-image";
import { persistScenes } from "@/server/ai/persist-scenes";
import { db } from "@/server/db";
import { OpenAI } from "openai/client";

export async function prepareChapter(chapterId: string) {
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
        let result;

        try {
          result = await generateSceneImage({
            sceneId: firstScene.id,
          });
        } catch (error) {
          if (
            error instanceof OpenAI.APIError &&
            error.code === "moderation_blocked"
          ) {
            await db.scene.update({
              where: {
                id: firstScene.id,
              },

              data: {
                isHidden: true,
              },
            });
          }

          const nextScene = createdScenes.length > 1 ? createdScenes[1] : null;

          if (nextScene) {
            // Just try the next ones, don't fail the whole chapter if the image generation fails for one scene
            result = await generateSceneImage({
              sceneId: nextScene.id,
            });
          }
        }

        if (result) {
          await persistSceneImage({
            sceneId: firstScene.id,
            imageBuffer: result.imageBuffer,
            prompt: result.prompt,
            generationTimeMs: result.generationTimeMs,
          });
        }
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
