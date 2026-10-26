import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.setDefaultTimeout(12000);
const errors = [];
page.on("pageerror", error => errors.push(error.message));
const email = `folio-test-${Date.now()}@example.com`;
await mkdir("artifacts", { recursive: true });

try {
  const response = await page.goto(base, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Big ideas.");
  await page.screenshot({ path: "artifacts/desktop.png" });
  await page.screenshot({ path: "artifacts/desktop-full.png", fullPage: true });
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    await page.waitForTimeout(150);
    const size = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(size.document <= size.viewport + 1, `Horizontal overflow at ${width}px: ${JSON.stringify(size)}`);
    if (width === 390) {
      await page.screenshot({ path: "artifacts/mobile.png" });
      await page.screenshot({ path: "artifacts/mobile-full.png", fullPage: true });
    }
    if (width === 768) await page.screenshot({ path: "artifacts/tablet.png" });
  }
  console.log("PASS: home renders with no horizontal overflow from 320px to 1440px");
  const images = await page.locator("img").evaluateAll(images => images.filter(image => image.getClientRects().length > 0 && (!image.complete || image.naturalWidth === 0)).map(image => image.src));
  assert.deepEqual(images, [], "Every local product/photo asset should load");

  await page.getByRole("button", { name: "Take a peek", exact: true }).click();
  const dialog = page.locator(".preview-modal[open]");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "My projects", exact: true }).click();
  await expect(dialog.getByText("Good things in the making")).toBeVisible();
  await dialog.getByRole("button", { name: "The idea bank", exact: true }).click();
  await dialog.getByRole("textbox", { name: "A new idea" }).fill("A small smoke-tested idea");
  await dialog.getByRole("button", { name: "Save idea", exact: true }).click();
  await expect(dialog.getByText("A small smoke-tested idea")).toBeVisible();
  await dialog.getByRole("button", { name: "My dashboard", exact: true }).click();
  await dialog.getByRole("button", { name: "Complete Send the good email", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Uncheck Send the good email", exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/product-preview.png" });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.locator(".feature-card").first().click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("A week with a little intention")).toBeVisible();
  await page.keyboard.press("Escape");
  console.log("PASS: product preview navigation, task toggles, ideas, feature cards and Escape");

  await page.getByText("What’s actually inside the toolkit?", { exact: true }).click();
  await expect(page.locator(".faq-item").nth(1)).toHaveAttribute("open", "");
  await page.getByRole("textbox", { name: "Your email address", exact: true }).fill(email);
  await page.getByRole("button", { name: "Subscribe to the folio newsletter" }).click();
  await expect(page.getByText("You’re on the list. Here’s to more good things.")).toBeVisible();
  await page.getByRole("button", { name: "Say a little hello", exact: true }).click();
  const contact = page.locator(".contact-modal[open]");
  await contact.getByLabel("Your name", { exact: true }).fill("Folio Test Creator");
  await contact.getByLabel("Email address", { exact: true }).fill(email);
  await contact.getByLabel("What’s on your mind?", { exact: true }).fill("This is an automated smoke-test message for the folio contact form.");
  await contact.getByRole("button", { name: "Send a little note" }).click();
  await expect(contact.getByText("SAFELY IN OUR INBOX")).toBeVisible();
  await contact.getByRole("button", { name: "Back to the good stuff" }).click();
  console.log("PASS: FAQ, newsletter subscription and saved contact message");

  await page.getByRole("radio", { name: "My studio Up to 5 creative minds" }).click();
  await expect(page.locator(".purchase-price")).toContainText("$89");
  await expect(page.locator(".purchase-button")).toHaveAttribute("href", "/checkout?license=studio");
  await page.locator(".purchase-button").click();
  await page.waitForURL("**/checkout?license=studio");
  await expect(page.locator(".order-line.total")).toContainText("$89");
  await page.locator(".promo-disclosure summary").click();
  await page.getByRole("textbox", { name: "Discount code" }).fill("NOT-A-CODE");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator(".promo-message.error")).toBeVisible();
  await page.getByRole("textbox", { name: "Discount code" }).fill("HELLO10");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator(".order-line.total")).toContainText("$80.10");
  await page.getByRole("button", { name: "Complete demo order", exact: true }).click();
  assert.ok(await page.locator("#checkout-name").evaluate(element => !element.validity.valid), "Empty checkout must be invalid");
  await page.getByLabel("Your full name", { exact: true }).fill("Alex Test Creator");
  await page.locator("#checkout-email").fill(email);
  await page.locator("#checkout-country").selectOption("United States");
  await page.locator('input[name="terms"]').check();
  await page.locator('input[name="updates"]').check();
  await page.screenshot({ path: "artifacts/checkout-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: "Show order summary", exact: true }).click();
  await expect(page.locator(".summary-content")).toBeVisible();
  await page.getByRole("button", { name: "Hide order summary", exact: true }).click();
  await expect(page.locator(".summary-content")).not.toBeVisible();
  await page.screenshot({ path: "artifacts/checkout-mobile.png", fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Checkout should not overflow on mobile");
  await page.getByRole("button", { name: "Complete demo order", exact: true }).click();
  await page.waitForURL("**/checkout/success?order=*");
  await expect(page.getByText("Demo order complete. No payment was taken.")).toBeVisible();
  await expect(page.locator(".order-receipt")).toContainText("$80.10 product value");
  await page.screenshot({ path: "artifacts/success-mobile.png", fullPage: true });
  const download = await context.request.get(base + await page.getByRole("link", { name: "Download your toolkit" }).getAttribute("href"));
  assert.equal(download.status(), 200);
  assert.match(download.headers()["content-disposition"], /attachment/);
  const html = await download.text();
  assert.ok(html.includes('id="goals"') && html.includes('id="dashboard"'));
  const csv = await context.request.get(base + await page.getByRole("link", { name: "Project tracker", exact: true }).getAttribute("href"));
  assert.equal(csv.status(), 200);
  assert.match(await csv.text(), /Project,Client,Status/);
  console.log("PASS: license selection, discount errors, valid discount, validation, saved demo order and real downloads");

  const forbidden = await context.request.get(`${base}/api/download?order=not-an-order`);
  assert.equal(forbidden.status(), 403);
  const invalidEmail = await context.request.post(`${base}/api/subscribe`, { data: { email: "not-an-email" } });
  assert.equal(invalidEmail.status(), 400);
  const badOrigin = await context.request.post(`${base}/api/subscribe`, { headers: { origin: "https://not-folio.invalid" }, data: { email } });
  assert.equal(badOrigin.status(), 403);
  const data = { requestKey: randomUUID(), name: "Idempotent Test", email, country: "United States", license: "personal", terms: true, updates: false, total: 1 };
  const first = await context.request.post(`${base}/api/checkout`, { data });
  const second = await context.request.post(`${base}/api/checkout`, { data });
  assert.equal(first.status(), 200);
  assert.equal(second.status(), 200);
  assert.equal((await first.json()).orderId, (await second.json()).orderId);
  console.log("PASS: unauthorized downloads, bad inputs, cross-origin rejection and order idempotency");

  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await expect(page.locator("#mobile-navigation")).toBeVisible();
  await page.locator("#mobile-navigation").getByRole("link", { name: "Your questions, answered" }).click();
  await expect(page.locator("#mobile-navigation")).not.toBeVisible();
  await page.goto(`${base}/privacy`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("A little privacy.");
  await page.goto(`${base}/terms`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The little details.");
  await page.goto(`${base}/a-missing-page`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("your way back.");
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log("PASS: mobile navigation, legal pages, 404 and zero browser runtime errors");
  console.log("All folio smoke tests passed. Screenshots are in artifacts/.");
} finally {
  await browser.close();
}
