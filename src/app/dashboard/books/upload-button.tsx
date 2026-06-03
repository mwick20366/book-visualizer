"use client";

import { useRef, useState } from "react";

export default function UploadButton() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/books/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      window.location.reload();
    } catch (error) {
      console.error(error);

      alert("Upload failed");
    } finally {
      setUploading(false);
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
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="
          rounded-lg
          bg-white
          px-5
          py-2
          text-sm
          font-medium
          text-black
          transition
          hover:bg-zinc-200
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {uploading ? "Uploading..." : "Upload EPUB"}
      </button>
    </div>
  );
}