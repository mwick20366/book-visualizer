// src/server/jobs/claim-next-job.ts

import { db } from "@/server/db";

export async function claimNextJob() {
  const job =
    await db.job.findFirst({
      where: {
        status: "PENDING",
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  if (!job) {
    return null;
  }

  return db.job.updateMany({
    where: {
      id: job.id,

      status: "PENDING",
    },

    data: {
      status:
        "PROCESSING",

      startedAt:
        new Date(),
    },
  }).then(result =>
    result.count === 1
      ? job
      : null,
  );
}