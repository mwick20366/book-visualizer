// src/server/services/books/parse-epub.ts

import EPub from "epub2";

export type ParsedChapter = {
  title: string;
  content: string;
  order: number;
};

export type ParsedBook = {
  title: string;
  author?: string;
  chapters: ParsedChapter[];
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function parseEpub(filePath: string): Promise<ParsedBook> {
  return new Promise((resolve, reject) => {
    const epub = new EPub(filePath);

    epub.on("error", (error) => {
      reject(error);
    });

    epub.on("end", async () => {
      try {
        const chapters: ParsedChapter[] = [];

        const chapterPromises = epub.flow.map(
          (chapter, index) =>
            new Promise<void>((chapterResolve, chapterReject) => {
              epub.getChapter(chapter.id!, (error, text) => {
                if (error) {
                  chapterReject(error);
                  return;
                }

                chapters.push({
                  title: chapter.title ?? `Chapter ${index + 1}`,
                  content: stripHtml(text ?? ""),
                  order: index,
                });

                chapterResolve();
              });
            }),
        );

        await Promise.all(chapterPromises);

        const cleanedChapters = chapters.filter((chapter) => {
          return (
            chapter.content.length > 500 &&
            !chapter.content.includes("Project Gutenberg") &&
            !chapter.title.toLowerCase().includes("cover") &&
            !chapter.title.toLowerCase().includes("contents")
          );
        });

        resolve({
          title: epub.metadata.title ?? "Unknown Title",
          author: epub.metadata.creator,
          chapters: cleanedChapters,
        });
      } catch (error) {
        reject(error);
      }
    });

    epub.parse();
  });
}
