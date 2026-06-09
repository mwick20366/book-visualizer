// src/server/jobs/process-next-job.ts

import { db } from "@/server/db";

import {
  createSceneImage,
} from "@/server/services/scenes/create-scene-image";

import {
  claimNextJob,
} from "./claim-next-job";

export async function processNextJob() {
  const job =
    await claimNextJob();

  if (!job) {
    return false;
  }

  try {
    switch (job.type) {
      case
        "CREATE_SCENE_IMAGE": {
        const payload =
          job.payload as {
            sceneId:
              string;
          };

        await createSceneImage(
          payload.sceneId,
        );

        break;
      }
    }

    await db.job.update({
      where: {
        id: job.id,
      },

      data: {
        status:
          "COMPLETED",

        completedAt:
          new Date(),
      },
    });
  } catch (error) {
    await db.job.update({
      where: {
        id: job.id,
      },

      data: {
        status:
          "FAILED",

        failedAt:
          new Date(),

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
    });
  }

  return true;
}