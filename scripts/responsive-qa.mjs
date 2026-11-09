// Responsive visual QA against a running server (default http://localhost:3000).
// Captures screenshots and flags horizontal overflow, headings hidden under the
// sticky header after anchor jumps, broken or alt-less images, console errors,
// failed requests and layout shift. Automated checks support, but do not
// replace, looking at the screenshots.
//
// Run: npm run build && npm start, then in another shell:
//   node scripts/responsive-qa.mjs [baseUrl] [outDir]
// Requires Playwright (preinstalled in CI images; otherwise `npx playwright`).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright is not installed. Install it or run where it is available.");
  process.exit(2);
}

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const out = process.argv[3] || "qa-screenshots";
const WIDTHS = [320, 375, 390, 430, 768, 1024, 1280, 1440];
const PAGES = ["/", "/services", "/services/signature-installations", "/portfolio",
  "/portfolio/candlelight-and-conversation", "/about", "/contact", "/process",
  "/occasions/milestone-celebrations", "/faq"];
// Homepage sections captured individually.
const SECTIONS = [
  ["opening", ".re-opening"], ["services", ".re-services"], ["work", "#re-work"],
  ["founder", ".re-founder"], ["journey", ".re-journey"], ["faq", ".re-client-faq"],
  ["finale", ".re-finale"],
];

const problems = [];
const flag = (w, page, kind, detail) => problems.push({ width: w, page, kind, detail });

await mkdir(out, { recursive: true });
const browser = await chromium.launch();

for (const width of WIDTHS) {
  const height = width < 760 ? 844 : width < 1100 ? 1024 : 900;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  // Skip the once-per-session brand intro so pages are measured as content.
  await context.addInitScript(() => {
    try { sessionStorage.setItem("radiant-cinematic-intro-2026-v1", "seen"); } catch {}
  });
  for (const route of PAGES) {
    const page = await context.newPage();
    page.on("console", (m) => m.type() === "error" && flag(width, route, "console", m.text().slice(0, 200)));
    page.on("pageerror", (e) => flag(width, route, "pageerror", e.message.slice(0, 200)));
    page.on("requestfailed", (r) => flag(width, route, "requestfailed", r.url()));
    page.on("response", (r) => r.status() >= 400 && flag(width, route, `http ${r.status()}`, r.url()));
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(base + route, { waitUntil: "networkidle" });
    // Scroll through so lazy images load and every reveal runs.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1600);

    const report = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      // Visually hidden on purpose: screen-reader-only text, the spam honeypot.
      const hidden = (el) => !!el.closest(".sr-only, .inquiry-honey, [aria-hidden='true']");
      const clipped = (el) => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          const s = getComputedStyle(p);
          if (/(hidden|clip)/.test(s.overflowX) || /(hidden|clip)/.test(s.overflow)) {
            const r = p.getBoundingClientRect();
            if (r.right <= vw + 1 && r.left >= -1) return true;
          }
        }
        return false;
      };
      const overflowing = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !hidden(el) && !clipped(el);
        })
        .slice(0, 8)
        .map((el) => `${el.tagName}.${String(el.className).slice(0, 60)} "${(el.textContent || "").trim().slice(0, 40)}"`);
      // Text that is wider than its own box (clipped glyphs / words).
      const textClip = [...document.querySelectorAll("h1,h2,h3,.re-cta,.button-primary")]
        .filter((el) => !hidden(el) && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== "visible")
        .map((el) => `${el.tagName} "${el.textContent.trim().slice(0, 40)}"`);
      const images = [...document.images].map((img) => ({
        src: img.currentSrc || img.src,
        broken: img.complete && img.naturalWidth === 0,
        alt: img.hasAttribute("alt"),
      }));
      return {
        scrollWidth: document.documentElement.scrollWidth, vw, overflowing, textClip,
        broken: images.filter((i) => i.broken).map((i) => i.src),
        noAlt: images.filter((i) => !i.alt).map((i) => i.src),
        cls: window.__cls,
      };
    });
    if (report.scrollWidth > report.vw + 1) flag(width, route, "page-overflow", `${report.scrollWidth} > ${report.vw}`);
    report.overflowing.forEach((o) => flag(width, route, "element-overflow", o));
    report.textClip.forEach((o) => flag(width, route, "text-clip", o));
    report.broken.forEach((o) => flag(width, route, "broken-image", o));
    report.noAlt.forEach((o) => flag(width, route, "missing-alt", o));
    if (report.cls > 0.1) flag(width, route, "cls", report.cls.toFixed(3));

    // Anchor targets: the heading must sit below the sticky header.
    const anchors = await page.evaluate(() =>
      [...document.querySelectorAll('main a[href^="#"]')].map((a) => a.getAttribute("href")).filter((h) => h.length > 1));
    for (const hash of [...new Set(anchors)]) {
      // Follow the link the way a visitor would, but without smooth-scroll timing.
      await page.evaluate((h) => {
        document.documentElement.style.scrollBehavior = "auto";
        document.querySelector(`main a[href="${h}"]`)?.click();
      }, hash);
      await page.waitForTimeout(400);
      const r = await page.evaluate((h) => {
        const header = document.querySelector(".site-header")?.getBoundingClientRect();
        const target = document.querySelector(h);
        const heading = target?.querySelector("h1,h2") || target;
        return { headerBottom: header?.bottom ?? 0, top: heading?.getBoundingClientRect().top ?? 0 };
      }, hash);
      if (r.top < r.headerBottom - 1) flag(width, route, "under-header", `${hash}: heading top ${Math.round(r.top)} < header ${Math.round(r.headerBottom)}`);
    }

    const name = route === "/" ? "home" : route.slice(1).replace(/\//g, "_");
    await page.evaluate(() => window.scrollTo(0, 0));
    if (route === "/") {
      for (const [label, selector] of SECTIONS) {
        const el = page.locator(selector).first();
        if (await el.count()) {
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(900);
          await el.screenshot({ path: path.join(out, `${width}-home-${label}.png`) }).catch(() => {});
        }
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(out, `${width}-home-viewport.png`) });
    } else {
      await page.screenshot({ path: path.join(out, `${width}-${name}.png`), fullPage: width <= 430 });
    }
    await page.close();
  }
  await context.close();
}
await browser.close();

await writeFile(path.join(out, "report.json"), JSON.stringify(problems, null, 2));
const byKind = problems.reduce((m, p) => ((m[p.kind] = (m[p.kind] || 0) + 1), m), {});
console.log(`Checked ${PAGES.length} pages at ${WIDTHS.length} widths.`);
console.log(problems.length ? byKind : "No problems flagged.");
for (const p of problems.slice(0, 60)) console.log(`${p.width}px ${p.page} ${p.kind}: ${p.detail}`);
process.exit(problems.length ? 1 : 0);
