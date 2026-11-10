"use client";

import { useEffect, useState } from "react";
import { CARD_URL } from "./card-links";
import { CopyFeedback, useCopyLink } from "./CopyFeedback";
import styles from "./card.module.css";

const IN_APP_BROWSER =
  /Instagram|FBAN|FBAV|FB_IAB|Line\/|musical_ly|BytedanceWebview|LinkedInApp|Snapchat/i;

export function InAppBrowserNote() {
  const [inApp, setInApp] = useState(false);
  const feedback = useCopyLink(CARD_URL);

  useEffect(() => {
    // Browser-only guidance is hydrated after mount so the first render matches SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInApp(IN_APP_BROWSER.test(navigator.userAgent));
  }, []);

  if (!inApp) return null;
  return (
    <aside className={styles.inAppNote} aria-label="Open in your browser">
      <p>
        Opening this from Instagram? Tap ••• and choose{" "}
        <strong>Open in browser</strong>, then tap Save — it works much better
        there.
      </p>
      <button type="button" onClick={feedback.copy}>
        Copy link
      </button>
      <div className={styles.noteFeedback}>
        <CopyFeedback {...feedback} url={CARD_URL} />
      </div>
    </aside>
  );
}
