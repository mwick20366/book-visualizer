// src/inngest/index.ts

import { processBookFunction }
  from "./functions/process-book";

import { prepareChapterFunction }
  from "./functions/prepare-chapter";

import { generateSceneFunction }
  from "./functions/generate-scene";

export const functions = [
  processBookFunction,
  prepareChapterFunction,
  generateSceneFunction,
];