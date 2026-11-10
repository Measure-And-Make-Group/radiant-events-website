"use client";
import { useState } from "react";

const url = "https://www.radianteventsplanning.com/connect/rickya";

export function CardActions() {
  const [message, setMessage] = useState("");
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Rickya Fandino | Radiant Events Planning", text: "Let's connect.", url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Card link copied.");
    } catch {
      setMessage("Copy this link: " + url);
    }
  }
  return (
    <div>
      <button type="button" onClick={share}>Share card ↗</button>
      <span role="status" aria-live="polite" style={{ display: "block", fontSize: 11 }}>{message}</span>
    </div>
  );
}
