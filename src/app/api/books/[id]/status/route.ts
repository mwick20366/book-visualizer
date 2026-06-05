// src/app/api/books/[id]/status/route.ts

import { NextResponse } from "next/server";

import { db } from "@/server/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const { id } =
    await context.params;

  const book =
    await db.book.findUnique({
      where: {
        id,
      },

      select: {
        processingStatus: true,
      },
    });

  if (!book) {
    return NextResponse.json(
      {
        error: "Book not found",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    processingStatus:
      book.processingStatus,
  });
}