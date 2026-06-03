import { NextResponse } from "next/server";

import { db } from "@/server/db";

import { extractScenes } from "@/server/ai/extract-scenes";
import { persistScenes } from "@/server/ai/persist-scenes";

export async function GET() {
  const chapter = await db.chapter.findFirst({
    where: {
      content: {
        contains: "Utterson",
      },
    },
  });

  if (!chapter) {
    return NextResponse.json(
      { error: "No chapter found" },
      { status: 404 },
    );
  }

  const result = await extractScenes(chapter.content);

  const savedScenes = await persistScenes({
    chapterId: chapter.id,

    scenes: result.scenes,
  });

  return NextResponse.json({
    chapterTitle: chapter.title,

    sceneCount: savedScenes.length,

    scenes: savedScenes,
  });
}