// src/server/services/scenes/create-scene-image.ts

import { uploadFile } from "@/server/storage/upload-file";
import { generateSceneImageBuffer } from "./generate-scene-image-buffer";
import { db } from "@/server/db";
import OpenAI from "openai";
import { getPublicUrl } from "@/server/storage/get-public-url";

export async function createSceneImage(sceneId: string) {
  const scene = await db.scene.findUniqueOrThrow({
    where: {
      id: sceneId,
    },
  });

  await db.scene.update({
    where: { id: sceneId },

    data: {
      imageStatus: "PROCESSING",
    },
  });

  let result;

  try {
    result = await generateSceneImageBuffer({
      sceneId,
    });
  } catch (error) {
    if (
      error instanceof OpenAI.APIError &&
      error.code === "moderation_blocked"
    ) {
      await db.scene.update({
        where: {
          id: sceneId,
        },

        data: {
          imageStatus: "FAILED",
          isHidden: true,
        },
      });

      return;
    }

    await db.scene.update({
      where: {
        id: sceneId,
      },
      
      data: {
        imageStatus: "FAILED",
      },
    });
    throw error;
  }

  const key = `scenes/${sceneId}/${crypto.randomUUID()}.png`;

  await uploadFile({
    key,
    body: result.imageBuffer,
    contentType: "image/png",
  });

  const imageUrl = getPublicUrl(key);

  const { prompt, generationTimeMs } = result;

  const asset = await db.generatedAsset.create({
    data: {
      sceneId,
      prompt,
      generationTimeMs,
      type: "image",
      imageUrl,
    },
  });

  await db.scene.update({
    where: { id: sceneId },

    data: {
      imageStatus: "READY",
    },
  });

  return asset;
}
