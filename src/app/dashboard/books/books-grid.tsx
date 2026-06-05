// src/app/dashboard/books/books-grid.tsx

"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

import UploadButton from "./upload-button";

type Asset = {
  id: string;

  type: string;

  imageUrl: string;
};

type Scene = {
  id: string;

  assets: Asset[];
};

type Chapter = {
  id: string;

  scenes: Scene[];
};

type Book = {
  id: string;

  title: string;

  heroImageUrl: string | null;

  author: string | null;

  processingStatus: string;

  createdAt: string;

  _count: {
    chapters: number;
  };
};

function getProcessingLabel(status: string) {
  switch (status) {
    case "UPLOADING":
      return "Uploading book...";

    case "PROCESSING_CHARACTERS":
      return "Analyzing characters...";

    case "PROCESSING_SCENES":
      return "Extracting cinematic moments from first chapter...";

    case "GENERATING_PREVIEW":
      return "Generating opening scene...";

    case "READY":
      return "Ready to read";

    default:
      return "Preparing book...";
  }
}

export default function BooksGrid() {
  const [books, setBooks] = useState<Book[]>([]);

  const [loading, setLoading] = useState(true);

  async function fetchBooks() {
    try {
      const response = await fetch("/api/books");

      if (!response.ok) {
        return;
      }

      const data: {
        books: Book[];
      } = await response.json();

      setBooks(data.books);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchBooks();
  }, []);

    useEffect(() => {
      const hasProcessingBooks = books.some(
        (book) => book.processingStatus !== "READY",
      );

      if (!hasProcessingBooks) {
        return;
      }

      console.log("Setting up polling for book status...", books);

      const interval = setInterval(() => {
        void fetchBooks();
      }, 3000);

      return () => clearInterval(interval);
    }, [books]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}

      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">SceneWoven</h1>

          <p className="mt-2 text-zinc-400">Cinematic reading experiences.</p>
        </div>

        <UploadButton />
      </div>

      {/* Loading */}

      {loading && books.length === 0 ? (
        <div className="text-zinc-500">Loading library...</div>
      ) : null}

      {/* Grid */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {books.map((book) => {
          const isReady = book.processingStatus === "READY";

          return (
            <div
              key={book.id}
              className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950"
            >
              {/* Hero */}

              <div className="aspect-video border-b border-zinc-800 bg-zinc-900">
                {book.heroImageUrl ? (
                  <img
                    src={book.heroImageUrl}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-600">
                    Preparing preview...
                  </div>
                )}
              </div>

              {/* Content */}

              <div className="p-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {book.title}
                  </h2>

                  <p className="mt-2 text-zinc-400">
                    {book.author ?? "Unknown Author"}
                  </p>
                </div>

                {/* Status / CTA */}

                <div className="mt-6">
                  {isReady ? (
                    <Link
                      href={`/dashboard/books/${book.id}/read/1`}
                      className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                    >
                      Continue Reading
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black/30 px-4 py-3 text-sm text-zinc-400">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" />

                      <span>{getProcessingLabel(book.processingStatus)}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}

                <div className="mt-6 flex items-center justify-between text-sm text-zinc-500">
                  <div>{book._count.chapters} chapters</div>

                  <div>
                    {new Date(book.createdAt).toISOString().split("T")[0]}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
