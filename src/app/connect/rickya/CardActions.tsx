"use client";
import { useState } from "react";
import styles from "./card.module.css";
import ArrowIcon from "@/components/ArrowIcon";

const url = "https://www.radianteventsplanning.com/connect/rickya";

export function CardActions() {
  const [message, setMessage] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  async function share() {
    setMessage("");
    setManualCopy(false);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rickya Fandino | Radiant Events Planning",
          text: "Let's connect.",
          url,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Card link copied.");
    } catch {
      setMessage("Select and copy the card link below.");
      setManualCopy(true);
    }
  }
  return (
    <div className={styles.shareActions}>
      <button type="button" onClick={share}>
        Share card <ArrowIcon />
      </button>
      <span role="status" aria-live="polite" className={styles.shareStatus}>
        {message}
      </span>
      {manualCopy && (
        <input
          className={styles.copyLink}
          aria-label="Card link to copy"
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
          onClick={(event) => event.currentTarget.select()}
        />
      )}
    </div>
  );
}
