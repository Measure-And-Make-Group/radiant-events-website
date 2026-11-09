import ArrowIcon from "@/components/ArrowIcon";
import Link from "next/link";
import PageHero from "@/components/sections/PageHero";
import PortfolioGallery from "@/components/PortfolioGallery";

export default function PortfolioPage() {
  return (
    <div>
      <PageHero
        eyebrow="Portfolio"
        title={<>Real rooms. <em>Real celebrations.</em></>}
        subtitle="Bridal and baby showers, sweet sixteens and milestone birthdays, a book launch, ministry backdrops and candlelit banquet halls. Every photo here is real REP work across Atlanta and North Atlanta."
      />
      <PortfolioGallery />
      <section className="closing-cta">
        <p className="eyebrow">Your occasion, your way</p>
        <h2>
          What will your <em>moment look like?</em>
        </h2>
        <p>Tell us what you&apos;re celebrating, and we&apos;ll shape something personal.</p>
        <Link href="/contact" className="button-light">
          Start your event inquiry <ArrowIcon />
        </Link>
      </section>
    </div>
  );
}
