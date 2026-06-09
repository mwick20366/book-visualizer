// src/server/jobs/trigger-worker.ts

export async function triggerWorker() {
  try {
    await fetch(
      `${process.env.APP_URL}/api/jobs/process`,
      {
        method: "POST",
      },
    );
  } catch (error) {
    console.error(
      "Failed to trigger worker",
      error,
    );
  }
}