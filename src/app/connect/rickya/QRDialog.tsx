"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { QR_IMAGE } from "./card-links";
import styles from "./card.module.css";

export function QRDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const previousOverflow = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (previousOverflow.current !== null)
        document.body.style.overflow = previousOverflow.current;
    },
    [],
  );

  function show() {
    if (!dialog.current || dialog.current.open) return;
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Native modal dialogs trap focus and make the rest of the page inert.
    dialog.current.showModal();
    closeButton.current?.focus();
  }

  function afterClose() {
    if (previousOverflow.current !== null)
      document.body.style.overflow = previousOverflow.current;
    previousOverflow.current = null;
    trigger.current?.focus();
  }

  return (
    <>
      <button type="button" ref={trigger} onClick={show}>
        Show my QR
      </button>
      <dialog
        ref={dialog}
        className={styles.qrDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rickya-qr-title"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const items = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((element) => element.getClientRects().length > 0);
          const first = items[0];
          const last = items[items.length - 1];
          if (!first || !last) return;
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        onClose={afterClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className={styles.qrDialogContent}>
          <Image
            src="/brand/radiant-olive-logo.webp"
            width={56}
            height={56}
            alt="Radiant Events Planning olive logo"
          />
          <h2 id="rickya-qr-title">Rickya Fandino · Radiant Events Planning</h2>
          <Image
            src={QR_IMAGE}
            width={1200}
            height={1200}
            unoptimized
            className={styles.modalQR}
            alt="Scan to open Rickya’s digital business card"
          />
          <button
            ref={closeButton}
            type="button"
            className={styles.qrClose}
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
