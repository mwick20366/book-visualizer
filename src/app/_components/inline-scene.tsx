"use client";

import { useEffect, useState } from "react";

type InlineSceneProps = {
  sceneId: string;

  title: string;

  summary: string;

  visualDescription: string;

  existingImageUrl?: string | null;

  existingCaption?: string | null;
};

export function InlineScene({
  sceneId,
  title,
  summary,
  visualDescription,
  existingImageUrl,
  existingCaption,
}: InlineSceneProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [showVisualizer, setShowVisualizer] = useState(false);

  const [showCaption, setShowCaption] = useState(!!existingCaption);

  const [showImage, setShowImage] = useState(!!existingImageUrl);

  const [imageUrl, setImageUrl] = useState(existingImageUrl);

  const [caption, setCaption] = useState(existingCaption);

  const [revealedText, setRevealedText] = useState("");

  useEffect(() => {
    console.log("caption", caption);
  }, [caption]);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    setRevealedText("");

    let index = 0;

    const interval = setInterval(() => {
      index++;

      setRevealedText(visualDescription.slice(0, index));

      if (index >= visualDescription.length) {
        clearInterval(interval);
      }
    }, 130);

    return () => clearInterval(interval);
  }, [isLoading, visualDescription]);

  async function generateImage() {
    try {
      setShowVisualizer(true);

      // Allow cinematic layer
      // to softly fade in first

      setTimeout(async () => {
        setIsLoading(true);

        setShowImage(false);

        const response = await fetch(`/api/scenes/${sceneId}/generate-image`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to generate image");
        }

        const data: {
          imageUrl: string;

          caption: string;
        } = await response.json();

        console.log("Received image data:", data);

        setImageUrl(data.imageUrl);

        setCaption(data.caption);

        // Small pause so the
        // cinematic layer breathes
        // before image emerges

        setTimeout(() => {
          setShowImage(true);

          setTimeout(() => {
            setShowCaption(true);
          }, 1200);

          setIsLoading(false);
        }, 100);
      }, 300);
    } catch (error) {
      console.error(error);

      setIsLoading(false);
    }
  }

  // const showCinematicLayer = showVisualizer && (isLoading || !showImage);

  return (
    <div className="my-10 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      {/* Frame */}

      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-950 via-zinc-900 to-purple-950">
        {/* Initial button state */}

        <div
          className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-500 ${
            showVisualizer
              ? "pointer-events-none hidden opacity-0"
              : "opacity-100"
          } `}
        >
          <button
            onClick={generateImage}
            className="rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            Visualize Scene
          </button>
        </div>

        {/* Cinematic layer */}

        <div
          className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-[1800ms] ${
            showVisualizer && !showImage ? "opacity-100" : "opacity-0"
          } `}
        >
          {/* Background */}

          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-zinc-900 to-purple-950" />

          {/* Glow */}

          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-violet-500/10 via-sky-500/5 to-amber-500/10" />

          {/* Shimmer */}

          <div className="absolute inset-y-0 -left-1/3 w-1/2 animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl" />

          {/* Text */}

          <div className="absolute inset-0 flex items-center justify-center p-12 md:p-20">
            <div className="max-w-md text-center">
              <div className="mb-6 text-xs tracking-[0.35em] text-zinc-500 uppercase">
                Visualizing Scene
              </div>

              <p className="font-serif text-lg leading-9 tracking-[0.015em] text-zinc-200">
                {revealedText}

                <span className="ml-1 inline-block animate-pulse text-zinc-500">
                  |
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Image */}

        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className={`absolute inset-0 z-30 h-full w-full object-cover transition-opacity duration-[2200ms] ${
              showImage ? "opacity-100" : "opacity-0"
            } `}
          />
        )}
      </div>

      {/* Caption */}

      <div
        className={`relative z-40 min-h-[72px] transition-opacity duration-[2200ms] ${
          showImage && caption ? "opacity-100" : "opacity-0"
        } `}
      >
        {caption && (
          <div className="px-5 py-4">
            <p className="text-sm leading-6 text-zinc-500 italic">{caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
