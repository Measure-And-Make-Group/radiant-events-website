"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type ReelClip = {
  /** Web MP4 (H.264, muted, portrait 720×1280, a few seconds). */
  src: string;
  /** First frame, shown before the clip plays and under reduced motion. */
  poster: string;
  /** Short chapter label, e.g. "Blush & rose". */
  label: string;
  /** One line about the moment; also the clip's accessible label. */
  caption: string;
};

export const REEL_CLIPS: ReelClip[] = [
  { src: "/video/reel-blush.mp4", poster: "/video/reel-blush.webp", label: "Blush & rose", caption: "A sweet sixteen arch in every shade of pink." },
  { src: "/video/reel-candlelit.mp4", poster: "/video/reel-candlelit.webp", label: "Candlelit dinner", caption: "Taper candles, gold-rimmed plates and roses on deep red linen." },
  { src: "/video/reel-ivory-gold.mp4", poster: "/video/reel-ivory-gold.webp", label: "Ivory & gold", caption: "A cascading garland that greets guests in the lobby." },
  { src: "/video/reel-midnight-gold.mp4", poster: "/video/reel-midnight-gold.webp", label: "Midnight & gold", caption: "Navy, black and chrome gold, layered up close." },
  { src: "/video/reel-navy-ivory.mp4", poster: "/video/reel-navy-ivory.webp", label: "Navy & ivory", caption: "An arch framed in navy, ivory and gold." },
  { src: "/video/reel-pastel.mp4", poster: "/video/reel-pastel.webp", label: "Pastel party", caption: "A playful garland in lilac, coral, pink and lime." },
  { src: "/video/reel-social-house.mp4", poster: "/video/reel-social-house.webp", label: "The reveal", caption: "Finished and in place at Social House, Roswell." },
];

/**
 * "The REP experience": real installation footage played as a story.
 * Portrait clips play one after another in a tall frame over a soft ambient
 * glow of the current scene, with chapter rails that fill as each plays.
 * Nothing downloads until the section is near the screen; it pauses when
 * scrolled away, can be paused at any time, and never autoplays for people
 * who prefer reduced motion (they see still frames and can choose a chapter).
 */
export default function ExperienceReel({
  clips = REEL_CLIPS,
  eyebrow = "The REP experience",
  title,
  intro,
  id = "experience",
}: {
  clips?: ReelClip[];
  eyebrow?: string;
  title: ReactNode;
  intro?: string;
  id?: string;
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [progress, setProgress] = useState(0);
  const root = useRef<HTMLElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const arm = () => {
      setNear(true);
      setPlaying(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) {
      queueMicrotask(arm);
      return;
    }
    // Footage never competes with the page's first paint: start observing
    // only once the page has loaded and the browser is idle.
    const nearIo = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        arm();
        nearIo.disconnect();
      },
      { rootMargin: "250px 0px" },
    );
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (idle) idle(() => nearIo.observe(el), { timeout: 2500 });
      else window.setTimeout(() => nearIo.observe(el), 1200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    const viewIo = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    viewIo.observe(el);
    return () => {
      window.removeEventListener("load", start);
      nearIo.disconnect();
      viewIo.disconnect();
    };
  }, []);

  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && inView && playing) v.play().catch(() => setPlaying(false));
      else {
        v.pause();
        if (i !== active) v.currentTime = 0;
      }
    });
  }, [active, inView, playing]);

  const go = (i: number) => {
    setProgress(0);
    setActive((i + clips.length) % clips.length);
  };
  const current = clips[active];

  return (
    <section
      ref={root}
      id={id}
      className={`xr ${inView ? "xr-in" : ""}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="xr-glow" aria-hidden="true">
        {clips.map((c, i) => (
          <span
            key={c.poster}
            className={i === active ? "is-active" : undefined}
            style={{ backgroundImage: `url(${c.poster.replace(".webp", "-glow.webp")})` }}
          />
        ))}
      </div>

      <div className="xr-inner section-wrap">
        <div className="xr-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`}>{title}</h2>
          {intro && <p className="xr-intro">{intro}</p>}

          <ol className="xr-chapters">
            {clips.map((c, i) => (
              <li key={c.src} className={i === active ? "is-active" : i < active ? "is-done" : undefined}>
                <button type="button" onClick={() => go(i)} aria-current={i === active ? "true" : undefined}>
                  <span className="xr-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="xr-label">{c.label}</span>
                  <span className="xr-rail" aria-hidden="true">
                    <span style={{ transform: `scaleX(${i < active ? 1 : i === active ? progress : 0})` }} />
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="xr-frame">
          <div className="xr-stories" aria-hidden="true">
            {clips.map((c, i) => (
              <span key={c.src}>
                <span style={{ transform: `scaleX(${i < active ? 1 : i === active ? progress : 0})` }} />
              </span>
            ))}
          </div>
          {clips.map((c, i) => (
            <video
              key={c.src}
              ref={(el) => {
                videos.current[i] = el;
              }}
              className={i === active ? "is-active" : undefined}
              src={near && (i === active || i === (active + 1) % clips.length) ? c.src : undefined}
              poster={i === active || near ? c.poster : undefined}
              muted
              playsInline
              preload={i === active ? "auto" : "metadata"}
              aria-label={c.caption}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (i === active && v.duration) setProgress(v.currentTime / v.duration);
              }}
              onEnded={() => i === active && go(active + 1)}
            />
          ))}
          <p className="xr-caption" key={current.src}>
            <strong>{current.label}</strong>
            {current.caption}
          </p>
          <button type="button" className="xr-tap xr-tap-prev" onClick={() => go(active - 1)} aria-label="Previous clip" />
          <button type="button" className="xr-tap xr-tap-next" onClick={() => go(active + 1)} aria-label="Next clip" />
          <button
            type="button"
            className="xr-toggle"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause the reel" : "Play the reel"}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Clip {active + 1} of {clips.length}: {current.label}. {current.caption}
      </p>
    </section>
  );
}
