// src/server/ai/build-image-prompt.ts

import { buildCharacterContext } from "./build-character-context";

type CharacterForPrompt = {
  name: string;

  description: string;

  appearance: string | null;

  personality: string | null;
};

type SceneForImagePrompt = {
  title: string;

  summary: string;

  mood: string | null;

  location: string | null;

  visualDescription: string | null;

  characters: unknown;
};

type BuildImagePromptInput = {
  scene: SceneForImagePrompt;

  characters?: CharacterForPrompt[];

  styleGuide?: string;
};

export function buildImagePrompt({
  scene,
  characters = [],
  styleGuide,
}: BuildImagePromptInput) {
  const sceneCharacterNames =
    Array.isArray(scene.characters)
      ? scene.characters.filter(
          (character): character is string =>
            typeof character === "string",
        )
      : [];

  const characterContext =
    buildCharacterContext({
      sceneCharacterNames,

      characters,
    });

  return `
Cinematic scene from a literary adaptation.

Visual style:
${styleGuide ?? "cinematic live-action film adaptation"}

Scene title:
${scene.title}

Mood:
${scene.mood ?? "moody"}

Location:
${scene.location ?? "unknown location"}

Scene summary:
${scene.summary}

Visual description:
${scene.visualDescription ?? ""}

${characterContext}

Cinematography:
- wide cinematic framing
- horizontal composition
- anamorphic lens aesthetic
- environmental storytelling
- natural cinematic blocking
- frame from a live-action feature film
- realistic production design
- subtle film grain
- dramatic practical lighting
- atmospheric depth
- realistic textures
- visually grounded realism
- characters should occupy only part of the frame
- strong environmental presence
- the setting should feel immersive and lived-in
- not centered symmetrically unless dramatically necessary
- include substantial environmental context around characters

Style requirements:
- highly detailed
- emotionally evocative
- cinematic realism
- immersive atmosphere
- realistic facial features
- grounded physical environments

NO:
- text
- captions
- subtitles
- typography
- labels
- logos
- watermarks
- signatures
- poster composition
- book cover composition
- collage layouts
- split-screen imagery
- overly stylized digital art
`;
}