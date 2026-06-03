import { NextResponse } from "next/server";
import { processBookScenes } from "@/server/ai/process-book-scenes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");

  if (!bookId) {
    return NextResponse.json(
      { error: "Missing bookId" },
      { status: 400 },
    );
  }

  const result = await processBookScenes({
    bookId,
  });

  return NextResponse.json(result);
}