import ArrowIcon from "@/components/ArrowIcon";
import Image from "next/image";
import Link from "next/link";

export default function HomeHero() {
  return (
    <section className="radiant-hero" aria-labelledby="radiant-hero-title">
      <div className="radiant-hero-copy">
        <p className="eyebrow">Atlanta, Georgia · Event planning, design &amp; decor</p>
        <h1 id="radiant-hero-title">
          Be in the moment.
          <em>We'll make it beautiful.</em>
        </h1>
        <p className="radiant-hero-description">
          From intimate celebrations to unforgettable statement moments,
          Radiant brings your vision to life through thoughtful planning,
          considered design, and details that feel like you.
        </p>
        <div className="radiant-hero-actions">
          <Link href="/contact" className="button-primary">
            Begin your event <ArrowIcon />
          </Link>
          <Link href="#the-collection" className="radiant-hero-secondary">
            Explore our work <ArrowIcon />
          </Link>
        </div>
        <p className="radiant-hero-signature">Planning with purpose. Serving with grace.</p>
      </div>
      <div className="radiant-hero-gallery" aria-label="Real event installations by Radiant Events Planning">
        <div className="radiant-hero-photo radiant-hero-photo-primary">
          <Image
            src="/images/pink-arch.webp"
            alt="Radiant Events pink balloon installation surrounding a gold circular backdrop"
            fill
            priority
            sizes="(max-width: 800px) 90vw, 47vw"
            className="radiant-hero-img"
          />
        </div>
        <div className="radiant-hero-photo radiant-hero-photo-accent">
          <Image
            src="/images/colorful-backdrop.webp"
            alt="Colorful balloon installation with a purple sequin backdrop"
            fill
            sizes="(max-width: 800px) 42vw, 18vw"
            className="radiant-hero-img"
          />
        </div>
        <span className="radiant-gallery-caption">Beautiful details. Meaningful moments.</span>
      </div>
      <a className="radiant-hero-scroll" href="#the-collection">
        Discover our collection <ArrowIcon direction="down" />
      </a>
    </section>
  );
}
