// src/app/dashboard/books/[id]/read/[chapter]/page.tsx

import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import { db } from "@/server/db";

import { InlineScene } from "@/app/_components/inline-scene";
import { prepareChapter } from "@/server/services/books/prepare-chapter";
import { ChapterPrefetcher } from "./chapter-prefetcher";

type ReadChapterPageProps = {
  params: Promise<{
    id: string;

    chapter: string;
  }>;
};

export default async function ReadChapterPage({
  params,
}: ReadChapterPageProps) {
  const { id, chapter } = await params;

  const chapterOrder = Number(chapter);

  const book = await db.book.findUnique({
    where: {
      id,
    },

    include: {
      chapters: {
        orderBy: {
          order: "asc",
        },

        select: {
          id: true,
          title: true,
          order: true,
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  const currentChapter = await db.chapter.findFirst({
    where: {
      bookId: id,
      order: chapterOrder,
    },

    select: {
      id: true,
      title: true,
      content: true,
      order: true,

      processingStatus: true,

      scenes: {
        orderBy: {
          order: "asc",
        },

        include: {
          assets: true,
        },
      },
    },
  });

  if (!currentChapter) {
    notFound();
  }

  if (currentChapter.processingStatus !== "ready") {
    await prepareChapter(currentChapter.id);

    return redirect(`/dashboard/books/${id}/read/${chapter}`);
  }

  const paragraphs =
    currentChapter.content
      ?.split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean) ?? [];

  const previousChapter = book.chapters.find(
    (c) => c.order === chapterOrder - 1,
  );

  const nextChapter = book.chapters.find((c) => c.order === chapterOrder + 1);

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-10 md:py-16">
        {/* Header */}

        <header className="mb-12">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/books`}
              className="text-sm text-zinc-500 transition hover:text-zinc-300"
            >
              ← Library
            </Link>

            <details className="relative">
              <summary className="cursor-pointer list-none text-sm text-zinc-500 transition hover:text-zinc-300">
                Chapters
              </summary>

              <div className="absolute right-0 z-50 mt-4 w-72 rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
                <div className="space-y-2">
                  {book.chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/dashboard/books/${book.id}/read/${chapter.order}`}
                      className={`block rounded-lg px-3 py-2 text-sm transition ${
                        chapter.order === chapterOrder
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      } `}
                    >
                      {chapter.title}
                    </Link>
                  ))}
                </div>
              </div>
            </details>
          </div>

          <div className="mt-10">
            <div className="text-sm tracking-[0.2em] text-zinc-500 uppercase">
              {book.title}
            </div>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {currentChapter.title}
            </h1>
          </div>
        </header>

        {/* Reading Content */}

        <article className="prose prose-invert prose-zinc max-w-none">
          <div className="space-y-8 text-lg leading-8">
            {paragraphs.map((paragraph, paragraphIndex) => {
              const matchingScenes = currentChapter.scenes.filter(
                (scene) => scene.anchorIndex === paragraphIndex,
              );

              return (
                <div key={paragraphIndex} className="space-y-8">
                  <p>{paragraph}</p>

                  {matchingScenes.map((scene) => {
                    if (scene.isHidden) {
                      return null;
                    }
                    
                    const image = scene.assets.find(
                      (asset) => asset.type === "image",
                    );

                    return (
                      <InlineScene
                        key={scene.id}
                        sceneId={scene.id}
                        title={scene.title}
                        summary={scene.summary}
                        visualDescription={scene.visualDescription!}
                        existingImageUrl={image?.imageUrl}
                        existingCaption={scene?.caption ?? image?.caption}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </article>

        {/* Footer Navigation */}
        {nextChapter && <ChapterPrefetcher chapterId={nextChapter.id} />}
        <footer className="mt-20 flex items-center justify-between border-t border-zinc-800 pt-8">
          {previousChapter ? (
            <Link
              href={`/dashboard/books/${book.id}/read/${previousChapter.order}`}
              className="text-sm text-zinc-400 transition hover:text-zinc-200"
            >
              ← Previous Chapter
            </Link>
          ) : (
            <div />
          )}

          {nextChapter ? (
            <Link
              href={`/dashboard/books/${book.id}/read/${nextChapter.order}`}
              className="text-sm text-zinc-400 transition hover:text-zinc-200"
            >
              Next Chapter →
            </Link>
          ) : null}
        </footer>
      </div>
    </main>
  );
}
