// src/inngest/functions/generate-scene.ts

import { inngest } from "../client";

import { generateSceneImage } from "@/server/ai/generate-scene-image";

export const generateSceneFunction =
  inngest.createFunction(
    {
      id: "generate-scene",

      triggers: [
        {
          event: "scene/generate",
        },
      ],
    },

    async ({ event }) => {
      await generateSceneImage(
        event.data.sceneId,
      );
    },
  );