"use client";

import { useEffect } from "react";

type Props = {
  chapterId?: string;
};

export function ChapterPrefetcher({
  chapterId,
}: Props) {
  useEffect(() => {
    if (!chapterId) {
      return;
    }

    fetch(
      `/api/chapters/${chapterId}/prepare`,
      {
        method: "POST",
      },
    ).catch(console.error);
  }, [chapterId]);

  return null;
}