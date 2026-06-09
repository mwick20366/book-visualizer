// src/app/api/chapters/[id]/prepare/route.ts

import { NextResponse } from "next/server";

import { prepareChapter }
  from "@/server/services/books/prepare-chapter";

type Params = Promise<{
  id: string;
}>;

export async function POST(
  req: Request,
  { params }: { params: Params },
) {
  try {
    const { id } =
      await params;

    void prepareChapter(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to prepare chapter",
      },
      {
        status: 500,
      },
    );
  }
}