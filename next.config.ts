import type { NextConfig } from "next";

/**
 * Security headers for every response.
 *
 * The site loads nothing from third parties in the browser (fonts, images and
 * video are self-hosted; email is sent server-side), so the Content Security
 * Policy can be strict about origins. 'unsafe-inline' stays for scripts and
 * styles because statically rendered pages carry Next.js's inline bootstrap,
 * the first-paint intro guard and JSON-LD, which a per-request nonce would
 * force into dynamic rendering. Everything else is locked to this origin.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/connect/rickya/Rickya-Fandino.vcf",
        headers: [
          { key: "Content-Type", value: "text/vcard; charset=utf-8" },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Rickya-Fandino.vcf"',
          },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/rickya",
        destination:
          "/connect/rickya?utm_source=short_link&utm_medium=direct&utm_campaign=rickya_card",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
