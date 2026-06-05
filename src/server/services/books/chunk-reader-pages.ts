// src/server/services/books/chunk-reader-pages.ts

type Scene = {
  id: string;

  anchorIndex: number | null;
};

export type ReaderPage = {
  paragraphs: string[];

  paragraphStartIndex: number;

  paragraphEndIndex: number;
};

const TARGET_PAGE_SIZE = 1400;

export function chunkReaderPages(
  paragraphs: string[],
): ReaderPage[] {
  const pages: ReaderPage[] = [];

  let currentPage: string[] = [];

  let currentLength = 0;

  let pageStartIndex = 0;

  paragraphs.forEach(
    (paragraph, index) => {
      const paragraphLength =
        paragraph.length;

      if (
        currentLength +
          paragraphLength >
          TARGET_PAGE_SIZE &&
        currentPage.length > 0
      ) {
        pages.push({
          paragraphs: currentPage,

          paragraphStartIndex:
            pageStartIndex,

          paragraphEndIndex:
            index - 1,
        });

        currentPage = [];

        currentLength = 0;

        pageStartIndex = index;
      }

      currentPage.push(paragraph);

      currentLength +=
        paragraphLength;
    },
  );

  if (currentPage.length > 0) {
    pages.push({
      paragraphs: currentPage,

      paragraphStartIndex:
        pageStartIndex,

      paragraphEndIndex:
        paragraphs.length - 1,
    });
  }

  return pages;
}