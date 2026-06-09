// src/server/jobs/enqueue-job.ts

import { db } from "@/server/db";
import { JobType } from "generated/prisma";

export async function enqueueJob(
  type: JobType,
  payload: unknown,
  dedupeKey?: string,
) {
  if (dedupeKey) {
    const existing =
      await db.job.findFirst({
        where: {
          dedupeKey,

          status: {
            in: [
              "PENDING",
              "PROCESSING",
              "COMPLETED",
            ],
          },
        },
      });

    if (existing) {
      return existing;
    }
  }

  return db.job.create({
    data: {
      type,
      payload:
        payload as object,

      dedupeKey,
    },
  });
}
