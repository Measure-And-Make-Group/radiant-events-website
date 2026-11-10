"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./card.module.css";

export function useCopyLink(url: string) {
  const [message, setMessage] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setMessage("");
    setManualCopy(false);
  }

  async function copy() {
    reset();
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
      timer.current = setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Select and copy the card link below.");
      setManualCopy(true);
    }
  }

  return { message, manualCopy, copy, reset };
}

export function CopyFeedback({
  message,
  manualCopy,
  url,
}: {
  message: string;
  manualCopy: boolean;
  url: string;
}) {
  return (
    <>
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
    </>
  );
}
