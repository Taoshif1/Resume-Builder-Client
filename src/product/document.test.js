import test from "node:test";
import assert from "node:assert/strict";
import { assertWorkspace } from "../resume/data/workspace.js";
import { documentFixture } from "../../server/fixtures/document.js";
import { resumeDocument, qualityChecks, pdfFilename } from "./document.js";
import { addVariant, importRepositories } from "./operations.js";

test("V1 workspaces keep IDs, overrides and content with an implicit Resume default", () => {
  const w = documentFixture();
  delete w.resumeVariants[0].documentType;
  w.resumeVariants[0].overrides.projects["project-0"] = {
    description: "Authored variant achievement",
  };
  const original = structuredClone(w);
  assertWorkspace(w, w.ownerUid);
  const model = resumeDocument(w, w.resumeVariants[0].id);
  assert.equal(model.documentType, "resume");
  assert.deepEqual(w, original);
  assert.equal(
    model.sections.find((s) => s.key === "projects").items[0].text,
    "Authored variant achievement",
  );
  const duplicatedLegacy = addVariant(w, w.resumeVariants[0]);
  assert.equal(
    duplicatedLegacy.resumeVariants.at(-1).documentType,
    "resume",
    "new duplicates normalize the implicit legacy default",
  );
  const cv = addVariant(w, undefined, "cv");
  assertWorkspace(cv, w.ownerUid);
  assert.deepEqual(cv.resumeVariants[0], original.resumeVariants[0]);
  assert.equal(cv.resumeVariants[1].documentType, "cv");
  assert.equal(
    addVariant(cv, cv.resumeVariants[1]).resumeVariants[2].documentType,
    "cv",
  );
  cv.resumeVariants[1].documentType = "unknown";
  assert.throws(() => assertWorkspace(cv, w.ownerUid));
});
test("safe labelled project links deduplicate URLs and preserve authored feature lines", () => {
  const w = documentFixture();
  const id = w.resumeVariants[0].id;
  let item = resumeDocument(w, id).sections.find((s) => s.key === "projects")
    .items[0];
  assert.deepEqual(
    item.links.map((l) => l.label),
    ["GitHub", "Live"],
  );
  assert.equal(item.bullets.length, 3);
  assert.equal(item.tech, "React, Node.js, Express, PostgreSQL");
  w.projects[0].resumeData.liveLink = w.projects[0].sourceData.repoUrl + "/";
  assert.equal(
    resumeDocument(w, id).sections.find((s) => s.key === "projects").items[0]
      .links.length,
    1,
  );
  w.projects[0].metadata.githubUrl = "javascript:alert(1)";
  w.projects[0].sourceData.repoUrl = "data:text/html,unsafe";
  w.projects[0].resumeData.liveLink = "javascript:alert(1)";
  item = resumeDocument(w, id).sections.find((s) => s.key === "projects")
    .items[0];
  assert.deepEqual(item.links, []);
});
test("common profile links render with compact platform labels", () => {
  const w = documentFixture();
  w.profile.links = [
    {
      id: "github",
      label: "Taoshif's Github",
      url: "https://github.com/example",
    },
    {
      id: "linkedin",
      label: "My LinkedIn profile",
      url: "https://www.linkedin.com/in/example",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      url: "https://example.test",
    },
  ];
  assert.deepEqual(
    resumeDocument(w, w.resumeVariants[0].id).links.map((link) => link.label),
    ["GitHub", "LinkedIn", "Portfolio"],
  );
});

test("CV length is unrestricted while Resume encourages brevity and both retain basic checks", () => {
  const w = documentFixture();
  w.profile.personalInfo.summary = "Evidence ".repeat(1100);
  const v = w.resumeVariants[0];
  assert.ok(
    qualityChecks(resumeDocument(w, v.id)).some((c) => c.includes("Shorten")),
  );
  v.documentType = "cv";
  assert.ok(
    !qualityChecks(resumeDocument(w, v.id)).some((c) =>
      /Shorten|Review length/.test(c),
    ),
  );
  w.profile.personalInfo.fullName = "";
  w.profile.personalInfo.email = "";
  assert.ok(
    qualityChecks(resumeDocument(w, v.id)).includes("Add your full name."),
  );
  assert.ok(
    qualityChecks(resumeDocument(w, v.id)).includes("Add a contact email."),
  );
  assert.match(pdfFilename("Alex", "Career", "cv"), /-CV\.pdf$/);
});
test("Document Studio controls remain backward compatible and validate safe bounds", () => {
  const w = documentFixture({
    template: "compact",
    paperSize: "LEGAL",
    fontSize: 8.5,
    design: {
      fontFamily: "serif",
      lineSpacing: 1.5,
      sectionGap: 2,
      entryGap: 1,
      pageMargin: 30,
      accentColor: "#7a3344",
      headerAlign: "left",
      sectionStyle: "underline",
    },
  });
  assert.doesNotThrow(() => assertWorkspace(w, w.ownerUid));
  const model = resumeDocument(w, w.resumeVariants[0].id);
  assert.equal(model.template, "compact");
  assert.equal(model.paperSize, "LEGAL");
  assert.equal(model.fontSize, 8.5);
  assert.equal(model.fontFamily, "serif");
  assert.equal(model.lineSpacing, 1.5);
  assert.equal(model.sectionGap, 2);
  assert.equal(model.entryGap, 1);
  assert.equal(model.pageMargin, 30);
  assert.equal(model.accentColor, "#7a3344");
  assert.equal(model.headerAlign, "left");
  assert.equal(model.sectionStyle, "underline");

  const invalid = structuredClone(w);
  invalid.resumeVariants[0].fontSize = 30;
  assert.throws(() => assertWorkspace(invalid, invalid.ownerUid));
  invalid.resumeVariants[0].fontSize = 11;
  invalid.resumeVariants[0].accentColor = "red";
  assert.throws(() => assertWorkspace(invalid, invalid.ownerUid));
});

test("refresh of GitHub facts keeps authored data and old document overrides", () => {
  const repo = {
    id: 77,
    private: false,
    owner: { login: "example" },
    name: "sample",
    language: "JavaScript",
  };
  let w = importRepositories(documentFixture(), [repo]);
  const p = w.projects.at(-1);
  p.resumeData.description = "Authored content";
  w.resumeVariants[0].projectIds.push(p.id);
  w.resumeVariants[0].overrides.projects[p.id] = {
    description: "Variant content",
  };
  const next = importRepositories(w, [
    { ...repo, description: "Updated upstream" },
  ]);
  assert.deepEqual(next.projects.at(-1).resumeData, p.resumeData);
  assert.deepEqual(next.resumeVariants, w.resumeVariants);
});

test("partial education and experience records survive document projection", () => {
  const w = documentFixture();
  w.profile.education[0].degree = "";
  w.profile.experience[0].role = "";
  w.profile.experience[0].description = "";
  const model = resumeDocument(w, w.resumeVariants[0].id);
  assert.equal(
    model.sections.find((s) => s.key === "education").items[0].subheading,
    "Example University, Dhaka",
  );
  assert.equal(
    model.sections.find((s) => s.key === "experience").items[0].subheading,
    "Example Studio",
  );
  assert.match(pdfFilename("A".repeat(150), "Long title", "cv"), /-CV\.pdf$/);
});
