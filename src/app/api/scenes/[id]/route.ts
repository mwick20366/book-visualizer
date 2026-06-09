import { NextResponse } from "next/server";

import { db } from "@/server/db";

type Params = Promise<{
  id: string;
}>;

export async function GET(req: Request, { params }: { params: Params }) {
  const { id } = await params;

  const scene = await db.scene.findUnique({
    where: {
      id,
    },

    include: {
      assets: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!scene) {
    return NextResponse.json(
      {
        error: "Scene not found",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    id: scene.id,

    imageStatus: scene.imageStatus,

    imageUrl: scene.assets[0]?.imageUrl ?? null,
  });
}
