import Image from "next/image";
import type { ReactNode } from "react";

type HeroImage = { src: string; alt: string; caption?: string; position?: string };

/**
 * Interior page hero. Without `image` it is the editorial text hero; with
 * `image` it becomes a split layout led by real Radiant photography.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  image?: HeroImage;
  actions?: ReactNode;
  /** @deprecated kept for older call sites; ignored. */
  mediaIndex?: number;
}) {
  if (image) {
    return (
      <section className="rs-hero">
        <div className="rs-hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
          {actions}
        </div>
        <figure className="rs-hero-media" style={{ margin: 0 }}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(max-width: 860px) 100vw, 48vw"
            style={image.position ? { objectPosition: image.position } : undefined}
          />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      </section>
    );
  }
  return (
    <section className="page-hero">
      <div className="section-wrap">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {actions}
      </div>
    </section>
  );
}
