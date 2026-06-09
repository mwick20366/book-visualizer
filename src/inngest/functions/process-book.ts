import { inngest } from "../client";

import { processBook } from "@/server/services/books/process-book";

export const processBookFunction =
  inngest.createFunction(
    {
      id: "process-book",

      triggers: [
        {
          event: "book/process",
        },
      ],
    },

    async ({ event }) => {
      await processBook(
        event.data.bookId,
      );
    },
  );