// src/app/api/books/route.ts

import { NextResponse } from "next/server";

import { unstable_noStore as noStore } from "next/cache";

import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  noStore();

  try {
    const books = await db.book.findMany({
      select: {
        id: true,

        title: true,

        author: true,

        status: true,

        processingStatus: true,
        
        createdAt: true,

        heroImageUrl: true,

        _count: {
          select: {
            chapters: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      books,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load books",
      },
      {
        status: 500,
      },
    );
  }
}
