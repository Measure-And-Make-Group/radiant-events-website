import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";
export const alt = "Radiant Events Planning olive botanical logo";

// The icon is generated from the official, self-hosted brand art at build time.
// The central crop keeps the botanical mark legible at small favicon sizes.
export default async function Icon() {
  const logo = await readFile(path.join(process.cwd(), "public/brand/radiant-olive-logo.webp"));
  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", overflow: "hidden", background: "#7b7e53" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo as unknown as string}
          alt=""
          width={384}
          height={384}
          style={{ position: "absolute", width: 384, height: 384, left: -96, top: -96 }}
        />
      </div>
    ),
    { ...size }
  );
}
