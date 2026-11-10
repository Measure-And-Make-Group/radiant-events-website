"use client";

import { useEffect, useRef } from "react";

/**
 * A short, silent behind-the-scenes loop. It loads nothing until it is near
 * the viewport, plays only while visible, and never autoplays for visitors
 * who prefer reduced motion (they get the poster with play controls).
 */
export default function LoopVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.controls = true;
      return;
    }
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.preload === "none") video.preload = "auto";
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="rs-loop-video"
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  );
}
