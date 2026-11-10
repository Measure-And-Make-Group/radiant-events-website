// End-to-end card checks. Uses QA-only tools, following responsive-qa.mjs:
// Playwright, @axe-core/playwright, pngjs and @zxing/library must be available.
// node scripts/test-rickya-sharing.mjs <base URL> <artifact directory> <stage>
// Set CHROME_PATH for a system browser. PREVIEW_ACCESS_FILE may point to a
// private JSON {url} for Vercel preview access; it is never saved in artifacts.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");
const { AxeBuilder } = require("@axe-core/playwright");
const { PNG } = require("pngjs");
const {
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
  QRCodeReader,
  ResultMetadataType,
} = require("@zxing/library");

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const out = process.argv[3] || "/tmp/rickya-sharing-qa";
const stage = process.argv[4] || "local";
const canonical = "https://www.radianteventsplanning.com/connect/rickya";
const shareUrl =
  canonical + "?utm_source=share&utm_medium=web_share&utm_campaign=rickya_card";
const qrUrl =
  canonical + "?utm_source=qr&utm_medium=qr&utm_campaign=rickya_card";
const title = "Rickya Fandino | Radiant Events Planning";
const shareText = "Here's Rickya's card — Radiant Events Planning in Atlanta.";
const referral =
  "Hey! Here's Rickya's card from Radiant Events Planning — she's amazing to work with: " +
  canonical +
  "?utm_source=sms_referral&utm_medium=sms&utm_campaign=rickya_card";
const results = [],
  errors = [];
const hash = (data) => createHash("sha256").update(data).digest("hex");
fs.mkdirSync(out, { recursive: true });
const save = (name, value) =>
  fs.writeFileSync(
    path.join(out, stage + "-" + name),
    typeof value === "string" || Buffer.isBuffer(value)
      ? value
      : JSON.stringify(value, null, 2),
  );
async function check(name, fn) {
  if (process.env.QA_ONLY && !new RegExp(process.env.QA_ONLY).test(name))
    return;
  try {
    await fn();
    results.push({ name, status: "PASS" });
    console.log("PASS", name);
  } catch (error) {
    results.push({ name, status: "FAIL", error: error.message });
    console.log("FAIL", name, error.message);
  }
}
function qrDecode(bytes) {
  const png = PNG.sync.read(bytes),
    gray = new Uint8ClampedArray(png.width * png.height);
  for (let i = 0; i < gray.length; i++)
    gray[i] = (png.data[i * 4] + png.data[i * 4 + 1] + png.data[i * 4 + 2]) / 3;
  const result = new QRCodeReader().decode(
    new BinaryBitmap(
      new HybridBinarizer(new RGBLuminanceSource(gray, png.width, png.height)),
    ),
  );
  return {
    url: result.getText(),
    level: result
      .getResultMetadata()
      .get(ResultMetadataType.ERROR_CORRECTION_LEVEL),
  };
}
function contact(bytes) {
  const raw = bytes.toString("utf8"),
    unfolded = raw.replace(/\r\n[ \t]/g, "");
  assert.ok(!/(?<!\r)\n/.test(raw), "CRLF line endings");
  assert.ok(
    raw.split("\r\n").every((line) => Buffer.byteLength(line) <= 75),
    "75-octet folding",
  );
  for (const line of [
    "VERSION:3.0",
    "N:Fandino;Rickya;;;",
    "FN:Rickya Fandino",
    "ORG:Radiant Events Planning",
    "TITLE:Founder",
    "EMAIL;TYPE=INTERNET,WORK:bookings@radianteventsplanning.com",
    "TEL;TYPE=CELL,VOICE:+19147332756",
    "ADR;TYPE=WORK:;;;Atlanta;GA;;USA",
    "item1.URL:https://www.radianteventsplanning.com/",
    "item1.X-ABLabel:Website",
    "item2.URL:" + canonical,
    "item2.X-ABLabel:Digital card",
    "item3.URL:https://www.instagram.com/radianteventsplanning",
    "item3.X-ABLabel:Instagram",
    "X-SOCIALPROFILE;TYPE=instagram:https://www.instagram.com/radianteventsplanning",
    "NOTE:Event planning\\, coordination\\, styling\\, and signature installations in Atlanta and North Atlanta.",
  ])
    assert.ok(unfolded.split("\r\n").includes(line), line);
  const block = raw.slice(raw.indexOf("PHOTO;"), raw.indexOf("END:VCARD"));
  assert.equal(
    hash(Buffer.from(block)),
    "06f79c84c0d7b98f77afe7b3223269f97227646b6b9ca8c39b94f7272c8a1ae8",
    "PHOTO block unchanged",
  );
  const photo = unfolded
    .split("\r\n")
    .find((line) => line.startsWith("PHOTO;ENCODING=b;TYPE=JPEG:"))
    .split(":")[1];
  assert.equal(
    hash(Buffer.from(photo, "base64")),
    "84f5648e71a44616c06db50eb22c1b7ef90a5ce6f3e17cc8bf7c91d287984986",
  );
  return photo;
}

function watch(p) {
  p.on("pageerror", (error) =>
    errors.push({ type: "pageerror", message: error.message }),
  );
  p.on("console", (message) => {
    if (message.type() === "error")
      errors.push({
        type: "console",
        message: message.text(),
        location: message.location(),
      });
  });
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
    ...(base.startsWith("https:") && process.env.HTTPS_PROXY
      ? { proxy: { server: process.env.HTTPS_PROXY } }
      : {}),
  });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    acceptDownloads: true,
  });
  if (process.env.PREVIEW_ACCESS_FILE) {
    const auth = await ctx.newPage();
    await auth.goto(
      JSON.parse(fs.readFileSync(process.env.PREVIEW_ACCESS_FILE)).url,
    );
    await auth.close();
  }
  const page = await ctx.newPage();
  watch(page);
  await page.goto(base + "/connect/rickya");
  await page.locator("article h1").waitFor();
  await page.evaluate(() => document.fonts.ready);

  await check(
    "Title, canonical and existing branded Open Graph preview",
    async () => {
      assert.equal(await page.title(), title);
      assert.equal(
        await page.locator('meta[property="og:title"]').getAttribute("content"),
        title,
      );
      assert.equal(
        await page
          .locator('meta[name="twitter:title"]')
          .getAttribute("content"),
        title,
      );
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute("href"),
        canonical,
      );
      assert.equal(
        await page.locator('meta[property="og:image"]').getAttribute("content"),
        canonical + "/rickya-share-preview-v1.png",
      );
      const image = await ctx.request.get(
        base + "/connect/rickya/rickya-share-preview-v1.png",
      );
      assert.equal(image.status(), 200);
      const bytes = await image.body();
      assert.equal(
        hash(bytes),
        "a61fa0cbd692f4d0fc738756b2793740254be4b74646742ca2757b5b0910bcd2",
      );
      save("og-preview.png", bytes);
      for (const agent of [
        "Applebot/0.1",
        "facebookexternalhit/1.1",
        "Twitterbot/1.0",
        "WhatsApp/2.24.11",
      ]) {
        const r = await ctx.request.get(base + "/connect/rickya", {
          headers: { "user-agent": agent },
        });
        assert.equal(r.status(), 200);
        const html = await r.text();
        assert.ok(
          html
            .slice(0, html.indexOf("</head>"))
            .includes("rickya-share-preview-v1.png"),
          agent,
        );
      }
    },
  );
  await check(
    "vCard GET/HEAD headers, fields, folding and unchanged embedded portrait",
    async () => {
      for (const method of ["get", "head"]) {
        const r = await ctx.request[method](
          base + "/connect/rickya/Rickya-Fandino.vcf",
        );
        assert.equal(r.status(), 200);
        const h = r.headers();
        assert.equal(h["content-type"], "text/vcard; charset=utf-8");
        assert.equal(
          h["content-disposition"],
          'attachment; filename="Rickya-Fandino.vcf"',
        );
        assert.equal(h["cache-control"], "public, max-age=3600");
        if (method === "get") {
          const bytes = await r.body();
          const photo = contact(bytes);
          save("Rickya-Fandino.vcf", bytes);
          const dimensions = await page.evaluate(async (value) => {
            const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
            const image = await createImageBitmap(
              new Blob([bytes], { type: "image/jpeg" }),
            );
            const size = [image.width, image.height];
            image.close();
            return size;
          }, photo);
          assert.deepEqual(dimensions, [240, 240]);
        }
      }
    },
  );
  await check(
    "Permanent short link returns 308 with requested UTM parameters",
    async () => {
      const r = await ctx.request.get(base + "/rickya", { maxRedirects: 0 });
      assert.equal(r.status(), 308);
      const target = new URL(r.headers().location, base);
      assert.equal(
        target.pathname + target.search,
        "/connect/rickya?utm_source=short_link&utm_medium=direct&utm_campaign=rickya_card",
      );
    },
  );
  await check(
    "New QR is large, black-on-white, error correction M+, quiet zone and tracked URL; old QR retained",
    async () => {
      const r = await ctx.request.get(
        base + "/connect/rickya/rickya-qr-v2.png",
      );
      assert.equal(r.status(), 200);
      const bytes = await r.body(),
        png = PNG.sync.read(bytes);
      assert.ok(png.width >= 1024);
      assert.equal(png.width, png.height);
      let minX = png.width,
        minY = png.height,
        maxX = 0,
        maxY = 0;
      for (let y = 0; y < png.height; y++)
        for (let x = 0; x < png.width; x++) {
          const i = (y * png.width + x) * 4;
          assert.equal(png.data[i + 3], 255);
          assert.ok(png.data[i] === 0 || png.data[i] === 255);
          assert.equal(png.data[i], png.data[i + 1]);
          assert.equal(png.data[i], png.data[i + 2]);
          if (png.data[i] === 0) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      const quiet = Math.floor(png.width / 49) * 4;
      assert.ok(
        Math.min(minX, minY, png.width - 1 - maxX, png.height - 1 - maxY) >=
          quiet,
      );
      const decoded = qrDecode(bytes);
      assert.equal(decoded.url, qrUrl);
      assert.match(decoded.level, /^[MQH]$/);
      save("qr-v2.png", bytes);
      const old = await ctx.request.get(base + "/connect/rickya/rickya-qr.png");
      assert.equal(old.status(), 200);
      const oldBytes = await old.body();
      assert.equal(
        hash(oldBytes),
        "aac835c67c6edb5be57017c7e3487a2ab88865d2ef36cf61933cc918415b83f6",
      );
      assert.equal(qrDecode(oldBytes).url, canonical);
    },
  );

  for (const width of [320, 375, 390, 430, 1024, 1440]) {
    await check(
      `Layout, slim header, touch targets and WCAG 2.2 AA at ${width}px`,
      async () => {
        await page.setViewportSize({
          width,
          height: width >= 1024 ? 1000 : 844,
        });
        await page.evaluate(() => scrollTo(0, 0));
        assert.equal(await page.locator(".site-header a").count(), 2);
        assert.equal(
          await page
            .getByRole("navigation", { name: "Primary", exact: true })
            .count(),
          0,
        );
        assert.equal(
          await page.getByRole("button", { name: "Open menu" }).count(),
          0,
        );
        assert.equal(
          await page
            .locator(
              '.site-header a[aria-label="Radiant Events Planning home"]',
            )
            .getAttribute("href"),
          "/",
        );
        assert.ok(
          await page
            .locator(".site-header")
            .getByRole("link", { name: "Start Your Event Inquiry" })
            .isVisible(),
        );
        const metrics = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          small: [...document.querySelectorAll("article a,article button")]
            .map((e) => ({
              text: e.textContent.trim(),
              r: e.getBoundingClientRect().toJSON(),
            }))
            .filter(
              (e) => e.r.width > 0 && (e.r.height < 44 || e.r.width < 24),
            ),
          images: [...document.querySelectorAll("article img")]
            .filter((i) => i.getBoundingClientRect().width > 0)
            .every((i) => i.complete && i.naturalWidth > 0),
        }));
        assert.ok(metrics.scrollWidth <= width);
        assert.deepEqual(metrics.small, []);
        assert.ok(metrics.images);
        save(`${width}-metrics.json`, metrics);
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        save(`${width}-axe.json`, axe.violations);
        assert.deepEqual(
          axe.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
          [],
        );
        await page.screenshot({
          path: path.join(out, `${stage}-${width}.png`),
          fullPage: true,
        });
        await page
          .locator("article")
          .screenshot({ path: path.join(out, `${stage}-${width}-card.png`) });
      },
    );
    await check(
      `QR dialog decodes, traps focus, closes on Escape and restores focus at ${width}px`,
      async () => {
        const trigger = page.getByRole("button", {
          name: "Show my QR",
          exact: true,
        });
        await trigger.click();
        const dialog = page.getByRole("dialog");
        await dialog.waitFor();
        assert.equal(await dialog.getAttribute("aria-modal"), "true");
        const close = dialog.getByRole("button", {
          name: "Close",
          exact: true,
        });
        assert.ok(await close.evaluate((e) => e === document.activeElement));
        await page.keyboard.press("Tab");
        assert.ok(
          await dialog.evaluate((d) => d.contains(document.activeElement)),
          "Tab remains inside dialog",
        );
        await page.keyboard.press("Shift+Tab");
        assert.ok(
          await dialog.evaluate((d) => d.contains(document.activeElement)),
          "Shift+Tab remains inside dialog",
        );
        const image = dialog.getByRole("img", {
          name: "Scan to open Rickya’s digital business card",
        });
        const box = await image.boundingBox();
        assert.ok(box.width >= 280);
        assert.ok(box.width <= 525);
        assert.equal(qrDecode(await image.screenshot()).url, qrUrl);
        await page.screenshot({
          path: path.join(out, `${stage}-${width}-qr-dialog.png`),
        });
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        save(`${width}-dialog-axe.json`, axe.violations);
        assert.deepEqual(
          axe.violations.map((v) => v.id),
          [],
        );
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        assert.ok(await trigger.evaluate((e) => e === document.activeElement));
        assert.notEqual(
          await page.evaluate(() => document.body.style.overflow),
          "hidden",
        );
      },
    );
    if (await page.locator("dialog[open]").count())
      await page.keyboard.press("Escape");
  }
  await check(
    "QR dialog closes with Close and a click outside, without dismissing on QR click",
    async () => {
      const trigger = page.getByRole("button", {
        name: "Show my QR",
        exact: true,
      });
      await trigger.click();
      const dialog = page.getByRole("dialog");
      await dialog
        .getByRole("img", {
          name: "Scan to open Rickya’s digital business card",
        })
        .click();
      assert.ok(await dialog.isVisible());
      await dialog.getByRole("button", { name: "Close", exact: true }).click();
      await dialog.waitFor({ state: "hidden" });
      assert.ok(await trigger.evaluate((e) => e === document.activeElement));
      await trigger.click();
      await page.mouse.click(4, 4);
      await dialog.waitFor({ state: "hidden" });
      assert.ok(await trigger.evaluate((e) => e === document.activeElement));
    },
  );
  await check(
    "Native share uses the requested title, text and UTM URL",
    async () => {
      await page.evaluate(() =>
        Object.defineProperty(navigator, "share", {
          configurable: true,
          value: async (data) => {
            window.__shared = data;
          },
        }),
      );
      await page
        .getByRole("button", { name: "Share card", exact: true })
        .click();
      assert.deepEqual(await page.evaluate(() => window.__shared), {
        title,
        text: shareText,
        url: shareUrl,
      });
    },
  );
  await check("Share AbortError is silent and does not copy", async () => {
    await page.evaluate(() => {
      window.__copies = 0;
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async () => {
          throw new DOMException("Cancelled", "AbortError");
        },
      });
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            window.__copies++;
          },
        },
      });
    });
    await page.getByRole("button", { name: "Share card", exact: true }).click();
    assert.equal(await page.evaluate(() => window.__copies), 0);
    assert.equal(await page.getByRole("status").innerText(), "");
  });
  await check(
    "Desktop share copies the UTM URL and toast clears after two seconds",
    async () => {
      await page.evaluate(() => {
        Object.defineProperty(navigator, "share", {
          configurable: true,
          value: undefined,
        });
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (value) => {
              window.__copied = value;
            },
          },
        });
      });
      await page
        .getByRole("button", { name: "Share card", exact: true })
        .click();
      assert.equal(await page.evaluate(() => window.__copied), shareUrl);
      assert.equal(await page.getByRole("status").innerText(), "Link copied");
      await page.waitForFunction(
        () => document.querySelector('[role="status"]').textContent === "",
      );
    },
  );
  await check(
    "Rejected share falls back to clipboard; denied clipboard reveals selectable URL at 320px",
    async () => {
      await page.evaluate(() =>
        Object.defineProperty(navigator, "share", {
          configurable: true,
          value: async () => {
            throw new DOMException("Denied", "NotAllowedError");
          },
        }),
      );
      await page
        .getByRole("button", { name: "Share card", exact: true })
        .click();
      assert.equal(await page.getByRole("status").innerText(), "Link copied");
      await page.evaluate(() =>
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async () => {
              throw new Error("Denied");
            },
          },
        }),
      );
      await page.setViewportSize({ width: 320, height: 844 });
      await page
        .getByRole("button", { name: "Share card", exact: true })
        .click();
      const input = page.getByRole("textbox", { name: "Card link to copy" });
      assert.equal(await input.inputValue(), shareUrl);
      await input.focus();
      assert.equal(
        await input.evaluate((e) => e.selectionEnd - e.selectionStart),
        shareUrl.length,
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.screenshot({
        path: path.join(out, `${stage}-manual-copy.png`),
        fullPage: true,
      });
      await page.reload();
    },
  );
  await check(
    "Text my card has the exact cross-platform SMS body; direct phone/email stay correct",
    async () => {
      const link = page.getByRole("link", { name: "Text my card to a friend" });
      assert.equal(
        await link.getAttribute("href"),
        "sms:?&body=" + encodeURIComponent(referral),
      );
      assert.equal(
        await page
          .getByRole("link", { name: "Call me", exact: true })
          .getAttribute("href"),
        "tel:+19147332756",
      );
      assert.equal(
        await page
          .getByRole("link", { name: "Text me", exact: true })
          .getAttribute("href"),
        "sms:+19147332756",
      );
      assert.equal(
        await page
          .getByRole("link", { name: "Send an email" })
          .getAttribute("href"),
        "mailto:bookings@radianteventsplanning.com",
      );
      assert.equal(
        await page
          .locator('body > footer a[href*="instagram"]')
          .getAttribute("href"),
        "https://www.instagram.com/radianteventsplanning",
      );
    },
  );
  await check("Bottom QR download uses v2 and is scannable", async () => {
    const link = page.getByRole("link", { name: "Save QR code" });
    assert.equal(
      await link.getAttribute("href"),
      "/connect/rickya/rickya-qr-v2.png",
    );
    const pending = page.waitForEvent("download");
    await link.click();
    const file = await pending;
    assert.equal(qrDecode(fs.readFileSync(await file.path())).url, qrUrl);
  });
  for (const profile of ["iPhone 13", "Pixel 7"])
    await check(
      `${profile} downloads contact with photo/city/labeled links and referral URI`,
      async () => {
        const mobile = await browser.newContext({
          ...devices[profile],
          acceptDownloads: true,
          storageState: await ctx.storageState(),
        });
        const p = await mobile.newPage();
        watch(p);
        await p.goto(base + "/connect/rickya");
        const pending = p.waitForEvent("download");
        await p.getByRole("link", { name: "Save my business contact" }).click();
        const file = await pending;
        assert.equal(file.suggestedFilename(), "Rickya-Fandino.vcf");
        contact(fs.readFileSync(await file.path()));
        assert.equal(
          await p
            .getByRole("link", { name: "Text my card to a friend" })
            .getAttribute("href"),
          "sms:?&body=" + encodeURIComponent(referral),
        );
        await mobile.close();
      },
    );
  for (const suffix of [
    "Instagram 350",
    "FBAN/FBIOS",
    "FBAV/500",
    "FB_IAB",
    "Line/14",
    "musical_ly",
    "BytedanceWebview",
    "LinkedInApp",
    "Snapchat",
  ])
    await check(`In-app guidance after mount for ${suffix}`, async () => {
      const context = await browser.newContext({
        ...devices["iPhone 13"],
        userAgent: devices["iPhone 13"].userAgent + " " + suffix,
        storageState: await ctx.storageState(),
      });
      const p = await context.newPage();
      watch(p);
      const html = await context.request.get(base + "/connect/rickya");
      assert.ok(
        !(await html.text()).includes("Opening this from Instagram?"),
        "Guidance is absent from server HTML",
      );
      await p.goto(base + "/connect/rickya");
      const note = p.getByRole("complementary", {
        name: "Open in your browser",
      });
      await note.waitFor();
      assert.ok((await note.innerText()).includes("Open in browser"));
      assert.equal(
        await note
          .getByRole("button", { name: "Copy link", exact: true })
          .count(),
        1,
      );
      if (suffix.startsWith("Instagram")) {
        await p.evaluate(() =>
          Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: {
              writeText: async (value) => {
                window.__copied = value;
              },
            },
          }),
        );
        await note
          .getByRole("button", { name: "Copy link", exact: true })
          .click();
        assert.equal(await p.evaluate(() => window.__copied), canonical);
        assert.equal(await note.getByRole("status").innerText(), "Link copied");
        await p.waitForFunction(
          () =>
            document.querySelector(
              'aside[aria-label="Open in your browser"] [role="status"]',
            ).textContent === "",
        );
        await p.screenshot({
          path: path.join(out, `${stage}-instagram-note.png`),
          fullPage: true,
        });
        const axe = await new AxeBuilder({ page: p })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        assert.deepEqual(
          axe.violations.map((v) => v.id),
          [],
        );
      }
      await context.close();
    });
  for (const profile of ["iPhone 13", "Pixel 7"])
    await check(
      `Normal ${profile} browser never shows in-app guidance`,
      async () => {
        const context = await browser.newContext({
          ...devices[profile],
          storageState: await ctx.storageState(),
        });
        const p = await context.newPage();
        watch(p);
        await p.goto(base + "/connect/rickya");
        await p.waitForLoadState("networkidle");
        assert.equal(
          await p
            .getByRole("complementary", { name: "Open in your browser" })
            .count(),
          0,
        );
        await context.close();
      },
    );
  await check(
    "Normal pages retain full nav; card header returns on client navigation",
    async () => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page
        .locator("article")
        .getByRole("link", { name: "View services" })
        .click();
      await page.waitForURL(base + "/services");
      assert.equal(
        await page
          .getByRole("navigation", { name: "Primary", exact: true })
          .getByRole("link")
          .count(),
        6,
      );
      const reject = page.getByRole("button", {
        name: "Reject optional",
        exact: true,
      });
      if (await reject.count()) await reject.click();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.keyboard.press("Escape");
      assert.equal(
        await page
          .getByRole("button", { name: "Open menu" })
          .getAttribute("aria-expanded"),
        "false",
      );
      await page.goBack();
      await page.waitForURL(base + "/connect/rickya");
      assert.equal(await page.locator(".site-header a").count(), 2);
    },
  );
  await check(
    "Reduced motion and keyboard skip link remain usable",
    async () => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(base + "/connect/rickya");
      await page.keyboard.press("Tab");
      assert.equal(await page.locator(":focus").innerText(), "Skip to content");
      await page.keyboard.press("Enter");
      assert.equal(await page.locator("html").getAttribute("data-intro"), null);
      assert.equal(
        await page
          .locator("article")
          .evaluate(
            (e) =>
              e
                .getAnimations({ subtree: true })
                .filter((a) => a.playState === "running").length,
          ),
        0,
      );
    },
  );
  await check(
    "No application console errors or hydration warnings",
    async () => {
      const appErrors = errors.filter(
        (e) =>
          !(
            stage.startsWith("preview") &&
            e.message.includes(
              "https://vercel.live/_next-live/feedback/feedback.js",
            ) &&
            e.message.includes("Content Security Policy")
          ),
      );
      assert.deepEqual(appErrors, []);
    },
  );
  await browser.close();
  save("qa.json", { base, stage, results, errors });
  console.log(
    `${results.filter((r) => r.status === "PASS").length}/${results.length} passed`,
  );
  process.exitCode = results.some((r) => r.status === "FAIL") ? 1 : 0;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
