"use client";

import { useRef, useState } from "react";

type UploadState =
  | "idle"
  | "uploading"
  | "processing_characters"
  | "processing_scenes"
  | "generating_preview";

const STATUS_LABELS: Record<
  UploadState,
  string
> = {
  idle: "Upload EPUB",

  uploading: "Uploading...",

  processing_characters:
    "Analyzing characters...",

  processing_scenes:
    "Extracting cinematic moments...",

  generating_preview:
    "Generating opening scene...",
};

export default function UploadButton() {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [state, setState] =
    useState<UploadState>("idle");

  async function pollBookStatus(
    bookId: string,
  ) {
    let isReady = false;

    while (!isReady) {
      await new Promise((resolve) =>
        setTimeout(resolve, 2000),
      );

      const response = await fetch(
        `/api/books/${bookId}/status`,
      );

      if (!response.ok) {
        break;
      }

      const data: {
        processingStatus: string;
      } = await response.json();

      switch (
        data.processingStatus
      ) {
        case "PROCESSING_CHARACTERS":
          setState(
            "processing_characters",
          );
          break;

        case "PROCESSING_SCENES":
          setState(
            "processing_scenes",
          );
          break;

        case "GENERATING_PREVIEW":
          setState(
            "generating_preview",
          );
          break;

        case "READY":
          isReady = true;
          break;
      }
    }

    window.location.reload();
  }

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setState("uploading");

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      const response =
        await fetch(
          "/api/books/upload",
          {
            method: "POST",

            body: formData,
          },
        );

      if (!response.ok) {
        throw new Error(
          "Upload failed",
        );
      }

      const data: {
        bookId: string;
      } = await response.json();

      await pollBookStatus(
        data.bookId,
      );
    } catch (error) {
      console.error(error);

      alert("Upload failed");

      setState("idle");
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".epub"
        className="hidden"
        onChange={handleUpload}
      />

      <button
        onClick={() =>
          inputRef.current?.click()
        }
        disabled={state !== "idle"}
        className="
          rounded-xl
          bg-white
          px-5
          py-2
          text-sm
          font-medium
          text-black
          transition
          hover:bg-zinc-200
          disabled:cursor-not-allowed
          disabled:opacity-70
        "
      >
        {STATUS_LABELS[state]}
      </button>
    </div>
  );
}