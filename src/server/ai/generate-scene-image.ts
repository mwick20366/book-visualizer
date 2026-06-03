// src/server/ai/generate-scene-image.ts

import { db } from "@/server/db";

import { openai } from "./openai";

import { buildImagePrompt } from "./build-image-prompt";

type GenerateSceneImageInput = {
  sceneId: string;

  styleGuide?: string;
};

export type GeneratedSceneImage = {
  prompt: string;

  imageUrl: string;
};

export async function generateSceneImage({
  sceneId,
  styleGuide,
}: GenerateSceneImageInput): Promise<GeneratedSceneImage> {
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

  const prompt = buildImagePrompt({
    scene,

    characters:
      scene.chapter.book.characters,

    styleGuide,
  });

  const response =
    await openai.images.generate({
      model: "gpt-image-1",

      prompt,

      size: "1536x1024",
    });

  const imageBase64 =
    response.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error(
      "No image returned from OpenAI",
    );
  }

  const imageUrl = `data:image/png;base64,${imageBase64}`;

  return {
    prompt,

    imageUrl,
  };
}