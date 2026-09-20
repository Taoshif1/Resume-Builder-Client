import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspace } from "../resume/data/workspace.js";
import {
  buildDocumentOutline,
  outlineTarget,
  scrollBehavior,
} from "./document-outline.js";

test("outline follows resolved document order and omits absent sections", () => {
  const document = {
    sections: [
      { key: "experience", title: "Experience" },
      { key: "summary", title: "Summary" },
      { key: "projects", title: "Projects" },
    ],
  };
  assert.deepEqual(
    buildDocumentOutline(document).map((item) => item.key),
    ["experience", "summary", "projects"],
  );
  assert.equal(
    buildDocumentOutline(document).some((item) => item.key === "education"),
    false,
  );
});

test("outline represents hidden sections without pretending they are visible", () => {
  const outline = buildDocumentOutline(
    {
      sections: [
        { key: "summary", title: "Summary" },
        { key: "skills", title: "Skills" },
      ],
    },
    ["skills"],
  );
  assert.deepEqual(outline, [
    {
      key: "summary",
      title: "Summary",
      hidden: false,
      targetKey: "section:summary",
    },
    {
      key: "skills",
      title: "Skills",
      hidden: true,
      targetKey: "section:skills",
    },
  ]);
});

test("custom section navigation targets are stable and unique", () => {
  assert.equal(outlineTarget("customSections"), "section:customSections");
  const outline = buildDocumentOutline({
    sections: [
      { key: "customSections", title: "Additional Information" },
      { key: "achievements", title: "Achievements" },
    ],
  });
  assert.equal(new Set(outline.map((item) => item.targetKey)).size, 2);
});

test("outline derivation and navigation preferences never mutate workspace data", () => {
  const workspace = createWorkspace("owner", () => "variant");
  const before = JSON.stringify(workspace);
  buildDocumentOutline(
    { sections: [{ key: "summary", title: "Summary" }] },
    workspace.resumeVariants[0].hiddenSections,
  );
  assert.equal(scrollBehavior(true), "auto");
  assert.equal(scrollBehavior(false), "smooth");
  assert.equal(JSON.stringify(workspace), before);
});
