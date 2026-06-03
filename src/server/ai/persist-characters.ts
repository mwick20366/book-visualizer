// src/server/ai/persist-characters.ts

import { db } from "@/server/db";

import type {
  CharacterExtractionResult,
  ExtractedCharacter,
} from "./extract-characters";

type PersistCharactersInput = {
  bookId: string;

  extractionResult: CharacterExtractionResult;
};

export async function persistCharacters({
  bookId,
  extractionResult,
}: PersistCharactersInput) {
  await db.character.deleteMany({
    where: {
      bookId,
    },
  });

  const createdCharacters =
    await Promise.all(
      extractionResult.characters.map(
        (
          character: ExtractedCharacter,
        ) =>
          db.character.create({
            data: {
              name: character.name,

              description:
                character.description,

              appearance:
                character.appearance,

              personality:
                character.personality,

              aliases: character.aliases,
              
              rawAiOutput: character,

              bookId,
            },
          }),
      ),
    );

  return createdCharacters;
}