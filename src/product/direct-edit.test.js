import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspace } from "../resume/data/workspace.js";
import { applyVariantDirectEdit, editablePartKey, normalizeDirectText } from "./direct-edit.js";
import { documentFixture } from "../../server/fixtures/document.js";
import { resumeDocument } from "./document.js";

test("projected editable fields have unique stable keys without changing source IDs", () => {
  const workspace = documentFixture();
  const original = structuredClone(workspace);
  const model = resumeDocument(workspace, workspace.resumeVariants[0].id);
  const groups = [model.contactItems];
  for (const section of model.sections) {
    for (const item of section.items) {
      if (item.parts) groups.push(item.parts);
      if (item.dateParts) groups.push(item.dateParts.map(part => ({
        ...part,
        source: { type: "entry", collection: item.sourceCollection, id: item.sourceId, field: part.field },
      })));
    }
  }
  for (const parts of groups) {
    const keys = parts.map(editablePartKey);
    assert.equal(new Set(keys).size, parts.length);
    assert.deepEqual(parts.map(part => editablePartKey({ ...part, value: "edited" })), keys);
    assert.deepEqual([...parts].reverse().map(editablePartKey), [...keys].reverse());
  }
  assert.deepEqual(workspace, original);
});

test("direct text normalization strips pasted layout whitespace and keeps plain lines", () => {
  assert.equal(normalizeDirectText("  Lead\n Engineer  "), "Lead Engineer");
  assert.equal(normalizeDirectText("Built A  \r\nBuilt B\n\n\nBuilt C", true), "Built A\nBuilt B\n\nBuilt C");
});

test("direct edits write only resume-specific structured overrides", () => {
  const workspace = createWorkspace("alice");
  const variant = workspace.resumeVariants[0];
  workspace.profile.experience.push({
    id: "experience-one",
    role: "Engineer",
    company: "Acme",
    startDate: "2024",
    endDate: "Present",
    description: "Built products",
  });
  variant.experienceIds.push("experience-one");
  workspace.profile.skills.push({ id: "skill-one", name: "JavaScript" });
  variant.skillIds.push("skill-one");
  applyVariantDirectEdit(variant, { type: "personal", field: "fullName", value: " Ada Lovelace " });
  applyVariantDirectEdit(variant, { type: "personal", field: "email", value: " ada@example.com " });
  applyVariantDirectEdit(variant, { type: "entry", collection: "experience", id: "experience-one", field: "role", value: "Staff Engineer" });
  applyVariantDirectEdit(variant, { type: "entry", collection: "experience", id: "experience-one", field: "startDate", value: "2025" });
  applyVariantDirectEdit(variant, { type: "entry", collection: "skills", id: "skill-one", field: "name", value: "TypeScript" });
  assert.equal(variant.overrides.personalInfo.fullName, "Ada Lovelace");
  assert.equal(variant.overrides.personalInfo.email, "ada@example.com");
  assert.equal(variant.overrides.experience["experience-one"].role, "Staff Engineer");
  assert.equal(variant.overrides.experience["experience-one"].startDate, "2025");
  assert.equal(variant.overrides.skills["skill-one"].name, "TypeScript");
  assert.equal(workspace.profile.experience[0].role, "Engineer");
  assert.equal(workspace.profile.skills[0].name, "JavaScript");
  assert.throws(() => applyVariantDirectEdit(variant, { type: "entry", collection: "experience", id: "experience-one", field: "id", value: "changed" }), /Unsupported/);
});
