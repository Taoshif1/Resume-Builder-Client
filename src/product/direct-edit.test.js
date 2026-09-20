import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspace } from "../resume/data/workspace.js";
import { applyVariantDirectEdit, normalizeDirectText } from "./direct-edit.js";

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
  applyVariantDirectEdit(variant, { type: "personal", field: "fullName", value: " Ada Lovelace " });
  applyVariantDirectEdit(variant, { type: "entry", collection: "experience", id: "experience-one", field: "role", value: "Staff Engineer" });
  assert.equal(variant.overrides.personalInfo.fullName, "Ada Lovelace");
  assert.equal(variant.overrides.experience["experience-one"].role, "Staff Engineer");
  assert.equal(workspace.profile.experience[0].role, "Engineer");
  assert.throws(() => applyVariantDirectEdit(variant, { type: "entry", collection: "experience", id: "experience-one", field: "id", value: "changed" }), /Unsupported/);
});
