import { NextResponse } from "next/server";
import { prepareChapter } from "@/server/services/books/prepare-chapter";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;

  await prepareChapter(id);

  return NextResponse.json({
    success: true,
  });
}
