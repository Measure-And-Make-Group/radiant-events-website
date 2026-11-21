"use client";
import styles from "./card.module.css";
import ArrowIcon from "@/components/ArrowIcon";
import { CARD_TITLE, SHARE_TEXT, SHARE_URL } from "./card-links";
import { CopyFeedback, useCopyLink } from "./CopyFeedback";
import { QRDialog } from "./QRDialog";

export function CardActions() {
  const feedback = useCopyLink(SHARE_URL);
  async function share() {
    feedback.reset();
    if (navigator.share) {
      try {
        await navigator.share({
          title: CARD_TITLE,
          text: SHARE_TEXT,
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
