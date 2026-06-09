// src/app/api/books/upload/route.ts
import { NextResponse } from "next/server";

import { db } from "@/server/db";
import { parseEpub } from "@/server/services/books/parse-epub";
import { processBook } from "@/server/services/books/process-book";
import { uploadFile } from "@/server/storage/upload-file";
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".epub")) {
      return NextResponse.json(
        { error: "Only EPUB files are supported" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bookId = crypto.randomUUID();

    const key = `books/${bookId}/original.epub`;

    await uploadFile({
      key,

      body: buffer,

      contentType: "application/epub+zip",
    });

    // const uploadDir = path.join(process.cwd(), "uploads", bookId);

    // await mkdir(uploadDir, { recursive: true });

    // const filePath = path.join(uploadDir, file.name);

    // await writeFile(filePath, buffer);

    // TEMP USER LOOKUP
    let user = await db.user.findFirst();

    if (!user) {
      user = await db.user.create({
        data: {
          id: crypto.randomUUID(),
          name: "Dev User",
          email: "dev@example.com",
          emailVerified: true,
        },
      });
    }

    // Parse EPUB
    const parsedBook = await parseEpub(buffer);

    // Create Book
    const book = await db.book.create({
      data: {
        id: bookId,
        title: parsedBook.title,
        author: parsedBook.author,
        fileName: file.name,
        sourceKey: key,
        status: "processed",
        userId: user.id,

        chapters: {
          create: parsedBook.chapters
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((chapter, index) => ({
              title: chapter.title,
              content: chapter.content,
              order: index + 1,
            })),
        },
      },

      include: {
        chapters: true,
      },
    });

    void processBook(book.id).catch((error) => {
      console.error("Failed to process book:", error);
    });

    // await inngest.send({
    //   name: "book/process",

    //   data: {
    //     bookId: book.id,
    //   },
    // });

    return NextResponse.json({
      success: true,
      book,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
