"use client";
import { useEffect, useState } from "react";

const KEY = "rep_cookie_choices_v1";
type Choice = { necessary: true; analytics: boolean; marketing: boolean; updatedAt: string };
function readChoice(): Choice | null {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    if (data && data.necessary === true && typeof data.analytics === "boolean" && typeof data.marketing === "boolean") return data;
  } catch { /* storage may be blocked */ }
  return null;
}
export default function CookieConsent() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  useEffect(() => {
    const saved = readChoice();
    setChoice(saved);
    setAnalytics(saved?.analytics ?? false);
    setMarketing(saved?.marketing ?? false);
    setReady(true);
    const manage = () => { const previous = readChoice(); setAnalytics(previous?.analytics ?? false); setMarketing(previous?.marketing ?? false); setDetails(true); setOpen(true); };
    window.addEventListener("rep:cookie-settings", manage);
    return () => window.removeEventListener("rep:cookie-settings", manage);
  }, []);
  function save(a: boolean, m: boolean) {
    const next: Choice = { necessary: true, analytics: a, marketing: m, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* keep current session preference */ }
    setChoice(next);
    setAnalytics(a); setMarketing(m); setOpen(false);
    window.dispatchEvent(new CustomEvent("rep:consent-updated", { detail: next }));
  }
  if (!ready || (choice && !open)) return null;
  return (
    <section aria-label="Privacy and cookie choices" role="region" className="fixed bottom-0 inset-x-0 z-[1000] border-t border-[#929779] bg-[#f8f6ef] text-[#282d22] shadow-[0_-12px_40px_rgba(0,0,0,.18)]" style={{maxHeight:"90dvh",overflowY:"auto"}}>
      <div className="mx-auto max-w-5xl px-5 py-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl">Your privacy, your choice.</h2>
            <p className="mt-2 text-sm leading-6">We use essential site technologies for security, site operation and admin sign-in. Optional analytics and marketing tracking are off unless you choose to allow them. We do not currently load third-party analytics or advertising pixels. You can change your choices at any time.</p>
            <a className="mt-2 inline-block text-sm underline underline-offset-4" href="/privacy">Read our privacy &amp; cookie notice</a>
          </div>
          <div className="flex flex-wrap gap-2 sm:max-w-[360px]">
            <button type="button" onClick={() => save(false,false)} className="rounded-sm border border-[#414b31] px-4 py-3 text-sm font-semibold">Reject optional</button>
            <button type="button" onClick={() => {setDetails(true);setOpen(true);}} className="rounded-sm border border-[#414b31] px-4 py-3 text-sm font-semibold">Customize</button>
            <button type="button" onClick={() => save(true,true)} className="rounded-sm bg-[#414b31] px-4 py-3 text-sm font-semibold text-white">Allow optional</button>
          </div>
        </div>
        {details && (
          <div className="mt-4 border-t border-[#b9bea8] pt-4">
            <p className="mb-3 text-sm">Optional categories are disabled by default. No optional tracking integrations are currently installed.</p>
            <div className="flex flex-col gap-3 text-sm">
              <div><strong>Essential</strong> — always active. Required for security and authenticated admin sessions.</div>
              <label className="flex gap-3 items-start"><input className="mt-1 h-4 w-4" type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /> <span><strong>Analytics</strong> — optional usage measurement, only if introduced later with consent-aware loading.</span></label>
              <label className="flex gap-3 items-start"><input className="mt-1 h-4 w-4" type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} /> <span><strong>Marketing</strong> — optional advertising tracking, only if introduced later with consent-aware loading.</span></label>
            </div>
            <button type="button" onClick={() => save(analytics,marketing)} className="mt-4 rounded-sm bg-[#414b31] px-5 py-3 text-sm font-semibold text-white">Save my choices</button>
          </div>
        )}
      </div>
    </section>
  );
}
