import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { documentFixture } from "../server/fixtures/document.js";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function captureEditorVisuals({ page, api, ready, editor, record }) {
  const out = ".artifacts/editor-visual";
  mkdirSync(out, { recursive: true });
  const baseline = await api("workspace");
  const shots = [];
  async function openEditor() {
    await ready(editor);
    await page.locator(".pcv-editor-toolbar .pcv-primary").waitFor();
    await page.locator(".pcv-paper h1").waitFor({ state: "attached" });
    const keepCloud = page.getByRole("button", { name: "Keep cloud version", exact: true });
    if (await keepCloud.isVisible()) await keepCloud.click();
  }
  const sections = page.getByRole("navigation", { name: "Editor sections" });
  async function mode(name) {
    if (page.viewportSize().width <= 900)
      await page.getByLabel("Editor view").getByRole("button", { name, exact: true }).click();
  }
  async function capture(state) {
    await page.evaluate(() => document.fonts.ready);
    const clipping = await page.evaluate(() => {
      const problems = [];
      const exportButton = document.querySelector(".pcv-editor-toolbar .pcv-primary");
      if (exportButton.scrollWidth > exportButton.clientWidth + 1) problems.push("Export label clipped");
      const toolbar = document.querySelector(".pcv-context-toolbar");
      if (toolbar.getBoundingClientRect().width) {
        const bounds = toolbar.getBoundingClientRect();
        if (bounds.left < 0) problems.push("Context toolbar shifted offscreen");
        for (const button of toolbar.querySelectorAll("button")) {
          const rect = button.getBoundingClientRect();
          if (rect.top < bounds.top || rect.bottom > bounds.bottom || button.scrollWidth > button.clientWidth + 1) problems.push("Context action clipped");
        }
      }
      const outline = document.querySelector(".pcv-document-outline[open] nav");
      if (outline) {
        const button = outline.querySelector("button");
        const rect = button.getBoundingClientRect();
        if (!button.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2))) problems.push("Outline action obscured");
      }
      return problems;
    });
    assert.deepEqual(clipping, [], "Editor controls remain readable and unobscured");
    const { width, height } = page.viewportSize();
    const path = `${out}/${width}-${state}.png`;
    await page.screenshot({ path, animations: "disabled" });
    const metrics = await page.evaluate(() => ({ body: document.body.scrollWidth, root: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(metrics.body <= width + 1 && metrics.root <= width + 1, `No overflow: ${width} ${state}`);
    shots.push({ width, height, state, path, ...metrics });
  }
  for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844], [360, 800]]) {
    await page.setViewportSize({ width, height });
    await openEditor();
    await page.locator(".pcv-paper h1").waitFor({ state: "attached" });
    await capture("default");
    await mode("Preview");
    await page.locator('.pcv-paper [data-selection-key="section:experience"] > h2').click();
    await capture("selected-section");
    const entry = page.locator('.pcv-paper [data-selection-key="entry:experience:experience-one"]');
    await entry.focus();
    await entry.press("Enter");
    await capture("selected-entry");
    await page.locator(".pcv-document-outline summary").click();
    await capture("outline");
    await page.locator(".pcv-document-outline summary").click();
    await mode("Edit");
    await sections.getByRole("button", { name: "Design", exact: true }).click();
    await capture("design");
    await sections.getByRole("button", { name: "Order", exact: true }).click();
    await capture("order-add");
    await sections.getByRole("button", { name: "Content", exact: true }).click();
    await capture("edit");
    await mode("Preview");
    await capture("preview");
  }
  const long = documentFixture({ long: true, documentType: "cv" });
  long.ownerUid = baseline.workspace.ownerUid;
  const current = await api("workspace");
  await api("workspace", "PUT", { workspace: long, revision: current.revision });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openEditor();
  await page.locator(".pcv-paper h1").waitFor();
  const pdfBytes = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  const task = getDocument({ data: new Uint8Array(pdfBytes) });
  const pdf = await task.promise;
  assert.ok(pdf.numPages >= 2, "Visual CV fixture must span multiple real PDF pages");
  const pages = pdf.numPages;
  await task.destroy();
  writeFileSync(`${out}/multipage-cv.pdf`, pdfBytes);
  for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844], [360, 800]]) {
    await page.setViewportSize({ width, height });
    await openEditor();
    await mode("Preview");
    await page.locator(".pcv-paper h1").waitFor();
    await capture("multipage-cv");
  }
  const latest = await api("workspace");
  await api("workspace", "PUT", { workspace: baseline.workspace, revision: latest.revision });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ready(editor);
  writeFileSync(`${out}/report.json`, JSON.stringify({ pages, shots }, null, 2));
  record(`Editor visual capture: ${shots.length} screenshots at four sizes; ${pages}-page CV`);
}
