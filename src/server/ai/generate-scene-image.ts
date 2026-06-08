// src/server/ai/generate-scene-image.ts

import { db } from "@/server/db";

import { openai } from "./openai";

import { buildImagePrompt } from "./build-image-prompt";
import { generateCaption } from "./generate-caption";

type GenerateSceneImageInput = {
  sceneId: string;

  styleGuide?: string;
};

export type GeneratedSceneImage = {
  prompt: string;
  // caption: string;
  imageBuffer: Buffer;
  generationTimeMs: number;
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

  // const caption = await generateCaption({
  //   title: scene.title,
  //   summary: scene.summary,
  //   mood: scene.mood ?? undefined,
  //   location: scene.location ?? undefined,
  // });

  const prompt = buildImagePrompt({
    scene,

    characters: scene.chapter.book.characters,

    styleGuide,
  });

  console.log("Generated prompt:", prompt);

  const startedAt = Date.now();

  const response = await openai.images.generate({
    model: "gpt-image-1",

    prompt,

    size: "1536x1024",
  });

  const generationTimeMs = Date.now() - startedAt;
  const imageBase64 = response.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error("No image returned from OpenAI");
  }

  // const imageUrl = `data:image/png;base64,${imageBase64}`;

  const imageBuffer = Buffer.from(imageBase64, "base64");

  return {
    prompt,
    generationTimeMs,
    // caption,
    imageBuffer,
  };
}
