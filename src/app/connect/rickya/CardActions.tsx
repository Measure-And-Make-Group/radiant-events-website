"use client";
import styles from "./card.module.css";
import ArrowIcon from "@/components/ArrowIcon";
import { SHARE_URL } from "./card-links";
import { CopyFeedback, useCopyLink } from "./CopyFeedback";
import { QRDialog } from "./QRDialog";

export function CardActions() {
  const feedback = useCopyLink(SHARE_URL);
  async function share() {
    feedback.reset();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rickya Fandino | Radiant Events Planning",
          text: "Here's Rickya's card — Radiant Events Planning in Atlanta.",
          url: SHARE_URL,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    await feedback.copy();
  }
  return (
    <div className={styles.shareActions}>
      <div className={styles.topButtons}>
        <button type="button" onClick={share}>
          Share card <ArrowIcon />
        </button>
        <QRDialog />
      </div>
      <CopyFeedback {...feedback} url={SHARE_URL} />
    </div>
  );
}
