// src/server/ai/build-character-context.ts

import { normalizeCharacterName } from "./normalize-character-name";

type CharacterForContext = {
  name: string;

  aliases?: string[];

  description: string;

  appearance: string | null;

  personality: string | null;
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
${character.name}

Description:
${character.description}

Appearance:
${character.appearance ?? "Unknown"}

Personality:
${character.personality ?? "Unknown"}
`,
  )
  .join("\n")}
`;
}