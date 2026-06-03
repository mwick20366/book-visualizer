// src/app/dashboard/books/page.tsx

import Link from "next/link";

import { db } from "@/server/db";
import UploadButton from "./upload-button";

export default async function BooksPage() {
  const books = await db.book.findMany({
    include: {
      chapters: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Book Visualizer
            </h1>

            <p className="mt-2 text-zinc-400">
              Upload books and generate cinematic scenes.
            </p>
          </div>

          <UploadButton />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/dashboard/books/${book.id}/read`}
              className="
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-900
                p-6
                transition
                hover:border-zinc-700
                hover:bg-zinc-800
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {book.title}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    {book.author ?? "Unknown Author"}
                  </p>
                </div>

                <span
                  className={`
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-medium
                    ${
                      book.status === "processed"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }
                  `}
                >
                  {book.status}
                </span>
              </div>

              <div className="mt-6 space-y-2 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Chapters</span>
                  <span>{book.chapters.length}</span>
                </div>

                <div className="flex justify-between">
                  <span>Imported</span>

                  <span>
                    {book.createdAt.toISOString().split("T")[0]}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}