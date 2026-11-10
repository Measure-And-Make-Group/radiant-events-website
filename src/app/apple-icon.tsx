import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const alt = "Radiant Events Planning";

export default async function AppleIcon() {
  const logo = await readFile(path.join(process.cwd(), "public/brand/radiant-olive-logo.webp"));
  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", overflow: "hidden", background: "#7b7e53" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/webp;base64,${logo.toString("base64")}`}
          alt=""
          width={360}
          height={360}
          style={{ position: "absolute", width: 360, height: 360, left: -90, top: -90 }}
        />
      </div>
    ),
    { ...size }
  );
}
