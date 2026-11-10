import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inquiry inbox",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-6 py-16">{children}</div>;
}
