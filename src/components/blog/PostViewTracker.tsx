"use client";

import { useEffect } from "react";
import { updatePostViews } from "@/lib/blog-service";

export function PostViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    updatePostViews(postId);
  }, [postId]);
  return null;
}
