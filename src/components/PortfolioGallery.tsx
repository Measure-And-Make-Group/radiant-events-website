"use client";

import ArrowIcon from "@/components/ArrowIcon";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { EVENT_TYPES, albums, photoCount, type Album, type AlbumPhoto } from "@/content/portfolio";

// Only show a filter when at least one photo belongs to it.
const FILTERS = ["All", ...EVENT_TYPES.filter((t) => albums.some((a) => a.photos.some((p) => p.eventType === t)))];
const MOSAIC_MAX = 5;

type Viewing = { album: Album; photos: AlbumPhoto[]; index: number };

/**
 * Portfolio as a set of albums, one per event: a bento mosaic on larger
 * screens and a swipeable strip on phones. Any photo opens a full-screen
 * viewer that pages through that album (arrows, swipe, Escape).
 */
export default function PortfolioGallery() {
  const [filter, setFilter] = useState<string>("All");
  const [viewing, setViewing] = useState<Viewing | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);

  const visible = albums
    .map((a) => ({ album: a, photos: a.photos.filter((p) => filter === "All" || p.eventType === filter) }))
    .filter((v) => v.photos.length > 0);
  const shown = visible.reduce((n, v) => n + v.photos.length, 0);

  const step = useCallback(
    (dir: 1 | -1) =>
      setViewing((v) => (v ? { ...v, index: (v.index + dir + v.photos.length) % v.photos.length } : v)),
    [],
  );
  const close = useCallback(() => dialogRef.current?.close(), []);
  const open = (album: Album, photos: AlbumPhoto[], index: number, el: HTMLElement) => {
    opener.current = el;
    setViewing({ album, photos, index });
  };

  useEffect(() => {
    const d = dialogRef.current;
    if (d && viewing && !d.open) d.showModal();
  }, [viewing]);

  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [viewing, step]);

  const current = viewing ? viewing.photos[viewing.index] : null;

  return (
    <>
      <div className="pa-bar">
        <div className="section-wrap pa-bar-inner">
          <p className="pa-count">
            <strong>{photoCount}</strong> photos · <strong>{albums.length}</strong> collections
          </p>
          <div className="portfolio-filters" role="group" aria-label="Filter the portfolio by event type">
            {FILTERS.map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {shown} photo{shown === 1 ? "" : "s"} in {visible.length} collection{visible.length === 1 ? "" : "s"}
      </p>

      <div className="pa-list">
        {visible.map(({ album, photos }, ai) => {
          const tiles = photos.slice(0, MOSAIC_MAX);
          const extra = photos.length - tiles.length;
          return (
            <article key={album.id} className="section-wrap pa" aria-labelledby={`pa-${album.id}`}>
              <header className="pa-head">
                <span className="pa-num" aria-hidden="true">{String(ai + 1).padStart(2, "0")}</span>
                <div className="pa-meta">
                  <p className="eyebrow">{album.occasion}</p>
                  <h2 id={`pa-${album.id}`}>{album.title}</h2>
                  <p>{album.blurb}</p>
                </div>
                <div className="pa-actions">
                  <span>{photos.length} photo{photos.length === 1 ? "" : "s"}</span>
                  {album.href && (
                    <Link href={album.href} className="text-link">
                      The story <ArrowIcon />
                    </Link>
                  )}
                </div>
              </header>

              <ul className={`pa-grid pa-n${Math.min(tiles.length, MOSAIC_MAX)}`} data-reveal="stagger">
                {tiles.map((p, i) => (
                  <li key={p.src} className={i === 0 ? "pa-lead" : undefined}>
                    <button
                      type="button"
                      className="pa-tile"
                      aria-label={
                        i === tiles.length - 1 && extra > 0
                          ? `+${extra} more: view all ${photos.length} photos, starting with ${p.alt}`
                          : `View larger: ${p.alt}`
                      }
                      onClick={(e) => open(album, photos, i, e.currentTarget)}
                    >
                      <Image
                        src={p.src}
                        alt={p.alt}
                        fill
                        sizes={i === 0 ? "(max-width: 760px) 80vw, 50vw" : "(max-width: 760px) 80vw, 25vw"}
                      />
                      {i === tiles.length - 1 && extra > 0 && (
                        <span className="pa-more" aria-hidden="true">+{extra} more</span>
                      )}
                    </button>
                  </li>
                ))}
                {/* On phones the strip shows every photo; extras only appear there. */}
                {photos.slice(MOSAIC_MAX).map((p, j) => (
                  <li key={p.src} className="pa-extra">
                    <button
                      type="button"
                      className="pa-tile"
                      aria-label={`View larger: ${p.alt}`}
                      onClick={(e) => open(album, photos, MOSAIC_MAX + j, e.currentTarget)}
                    >
                      <Image src={p.src} alt={p.alt} fill sizes="80vw" />
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        className="pg-viewer"
        aria-label="Photo viewer"
        onClose={() => {
          setViewing(null);
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
        {viewing && current && (
          <>
            <figure className="pg-viewer-figure">
              <div className="pg-viewer-photo">
                <Image key={current.src} src={current.src} alt={current.alt} fill sizes="(max-width: 760px) 100vw, 1200px" />
              </div>
              <figcaption>
                <span>
                  <small>{viewing.album.occasion}</small>
                  {viewing.album.title}
                </span>
                <span className="pg-viewer-count">
                  {viewing.index + 1} / {viewing.photos.length}
                </span>
                {viewing.album.href && (
                  <Link href={viewing.album.href} className="text-link">
                    See the project <ArrowIcon />
                  </Link>
                )}
              </figcaption>
            </figure>
            {viewing.photos.length > 1 && (
              <>
                <button type="button" className="pg-viewer-btn pg-prev" onClick={() => step(-1)} aria-label="Previous photo">
                  <ArrowIcon direction="left" />
                </button>
                <button type="button" className="pg-viewer-btn pg-next" onClick={() => step(1)} aria-label="Next photo">
                  <ArrowIcon direction="right" />
                </button>
              </>
            )}
            <button type="button" className="pg-viewer-close" onClick={close} aria-label="Close photo viewer" autoFocus>
              ×
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
