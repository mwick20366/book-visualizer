// src/server/ai/persist-scenes.ts

import { db } from "@/server/db";

import type {
  ExtractedScene,
  SceneExtractionResult,
} from "./extract-scenes";

type PersistScenesInput = {
  chapterId: string;

  extractionResult: SceneExtractionResult;
};

export async function persistScenes({
  chapterId,
  extractionResult,
}: PersistScenesInput) {
  await db.generatedAsset.deleteMany({
    where: {
      scene: {
        chapterId,
      },
    },
  });

  await db.scene.deleteMany({
    where: {
      chapterId,
    },
  });

  const createdScenes =
    await Promise.all(
      extractionResult.scenes.map(
        (
          scene: ExtractedScene,
          index: number,
        ) =>
          db.scene.create({
            data: {
              title: scene.title,

              summary: scene.summary,

              mood: scene.mood,

              location: scene.location,

              visualDescription:
                scene.visualDescription,

              anchorText: scene.anchorText,

              anchorIndex: scene.anchorIndex,
              
              characters:
                scene.characters,

              rawAiOutput: scene,

              order: index,

              chapterId,
            },
          }),
      ),
    );

  return createdScenes;
}