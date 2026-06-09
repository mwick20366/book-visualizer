// src/server/ai/build-character-context.ts

import { normalizeCharacterName } from "./normalize-character-name";

type CharacterForContext = {
  name: string;

  aliases?: string[];

  description: string;

  appearance: string | null;

  personality: string | null;

  castingArchetype?: string | null;

  canonicalVisualIdentity?: string | null;

  visualAge?: string | null;

  species?: string | null;
};

type BuildCharacterContextInput = {
  sceneCharacterNames: string[];

  characters: CharacterForContext[];
};

export function buildCharacterContext({
  sceneCharacterNames,
  characters,
}: BuildCharacterContextInput) {
  const normalizedSceneCharacters =
    sceneCharacterNames.map(
      normalizeCharacterName,
    );

  const matchingCharacters =
    characters.filter((character) => {
      const normalizedName =
        normalizeCharacterName(
          character.name,
        );

      const normalizedAliases =
        (character.aliases ?? []).map(
          normalizeCharacterName,
        );

      return (
        normalizedSceneCharacters.includes(
          normalizedName,
        ) ||
        normalizedAliases.some((alias) =>
          normalizedSceneCharacters.includes(
            alias,
          ),
        )
      );
    });

  if (matchingCharacters.length === 0) {
    return "";
  }

  return `
Canonical Character Profiles:

${matchingCharacters
  .map(
    (character) => `
CHARACTER CONTINUITY REQUIREMENTS

${character.name}

Casting archetype:
${character.castingArchetype ?? "None specified"}

Canonical Visual Identity:
${character.canonicalVisualIdentity ?? "Unknown"}

Visual Age:
${character.visualAge ?? "Unknown"}

Species:
${character.species ?? "Unknown"}

Important:
Maintain this appearance exactly across all illustrations.
Do not reinterpret age, scale, species, wardrobe, facial structure, or hair color.

Personality:
${character.personality ?? "Unknown"}

Description:
${character.description}
`,
  )
  .join("\n")}
`;
}