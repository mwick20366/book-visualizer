// src/server/services/books/parse-epub.ts

import AdmZip from "adm-zip";

import * as cheerio from "cheerio";

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

function extractStructuredText(
  html: string,
): string {
  const $ = cheerio.load(html);

  const blocks: string[] = [];

  $("h1, h2, h3, h4, h5, h6, p").each(
    (_, element) => {
      const text = $(element)
        .text()
        .trim();

      if (text) {
        blocks.push(text);
      }
    },
  );

  return blocks.join("\n\n");
}

function extractTitle(
  html: string,
  fallback: string,
): string {
  const $ = cheerio.load(html);

  return (
    $("h1").first().text().trim() ||
    $("h2").first().text().trim() ||
    fallback
  );
}

export async function parseEpub(
  filePath: string,
): Promise<ParsedBook> {
  const zip = new AdmZip(filePath);

  const entries = zip.getEntries();

  let title = "Unknown Title";

  let author: string | undefined;

  const chapters: ParsedChapter[] = [];

  for (
    let index = 0;
    index < entries.length;
    index++
  ) {
    const entry = entries[index];

    if (!entry) {
      continue;
    }

    const lowerPath =
      entry.entryName.toLowerCase();

    // Metadata
    if (
      lowerPath.endsWith(".opf")
    ) {
      const xml =
        entry
          .getData()
          .toString("utf-8");

      const $ = cheerio.load(xml, {
        xmlMode: true,
      });

      title =
        $("dc\\:title")
          .first()
          .text()
          .trim() || title;

      author =
        $("dc\\:creator")
          .first()
          .text()
          .trim() || author;

      continue;
    }

    // XHTML / HTML chapters
    if (
      !lowerPath.endsWith(".xhtml") &&
      !lowerPath.endsWith(".html") &&
      !lowerPath.endsWith(".htm")
    ) {
      continue;
    }

    const html =
      entry
        .getData()
        .toString("utf-8");

    const content =
      extractStructuredText(html);

    if (!content) {
      continue;
    }

    const chapterTitle =
      extractTitle(
        html,
        `Chapter ${chapters.length + 1}`,
      );

    chapters.push({
      title: chapterTitle,

      content,

      order: chapters.length,
    });
  }

  const cleanedChapters =
    chapters.filter((chapter) => {
      const lowerTitle =
        chapter.title.toLowerCase();

      return (
        chapter.content.length > 500 &&
        !chapter.content.includes(
          "Project Gutenberg",
        ) &&
        !lowerTitle.includes("cover") &&
        !lowerTitle.includes(
          "contents",
        ) &&
        !lowerTitle.includes(
          "copyright",
        )
      );
    });

  return {
    title,

    author,

    chapters: cleanedChapters,
  };
}