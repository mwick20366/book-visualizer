import { NextResponse } from "next/server";

import { db } from "@/server/db";

export async function GET(
  request: Request,
) {
  const { searchParams } =
    new URL(request.url);

  const bookId =
    searchParams.get("bookId");

  if (!bookId) {
    return NextResponse.json(
      {
        error: "Missing bookId",
      },
      {
        status: 400,
      },
    );
  }

  const chapters =
    await db.chapter.findMany({
      where: {
        bookId,
      },

      orderBy: {
        order: "asc",
      },

      include: {
        scenes: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

  return NextResponse.json(chapters);
}