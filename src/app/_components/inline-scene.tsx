"use client";

import { useState } from "react";

type InlineSceneProps = {
  sceneId: string;

  title: string;

  summary: string;

  existingImageUrl?: string | null;
};

export function InlineScene({
  sceneId,
  title,
  summary,
  existingImageUrl,
}: InlineSceneProps) {
  const [isLoading, setIsLoading] =
    useState(false);

  const [imageUrl, setImageUrl] =
    useState(existingImageUrl);

  async function generateImage() {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/scenes/${sceneId}/generate-image`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to generate image",
        );
      }

      const data =
        await response.json();

      console.log("Generated image data:", data);
      
      setImageUrl(data.imageUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (imageUrl) {
    return (
      <div
        className="
          my-10
          overflow-hidden
          rounded-2xl
          border
          border-zinc-800
          bg-zinc-950
        "
      >
        <div
          className="
            aspect-video
            overflow-hidden
          "
        >
          <img
            src={imageUrl}
            alt={title}
            className="
              h-full
              w-full
              object-cover
            "
          />
        </div>
      </div>
    );
  }

  return (
    <div className="my-10">
      <button
        onClick={generateImage}
        disabled={isLoading}
        className="
          rounded-full
          border
          border-zinc-700
          bg-zinc-900
          px-5
          py-2
          text-sm
          text-zinc-300
          transition
          hover:border-zinc-500
          hover:bg-zinc-800
          disabled:opacity-50
        "
      >
        {isLoading
          ? "Visualizing..."
          : "Visualize Scene"}
      </button>
    </div>
  );
}