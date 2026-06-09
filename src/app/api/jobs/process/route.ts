// src/app/api/jobs/process/route.ts

import { NextResponse }
  from "next/server";

import {
  processNextJob,
} from "@/server/jobs/process-next-job";

export async function POST() {
  while (true) {
    const processed =
      await processNextJob();

    if (!processed) {
      break;
    }
  }

  return NextResponse.json({
    success: true,
  });
}