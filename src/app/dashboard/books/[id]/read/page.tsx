// src/app/books/[id]/read/page.tsx

import Link from "next/link";

import { notFound } from "next/navigation";

import { db } from "@/server/db";
import { InlineScene } from "@/app/_components/inline-scene";

type ReadPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReadPage({ params }: ReadPageProps) {
  const { id } = await params;

  const book = await db.book.findUnique({
    where: {
      id,
    },

    include: {
      chapters: {
        orderBy: {
          order: "asc",
        },

        include: {
          scenes: {
            orderBy: {
              order: "asc",
            },

            include: {
              assets: true,
            },
          },
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-16">
          <Link
            href={`/books/${book.id}`}
            className="text-sm text-zinc-500 transition hover:text-zinc-300"
          >
            ← Back to Book
          </Link>

          <h1 className="mt-6 text-5xl font-bold tracking-tight">
            {book.title}
          </h1>

          {book.author && (
            <p className="mt-4 text-lg text-zinc-400">by {book.author}</p>
          )}
        </div>

        <div className="space-y-32">
          {book.chapters.map((chapter) => {
            const paragraphs =
              chapter.content
                ?.split(/\n\s*\n/)
                .map((p) => p.trim())
                .filter(Boolean) ?? [];

            return (
              <section key={chapter.id} className="space-y-12">
                <div className="border-b border-zinc-800 pb-6">
                  <h2 className="text-3xl font-semibold">{chapter.title}</h2>
                </div>

                <article className="prose prose-invert prose-zinc max-w-none">
                  <div className="space-y-8 text-lg leading-8">
                    {paragraphs.map((paragraph, paragraphIndex) => {
                      const matchingScenes = chapter.scenes.filter(
                        (scene) => scene.anchorIndex === paragraphIndex,
                      );

                      return (
                        <div key={paragraphIndex} className="space-y-8">
                          <p>{paragraph}</p>

                          {matchingScenes.map((scene) => {
                            const image = scene.assets.find(
                              (asset) => asset.type === "image",
                            );

                            return (
                              <div
                                key={scene.id}
                                className="my-10 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
                              >
                                <InlineScene
                                  sceneId={scene.id}
                                  title={scene.title}
                                  summary={scene.summary}
                                  existingImageUrl={image?.imageUrl}
                                />
                                {/* {image ? (
                                  <div className="aspect-video overflow-hidden">
                                    <img
                                      src={image.imageUrl}
                                      alt={scene.title}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <form
                                    action={`/api/scenes/${scene.id}/generate-image`}
                                    method="POST"
                                    className="p-6"
                                  >
                                    <div className="space-y-4">
                                      <div>
                                        <h3 className="text-xl font-semibold text-white">
                                          {scene.title}
                                        </h3>

                                        <p className="mt-2 text-sm text-zinc-400">
                                          {scene.summary}
                                        </p>
                                      </div>

                                      <button
                                        type="submit"
                                        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                                      >
                                        Visualize Scene
                                      </button>
                                    </div>
                                  </form>
                                )} */}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </article>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
