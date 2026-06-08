"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FilmCountdown } from "./film-countdown";

type InlineSceneProps = {
  sceneId: string;

  title: string;

  summary: string;

  visualDescription: string;

  existingImageUrl?: string | null;

  existingCaption?: string | null;
};

function buildTeaser(visualDescription: string, maxWords = 10) {
  const words = visualDescription.trim().split(/\s+/);

  if (words.length <= maxWords) {
    return visualDescription;
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
}

export function InlineScene({
  sceneId,
  title,
  summary,
  visualDescription,
  existingImageUrl,
  existingCaption,
}: InlineSceneProps) {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const [showVisualizer, setShowVisualizer] = useState(false);

  const [showImage, setShowImage] = useState(!!existingImageUrl);

  const [imageUrl, setImageUrl] = useState(existingImageUrl);

  const [revealedText, setRevealedText] = useState("");
  const [progress, setProgress] = useState(0);

  const teaser = buildTeaser(summary, 10);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setRevealedText("");

      return;
    }

    const DURATION_MS = 60_000;

    const startedAt = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;

      const nextProgress = Math.min(elapsed / DURATION_MS, 0.95);

      setProgress(nextProgress);

      const visibleChars = Math.floor(teaser.length * nextProgress);

      setRevealedText(teaser.slice(0, visibleChars));
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading, teaser]);

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
          blocked?: boolean;
          imageUrl: string;
        } = await response.json();

        if (data.blocked) {
          toast.error("This scene is unavailable for illustration.");

          router.refresh();

          return;
        }

        console.log("Received image data:", data);

        setImageUrl(data.imageUrl);

        setProgress(1);

        // setCaption(data.caption);

        // Small pause so the
        // cinematic layer breathes
        // before image emerges

        setTimeout(() => {
          setShowImage(true);

          setIsLoading(false);
        }, 400);
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
              {isLoading && !showImage && <FilmCountdown progress={progress} />}

              <div className="mb-6 text-xs tracking-[0.35em] text-zinc-500 uppercase">
                Visualizing Scene
              </div>

              {/* <p className="font-serif text-base leading-7 tracking-[0.015em] text-zinc-200">
                {revealedText}

                <span className="ml-1 inline-block animate-pulse text-zinc-500">
                  |
                </span>
              </p>

              <div className="mt-8">
                <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white/40 transition-[width] duration-200"
                    style={{
                      width: `${progress * 100}%`,
                    }}
                  />
                </div>
              </div> */}
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
          existingCaption ? "opacity-100" : "opacity-0"
        } `}
      >
        {existingCaption && (
          <div className="px-5 py-4">
            <p className="text-sm leading-6 text-zinc-500 italic">
              {existingCaption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
