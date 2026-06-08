import { NextResponse } from "next/server";

import { db } from "@/server/db";

import { generateSceneImage } from "@/server/ai/generate-scene-image";
import { uploadFile } from "@/server/storage/upload-file";
import { getPublicUrl } from "@/server/storage/get-public-url";
import { OpenAI } from "openai/client";
import { persistSceneImage } from "@/server/ai/persist-scene-image";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;

  const scene = await db.scene.findUnique({
    where: {
      id,
    },
    include: {
      chapter: {
        include: {
          book: true,
        },
      },
    },
  });

  if (!scene) {
    return NextResponse.json({ error: "Scene not found" }, { status: 404 });
  }

  let result;

  try {
    result = await generateSceneImage({
      sceneId: scene.id,
    });
  } catch (error) {
    if (
      error instanceof OpenAI.APIError &&
      error.code === "moderation_blocked"
    ) {
      await db.scene.update({
        where: {
          id: scene.id,
        },

        data: {
          isHidden: true,
        },
      });

      return NextResponse.json(
        {
          blocked: true,
        },
        {
          status: 200,
        },
      );
    }

    throw error;
  }

  const imageUrl = await persistSceneImage({
    sceneId: scene.id,
    imageBuffer: result.imageBuffer,
    prompt: result.prompt,
    generationTimeMs: result.generationTimeMs,
  });

  return NextResponse.json({
    success: true,
    imageUrl,
  });
}
