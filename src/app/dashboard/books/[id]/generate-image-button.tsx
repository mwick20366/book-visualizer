"use client";

import { useState } from "react";

type Props = {
  sceneId: string;
};

export default function GenerateImageButton({
  sceneId,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/scenes/${sceneId}/generate-image`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      window.location.reload();
    } catch (error) {
      console.error(error);

      alert("Image generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="
        rounded-lg
        bg-white
        px-4
        py-2
        text-sm
        font-medium
        text-black
        transition
        hover:bg-zinc-200
        disabled:opacity-50
      "
    >
      {loading
        ? "Generating..."
        : "Generate Image"}
    </button>
  );
}