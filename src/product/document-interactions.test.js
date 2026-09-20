import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspace, assertWorkspace } from "../resume/data/workspace.js";
import { recordHistory, undoHistory } from "./editor-history.js";
import {
  duplicateDocumentEntry,
  entrySelection,
  moveDocumentEntry,
  moveDocumentSection,
  removeDocumentEntry,
  resetDocumentEntryOverride,
  sectionSelection,
  setDocumentSectionHidden,
} from "./document-interactions.js";

function populatedWorkspace() {
  const workspace = createWorkspace("owner", () => "variant");
  workspace.profile.experience = [
    {
      id: "exp-1",
      company: "One",
      role: "Engineer",
      startDate: "2020",
      endDate: "2022",
      description: "First",
    },
    {
      id: "exp-2",
      company: "Two",
      role: "Lead",
      startDate: "2022",
      endDate: "2024",
      description: "Second",
    },
  ];
  workspace.projects = [
    {
      id: "project-1",
      source: "manual",
      sourceData: {},
      resumeData: {
        title: "Project",
        techStack: "JavaScript",
        liveLink: "",
        description: "Built it",
      },
    },
  ];
  const variant = workspace.resumeVariants[0];
  variant.experienceIds = ["exp-1", "exp-2"];
  variant.projectIds = ["project-1"];
  variant.overrides.experience["exp-1"] = { role: "Platform Engineer" };
  return workspace;
}

test("section and entry selection are UI-only and do not mutate workspace data", () => {
  const workspace = populatedWorkspace();
  const before = JSON.stringify(workspace);
  assert.deepEqual(sectionSelection("experience"), {
    type: "section",
    sectionKey: "experience",
  });
  assert.deepEqual(entrySelection("experience", "experience", "exp-1"), {
    type: "entry",
    sectionKey: "experience",
    collection: "experience",
    id: "exp-1",
  });
  assert.equal(JSON.stringify(workspace), before);
});

test("contextual move actions reuse section and selected-entry ordering", () => {
  const workspace = populatedWorkspace();
  const variant = workspace.resumeVariants[0];
  assert.equal(moveDocumentSection(variant, "experience", -1), true);
  assert.deepEqual(variant.sectionOrder, [
    "summary",
    "experience",
    "skills",
    "projects",
    "education",
  ]);
  assert.equal(moveDocumentEntry(variant, "experience", "exp-2", -1), true);
  assert.deepEqual(variant.experienceIds, ["exp-2", "exp-1"]);
});

test("hide and show use the existing hiddenSections list", () => {
  const variant = populatedWorkspace().resumeVariants[0];
  setDocumentSectionHidden(variant, "experience", true);
  setDocumentSectionHidden(variant, "experience", true);
  assert.deepEqual(variant.hiddenSections, ["experience"]);
  setDocumentSectionHidden(variant, "experience", false);
  assert.deepEqual(variant.hiddenSections, []);
});

test("removing an entry deselects it without deleting source or override data", () => {
  const workspace = populatedWorkspace();
  const variant = workspace.resumeVariants[0];
  assert.equal(removeDocumentEntry(variant, "experience", "exp-1"), true);
  assert.deepEqual(variant.experienceIds, ["exp-2"]);
  assert.equal(workspace.profile.experience.length, 2);
  assert.deepEqual(variant.overrides.experience["exp-1"], {
    role: "Platform Engineer",
  });

  assert.equal(removeDocumentEntry(variant, "projects", "project-1"), true);
  assert.equal(workspace.projects.length, 1);
});

test("duplicate creates a unique source ID and preserves valid references", () => {
  const workspace = populatedWorkspace();
  const result = duplicateDocumentEntry(
    workspace,
    "variant",
    "experience",
    "exp-1",
    () => "exp-copy",
  );
  assert.deepEqual(
    result.workspace.profile.experience.map((entry) => entry.id),
    ["exp-1", "exp-copy", "exp-2"],
  );
  assert.deepEqual(result.workspace.resumeVariants[0].experienceIds, [
    "exp-1",
    "exp-copy",
    "exp-2",
  ]);
  assert.deepEqual(
    result.workspace.resumeVariants[0].overrides.experience["exp-copy"],
    { role: "Platform Engineer" },
  );
  assert.equal(workspace.profile.experience.length, 2);
  assertWorkspace(result.workspace, "owner");
  assert.throws(
    () =>
      duplicateDocumentEntry(
        workspace,
        "variant",
        "experience",
        "exp-1",
        () => "exp-2",
      ),
    /unique/,
  );
});

test("contextual reset removes only the selected variant override", () => {
  const workspace = populatedWorkspace();
  const variant = workspace.resumeVariants[0];
  assert.equal(
    resetDocumentEntryOverride(variant, "experience", "exp-1"),
    true,
  );
  assert.equal(variant.overrides.experience["exp-1"], undefined);
  assert.equal(workspace.profile.experience[0].role, "Engineer");
});

test("contextual actions remain compatible with editor undo history", () => {
  const workspace = populatedWorkspace();
  const history = recordHistory({ undo: [], redo: [] }, workspace);
  const changed = structuredClone(workspace);
  moveDocumentEntry(
    changed.resumeVariants[0],
    "experience",
    "exp-2",
    -1,
  );
  const undone = undoHistory(history, changed);
  assert.deepEqual(
    undone.workspace.resumeVariants[0].experienceIds,
    ["exp-1", "exp-2"],
  );
  assert.deepEqual(
    undone.history.redo[0].resumeVariants[0].experienceIds,
    ["exp-2", "exp-1"],
  );
});
