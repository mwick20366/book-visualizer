import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";

export async function GET() {
  await tasks.trigger("test-task", {
    message: "hello from book-visualizer",
  });

  return NextResponse.json({
    success: true,
  });
}