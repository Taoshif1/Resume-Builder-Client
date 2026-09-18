import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspace, assertWorkspace } from "../resume/data/workspace.js";
import {
  mutateWorkspace,
  removeRecord,
  addVariant,
  importRepositories,
  safeUrl,
} from "./operations.js";
import {
  entitlements,
  assertOwner,
  assertPlanWorkspace,
  assertCapability,
} from "./plans.js";
import { resumeDocument, matchJob, pdfFilename } from "./document.js";

const free = { role: "user", plan: "free", status: "active" };
test("master CRUD and deletion remove references across every variant without changing other entries", () => {
  let w = createWorkspace("alice");
  w.profile.experience.push({
    id: "exp",
    company: "Acme",
    role: "Engineer",
    startDate: "2020",
    endDate: "2024",
    description: "Built APIs",
  });
  w.resumeVariants[0].experienceIds = ["exp"];
  w.resumeVariants[0].overrides.experience.exp = {
    description: "Reduced latency 25%",
  };
  w = addVariant(w, w.resumeVariants[0]);
  const next = removeRecord(w, "experience", "exp");
  assert.equal(next.profile.experience.length, 0);
  next.resumeVariants.forEach((v) => {
    assert.deepEqual(v.experienceIds, []);
    assert.deepEqual(v.overrides.experience, {});
  });
  assert.equal(w.profile.experience.length, 1);
});
test("GitHub refresh updates facts and never replaces authored or variant content", () => {
  const repo = {
    id: 42,
    private: false,
    name: "engine",
    owner: { login: "alice" },
    description: "source",
    language: "JavaScript",
    topics: ["web"],
  };
  let w = importRepositories(createWorkspace("alice"), [repo]);
  const id = w.projects[0].id;
  w.projects[0].resumeData.description = "My authored impact";
  w.resumeVariants[0].projectIds = [id];
  w.resumeVariants[0].overrides.projects[id] = {
    description: "Tailored impact",
  };
  const refreshed = importRepositories(w, [
    { ...repo, description: "Changed upstream" },
  ]);
  assert.equal(refreshed.projects.length, 1);
  assert.equal(
    refreshed.projects[0].resumeData.description,
    "My authored impact",
  );
  assert.equal(
    refreshed.projects[0].sourceData.githubDescription,
    "Changed upstream",
  );
  assert.equal(
    resumeDocument(refreshed, refreshed.resumeVariants[0].id).sections.find(
      (s) => s.key === "projects",
    ).items[0].text,
    "Tailored impact",
  );
  assert.equal(
    resumeDocument(refreshed, refreshed.resumeVariants[0].id).sections.find(
      (s) => s.key === "projects",
    ).items[0].tech,
    "JavaScript",
  );
  assert.throws(() => importRepositories(w, [{ ...repo, private: true }]));
});
test("entitlements enforce limits, deny suspended/Pro admin and allow owner bypass", () => {
  let w = createWorkspace("alice");
  for (let i = 0; i < 3; i++) w = addVariant(w);
  assert.throws(() => assertPlanWorkspace(free, w), /limit/);
  assert.doesNotThrow(() => assertPlanWorkspace({ ...free, role: "owner" }, w));
  assert.throws(() => assertOwner({ ...free, plan: "pro" }), /Owner/);
  assert.throws(
    () => assertOwner({ ...free, role: "owner", status: "suspended" }),
    /suspended/,
  );
  assert.throws(() => assertCapability(free, "history"), /Pro/);
  assert.equal(
    entitlements(free, { plans: { free: { maxProjects: 15 } } }).maxProjects,
    15,
  );
});
test("grandfathered data is preserved on downgrade but cannot grow beyond limits", () => {
  let w = createWorkspace("alice");
  for (let i = 0; i < 4; i++) w = addVariant(w);
  assert.doesNotThrow(() => assertPlanWorkspace(free, w, w));
  assert.throws(() => assertPlanWorkspace(free, addVariant(w), w));
});
test("variant overrides, hidden sections and document order do not mutate master data", () => {
  const w = createWorkspace("alice");
  w.profile.personalInfo.summary = "Master";
  const v = w.resumeVariants[0];
  v.overrides.personalInfo.summary = "Tailored";
  const next = mutateWorkspace(w, (n) => {
    n.resumeVariants[0].hiddenSections = ["summary"];
  });
  assert.equal(w.profile.personalInfo.summary, "Master");
  assert.equal(resumeDocument(next, v.id).sections.length, 0);
  assertWorkspace(w, "alice");
  assert.throws(() => assertWorkspace(w, "bob"));
});
test("URLs and filenames reject executable schemes and path syntax; job matching uses existing content", () => {
  assert.equal(safeUrl("javascript:alert(1)"), undefined);
  assert.equal(safeUrl("data:text/html,hi"), undefined);
  assert.equal(pdfFilename("../../Alice", "Resume\r\n"), "Alice-Resume.pdf");
  const match = matchJob(
    {
      sections: [{ items: [{ heading: "API", text: "JavaScript services" }] }],
    },
    "JavaScript Kubernetes",
  );
  assert.deepEqual(match.matched, ["javascript"]);
  assert.deepEqual(match.missing, ["kubernetes"]);
});
