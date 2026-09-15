import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "./app.js";
import { validatePayload } from "./service.js";
import { createWorkspace } from "../src/resume/data/workspace.js";
import { renderPdf } from "./pdf.js";
import {
  assertOwner,
  assertPlanWorkspace,
  entitlements,
  PLANS,
} from "../src/product/plans.js";

test("HTTP API verifies revoked tokens, blocks unauthenticated and Pro admin requests", async (t) => {
  let checkRevoked = false;
  const service = {
    account: async () => ({ role: "user", plan: "pro", status: "active" }),
    adminList: async () => {
      assertOwner({ role: "user", plan: "pro", status: "active" });
    },
  };
  const server = createApp({
    auth: {
      verifyIdToken: async (token, revoked) => {
        checkRevoked = revoked;
        if (token === "bad") throw new Error("invalid");
        return { uid: "alice" };
      },
    },
    service,
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(`${base}/api/admin`)).status, 401);
  assert.equal(
    (
      await fetch(`${base}/api/admin`, {
        headers: { Authorization: "Bearer bad" },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await fetch(`${base}/api/admin`, {
        headers: { Authorization: "Bearer valid" },
      })
    ).status,
    403,
  );
  assert.equal(checkRevoked, true);
});

test("persistence rejects owner changes, prototype keys and oversized fields", () => {
  const w = createWorkspace("alice");
  assert.throws(() => validatePayload(w, "bob"), /owner/);
  w.profile.personalInfo.summary = "x".repeat(20001);
  assert.throws(() => validatePayload(w, "alice"), /20,000/);
});

test("plans expose Free and Pro while Owner remains a separate privileged role", () => {
  assert.deepEqual(Object.keys(PLANS), ["free", "pro"]);
  assert.equal(
    entitlements({ role: "user", plan: "premium" }).label,
    "Pro",
    "legacy pre-release Premium data maps to Pro without exposing another tier",
  );
  const owner = entitlements({ role: "owner", plan: "free" });
  assert.equal(owner.history, true);
  assert.equal(owner.maxProjects, Number.MAX_SAFE_INTEGER);
  assert.equal(owner.maxVariants, Number.MAX_SAFE_INTEGER);
  assert.throws(
    () => assertOwner({ role: "user", plan: "pro", status: "active" }),
    /Owner access required/,
  );
});

test("Free workspace changes cannot select Pro templates or job targeting", () => {
  const current = createWorkspace("alice");
  const account = { role: "user", plan: "free", status: "active" };

  const templateChange = structuredClone(current);
  templateChange.resumeVariants[0].template = "minimal";
  assert.throws(
    () => assertPlanWorkspace(account, templateChange, current, {}),
    /template requires Pro/,
  );

  const targetingChange = structuredClone(current);
  targetingChange.resumeVariants[0].jobDescription = "Senior React developer";
  assert.throws(
    () => assertPlanWorkspace(account, targetingChange, current, {}),
    /Job targeting requires Pro/,
  );

  assert.doesNotThrow(() =>
    assertPlanWorkspace(
      { role: "user", plan: "pro", status: "active" },
      targetingChange,
      current,
      {},
    ),
  );
});

test("PDF produces real multipage text documents with safe links", async () => {
  const w = createWorkspace("alice");
  w.profile.personalInfo.fullName = "Alice Développeur";
  w.profile.links = [
    { id: "link", label: "GitHub", url: "https://github.com/alice" },
  ];
  for (let i = 0; i < 45; i++) {
    w.profile.experience.push({
      id: `e${i}`,
      company: "Acme",
      role: `Engineer ${i}`,
      startDate: "2020",
      endDate: "2024",
      description:
        "Built accessible applications and reduced response times by 25%. ".repeat(
          8,
        ),
    });
    w.resumeVariants[0].experienceIds.push(`e${i}`);
  }
  const pdf = await renderPdf(w, w.resumeVariants[0].id);
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  assert.ok(
    (pdf.toString("latin1").match(/\/Type \/Page\b/g) || []).length > 2,
  );
  assert.ok(pdf.toString("latin1").includes("https://github.com/alice"));
  const parsed = await getDocument({
    data: new Uint8Array(pdf),
    useSystemFonts: true,
  }).promise;
  let extracted = "";
  for (let pageNumber = 1; pageNumber <= parsed.numPages; pageNumber++) {
    const page = await parsed.getPage(pageNumber);
    const content = await page.getTextContent();
    extracted += content.items.map((item) => item.str).join(" ") + " ";
    for (const item of content.items)
      if (item.str.trim()) {
        assert.ok(
          item.transform[4] >= 40 &&
            item.transform[4] + item.width <= page.view[2] - 35,
          "text stays inside horizontal margins",
        );
        assert.ok(
          item.transform[5] >= 35 && item.transform[5] <= page.view[3] - 35,
          "text stays inside vertical margins",
        );
      }
  }
  assert.ok(
    extracted.includes("Alice Développeur"),
    "Unicode name survives PDF extraction",
  );
  for (let i = 0; i < 45; i++)
    assert.ok(extracted.includes(`Engineer ${i}`), "every experience heading survives");
  assert.equal(
    (extracted.match(/25%/g) || []).length,
    45 * 8,
    "all repeated body content survives pagination",
  );
  if (parsed.destroy) await parsed.destroy();
});
