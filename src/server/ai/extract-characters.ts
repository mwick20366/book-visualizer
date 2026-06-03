// src/server/ai/extract-characters.ts
import { openai } from "./openai";
import type { InputJsonValue } from "@prisma/client/runtime/library";

export type ExtractedCharacter = {
  name: string;

  aliases?: string[];

  description: string;

  appearance: string;

  personality: string;

  castingArchetype?: string | null;
};

export type CharacterExtractionResult = {
  characters: ExtractedCharacter[];

  rawResponse: InputJsonValue;
};

type OpenAIResponse = {
  characters: ExtractedCharacter[];
};

export async function extractCharacters(
  bookText: string,
): Promise<CharacterExtractionResult> {
  const response =
    await openai.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",

          content: `
You are a literary character analysis engine.

Your task is to identify the most important recurring characters in a novel and generate stable canonical character profiles suitable for cinematic adaptation.

Include common aliases, shortened names, and titles by which the character may be referenced in scenes.
Include formal names, surnames, titles, nicknames, and abbreviated references that may appear in scene extraction.

For each character, choose exactly ONE classical cinematic actor archetype that best matches the character's appearance and demeanor.

Do not provide multiple actors or comparisons.

Each character must have a distinct cinematic archetype.

Do not reuse the same actor archetype for multiple major characters.

The archetype should function as a stable casting reference for visual continuity.

Do NOT use modern celebrities.
Prefer timeless classical Hollywood archetypes or descriptive cinematic comparisons.
Prefer actors with highly distinctive facial structure and recognizable visual identity.

Physical appearance descriptions must be highly specific and stable.

Always specify:
- hair color
- hairstyle
- facial hair
- approximate age
- skin tone
- facial structure
- distinguishing features
- typical wardrobe

Return ONLY valid JSON.

Format:

{
  "characters": [
    {
      "name": "string",
      "aliases": ["string"],
      "description": "string",
      "appearance": "string",
      "castingArchetype": "string",
      "personality": "string"
    }
  ]
}

Requirements:
- Focus on recurring important characters
- Infer visual appearance from prose when possible
- Create stable descriptions appropriate for cinematic continuity
- Keep descriptions grounded and realistic
- Avoid excessive verbosity
- Return between 3 and 10 important characters
          `,
        },

        {
          role: "user",

          content: `
Analyze the following book content and extract canonical character profiles.

Book content:

${bookText}
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

const normalizedCharacters =
  parsed.characters.map((character) => ({
    ...character,

    aliases: character.aliases ?? [],
  }));

  if (
    !parsed.characters ||
    !Array.isArray(parsed.characters)
  ) {
    throw new Error(
      "Invalid character response structure",
    );
  }

  return {
    characters: normalizedCharacters,

    rawResponse:
      parsed as InputJsonValue,
  };
}