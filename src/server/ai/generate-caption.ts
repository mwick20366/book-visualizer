// src/server/ai/generate-caption.ts

import { openai } from "./openai";

type GenerateCaptionInput = {
  title: string;

  summary: string;

  mood?: string;

  location?: string;
};

export async function generateCaption({
  title,
  summary,
  mood,
  location,
}: GenerateCaptionInput): Promise<string> {
  const response =
    await openai.responses.create({
      model: "gpt-4.1-mini",

      input: `
You are generating a literary cinematic caption
for an illustrated scene from a novel.

The caption should:
- be exactly one sentence
- feel atmospheric and literary
- resemble a caption beneath a film still
- evoke emotion or dramatic tension
- avoid mentioning cameras, composition, or visual framing
- avoid sounding like AI-generated metadata
- avoid directly describing every visual detail
- remain concise and elegant

Scene Title:
${title}

Scene Summary:
${summary}

${
  mood
    ? `Mood:\n${mood}`
    : ""
}

${
  location
    ? `Location:\n${location}`
    : ""
}

Return ONLY the caption text.
`,
    });

  const caption =
    response.output_text?.trim();

  if (!caption) {
    throw new Error(
      "Failed to generate caption",
    );
  }

  return caption;
}