import { NextResponse } from "next/server";

import { db } from "@/server/db";

import { generateSceneImage } from "@/server/ai/generate-scene-image";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _req: Request,
  context: RouteContext,
) {
  const { id } = await context.params;

  const scene = await db.scene.findUnique({
    where: {
      id,
    },
  });

  if (!scene) {
    return NextResponse.json(
      { error: "Scene not found" },
      { status: 404 },
    );
  }

  const result = await generateSceneImage({
    sceneId: scene.id,
  });

  await db.generatedAsset.create({
    data: {
      type: "image",

      prompt: result.prompt,

      caption: result.caption,

      imageUrl: result.imageUrl,

      sceneId: scene.id,
    },
  });

  return NextResponse.json({
    success: true,
    imageUrl: result.imageUrl,
    caption: result.caption,
  });
}
