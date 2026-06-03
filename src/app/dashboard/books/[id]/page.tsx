// src/app/dashboard/books/[id]/page.tsx

import { notFound } from "next/navigation";

import { db } from "@/server/db";

import GenerateImageButton from "./generate-image-button";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookPage({ params }: PageProps) {
  const { id } = await params;

  const book = await db.book.findUnique({
    where: {
      id,
    },

    include: {
      chapters: {
        include: {
          scenes: {
            include: {
              assets: true,
            },

            orderBy: {
              order: "asc",
            },
          },
        },

        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight">{book.title}</h1>

          <p className="mt-3 text-lg text-zinc-400">
            {book.author ?? "Unknown Author"}
          </p>

          <div className="mt-6 flex gap-6 text-sm text-zinc-500">
            <div>Chapters: {book.chapters.length}</div>

            <div>
              Scenes:{" "}
              {book.chapters.reduce(
                (total, chapter) => total + chapter.scenes.length,
                0,
              )}
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {book.chapters.map((chapter) => (
            <section
              key={chapter.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">{chapter.title}</h2>

                <p className="mt-2 text-sm text-zinc-500">
                  {chapter.scenes.length} scenes
                </p>
              </div>

              {chapter.scenes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-700 p-6 text-sm text-zinc-500">
                  No scenes extracted yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {chapter.scenes.map((scene) => (
                    <div
                      key={scene.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-medium">{scene.title}</h3>

                          {scene.mood && (
                            <p className="mt-2 text-sm text-amber-300">
                              Mood: {scene.mood}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                            Scene {scene.order + 1}
                          </div>

                          <GenerateImageButton sceneId={scene.id} />
                        </div>
                      </div>

                      <p className="mt-4 leading-7 text-zinc-300">
                        {scene.summary}
                      </p>

                      {scene.location && (
                        <div className="mt-4 text-sm text-zinc-500">
                          <span className="font-medium text-zinc-400">
                            Location:
                          </span>{" "}
                          {scene.location}
                        </div>
                      )}

                      {scene.characters && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(scene.characters as string[]).map((character) => (
                            <span
                              key={character}
                              className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                            >
                              {character}
                            </span>
                          ))}
                        </div>
                      )}

                      {scene.visualDescription && (
                        <div className="mt-6 rounded-xl border border-zinc-800 bg-black/30 p-4">
                          <div className="mb-2 text-xs tracking-wide text-zinc-500 uppercase">
                            Visual Description
                          </div>

                          <p className="leading-7 text-zinc-300">
                            {scene.visualDescription}
                          </p>
                        </div>
                      )}

                      {scene.assets.length > 0 && scene.assets[0]?.imageUrl && (
                        <div className="mt-6 aspect-[16/9] overflow-hidden rounded-xl border border-zinc-800">
                          <img
                            src={scene.assets[0]?.imageUrl}
                            alt={scene.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
