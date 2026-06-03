// src/server/ai/extract-scenes.ts

import { openai } from "./openai";

import { SCENE_EXTRACTION_PROMPT } from "./prompts/scene-extraction";

export type ExtractedScene = {
  title: string;

  summary: string;

  mood: string;

  characters: string[];

  location: string;

  visualDescription: string;
};

type OpenAIResponse = {
  scenes: ExtractedScene[];
};

export type SceneExtractionResult = {
  scenes: ExtractedScene[];

  rawResponse: unknown;
};

export async function extractScenes(
  chapterTitle: string,

  chapterText: string,
): Promise<SceneExtractionResult> {
  const response =
    await openai.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",

          content:
            SCENE_EXTRACTION_PROMPT,
        },

        {
          role: "user",

          content: `
Extract cinematic scenes from the following chapter.

Chapter title:
${chapterTitle}

Chapter content:

${chapterText}
          `,
        },
      ],

      response_format: {
        type: "json_object",
      },

      temperature: 0.3,
    });

  const content =
    response.choices[0]?.message?.content;

  if (!content) {
    throw new Error(
      "No response content returned from OpenAI",
    );
  }

  let parsed: OpenAIResponse;

  try {
    parsed = JSON.parse(
      content,
    ) as OpenAIResponse;
  } catch (error) {
    console.error(
      "Failed to parse OpenAI JSON:",
      content,
    );

    throw error;
  }

  if (
    !parsed.scenes ||
    !Array.isArray(parsed.scenes)
  ) {
    throw new Error(
      "Invalid scene response structure",
    );
  }

  return {
    scenes: parsed.scenes,

    rawResponse: parsed,
  };
}