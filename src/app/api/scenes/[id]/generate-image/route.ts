import { NextResponse } from "next/server";

import { db } from "@/server/db";

import { triggerWorker } from "@/server/jobs/trigger-worker";
import { enqueueJob } from "@/server/jobs/enqueue-job";

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

  if (scene.imageStatus === "READY") {
    return NextResponse.json({ imageStatus: "READY" });
  }

  await enqueueJob(
    "CREATE_SCENE_IMAGE",
    {
      sceneId: scene.id,
    },
    `scene:${scene.id}`,
  );

  const processingCount = await db.job.count({
    where: {
      status: "PROCESSING",
    },
  });

  if (processingCount === 0) {
    void triggerWorker();
  }

  await db.scene.update({
    where: { id: scene.id },

    data: {
      imageStatus: "PENDING",
    },
  });

  return NextResponse.json({
    imageStatus: "PENDING",
  });
}
