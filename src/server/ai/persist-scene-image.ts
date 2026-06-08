// src/server/ai/persist-scene-image.ts

import { db } from "@/server/db";

import { uploadFile } from "../storage/upload-file";
import { getPublicUrl } from "../storage/get-public-url";

type PersistSceneImageInput = {
  sceneId: string;
  imageBuffer: Buffer;
  prompt: string;
  generationTimeMs: number;
  // imageUrl: string;
};

export async function persistSceneImage({
  sceneId,
  imageBuffer,
  prompt,
  generationTimeMs,
}: PersistSceneImageInput) {
//   await db.generatedAsset.deleteMany({
//     where: {
//       scene: {
//         id: sceneId,
//       },
//     },
//   });

//   await db.scene.deleteMany({
//     where: {
//       id: sceneId,
//     },
//   });

  const scene = await db.scene.findUnique({
    where: {
      id: sceneId,
    },
    include: {
      chapter: {
        include: {
          book: {
            include: {
              characters: true,
            },
          },
        },
      },
    },
  });

  if (!scene) {
    throw new Error("Scene not found");
  }

  const key = `books/${scene.chapter.bookId}/scenes/${scene.id}.png`;

  await uploadFile({
    key,
    body: imageBuffer,
    contentType: "image/png",
  });

  const imageUrl = getPublicUrl(key);

  await db.generatedAsset.create({
    data: {
      type: "image",

      prompt,

      imageUrl,

      generationTimeMs,

      sceneId: scene.id,
    },
  });

  return imageUrl;
}