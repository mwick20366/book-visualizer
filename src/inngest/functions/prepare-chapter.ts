// src/inngest/functions/prepare-chapter.ts

import { inngest } from "../client";

import { prepareChapter } from "@/server/services/books/prepare-chapter";

export const prepareChapterFunction =
  inngest.createFunction(
    {
      id: "prepare-chapter",

      triggers: [
        {
          event: "chapter/prepare",
        },
      ],
    },

    async ({ event }) => {
      await prepareChapter(
        event.data.chapterId,
      );
    },
  );