"use client";

import ArrowIcon from "@/components/ArrowIcon";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PHOTO_SIZES } from "@/content/photo-sizes";
import {
  EVENT_TYPES,
  galleryPhotos,
  portfolioProjects,
  type GalleryPhoto,
} from "@/content/portfolio";

// Only show a filter when at least one project belongs to it.
const FILTERS = ["All", ...EVENT_TYPES.filter((t) => portfolioProjects.some((p) => p.eventType === t))];

/**
 * Portfolio gallery: every published photo in a masonry wall, filterable by
 * event type, opening into a full-screen viewer (arrows, swipe, Escape).
 * The project cards below follow the same filter.
 */
export default function PortfolioGallery() {
  const [filter, setFilter] = useState<string>("All");
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);

  const photos = galleryPhotos.filter((p) => filter === "All" || p.eventType === filter);
  const projects = portfolioProjects.filter((p) => filter === "All" || p.eventType === filter);
  const current: GalleryPhoto | null = open === null ? null : photos[open] ?? null;

  const step = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + photos.length) % photos.length)),
    [photos.length],
  );
  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
  }, [open]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <>
      <section className="section-wrap pg-wrap" aria-labelledby="pg-title">
        <div className="pg-head">
          <div>
            <p className="eyebrow">The gallery</p>
            <h2 id="pg-title">
              Every detail, <em>up close.</em>
            </h2>
          </div>
          <p>
            {galleryPhotos.length} photographs from {portfolioProjects.length} real REP
            events. Tap any photo to see it full size.
          </p>
        </div>

        <div className="portfolio-filters" role="group" aria-label="Filter the gallery by event type">
          {FILTERS.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          Showing {photos.length} photo{photos.length === 1 ? "" : "s"}
        </p>

        <ul className="pg-grid">
          {photos.map((p, i) => {
            const [w, h] = PHOTO_SIZES[p.src] ?? [1200, 1500];
            return (
              <li key={p.src} className="pg-item">
                <button
                  type="button"
                  className="pg-tile"
                  aria-label={`View larger: ${p.alt}`}
                  onClick={(e) => {
                    opener.current = e.currentTarget;
                    setOpen(i);
                  }}
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={w}
                    height={h}
                    sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
                  />
                  <span className="pg-tag" aria-hidden="true">
                    <small>{p.occasion}</small>
                    {p.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section-wrap pg-stories" aria-labelledby="pg-stories-title">
        <div className="pg-head">
          <div>
            <p className="eyebrow">Project stories</p>
            <h2 id="pg-stories-title">
              The thinking <em>behind the work.</em>
            </h2>
          </div>
        </div>
        <div className="portfolio-grid">
          {projects.map((p) => (
            <Link key={p.slug} href={"/portfolio/" + p.slug} className="work-card">
              <div className="work-image">
                <Image src={p.image} alt={p.alt} fill sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw" />
              </div>
              <div className="work-caption">
                <div>
                  <span className="eyebrow">{p.occasion ?? p.category}</span>
                  <h3>{p.title}</h3>
                </div>
                <ArrowIcon />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <dialog
        ref={dialogRef}
        className="pg-viewer"
        aria-label="Photo viewer"
        onClose={() => {
          setOpen(null);
          opener.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {current && (
          <>
            <figure className="pg-viewer-figure">
              <div className="pg-viewer-photo">
                <Image key={current.src} src={current.src} alt={current.alt} fill sizes="(max-width: 760px) 100vw, 1200px" />
              </div>
              <figcaption>
                <span>
                  <small>{current.occasion}</small>
                  {current.title}
                </span>
                <span className="pg-viewer-count">
                  {(open ?? 0) + 1} / {photos.length}
                </span>
                <Link href={"/portfolio/" + current.slug} className="text-link">
                  See the project <ArrowIcon />
                </Link>
              </figcaption>
            </figure>
            <button type="button" className="pg-viewer-btn pg-prev" onClick={() => step(-1)} aria-label="Previous photo">
              <ArrowIcon direction="left" />
            </button>
            <button type="button" className="pg-viewer-btn pg-next" onClick={() => step(1)} aria-label="Next photo">
              <ArrowIcon direction="right" />
            </button>
            <button type="button" className="pg-viewer-close" onClick={close} aria-label="Close photo viewer" autoFocus>
              ×
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
