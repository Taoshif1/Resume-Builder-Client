import test from "node:test";
import assert from "node:assert/strict";
import {
  assertWorkspace,
  createWorkspace,
  refreshProjectSource,
} from "./workspace.js";
import { resolveResume } from "./resolveResume.js";
import {
  commitLegacyMigration,
  createLegacyMigrationCandidate,
} from "./legacyMigration.js";
import {
  loadWorkspace,
  saveWorkspace,
  workspaceStorageKey,
  WorkspaceStorageError,
} from "../storage/workspaceStorage.js";

const storage = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};

test("empty workspaces have valid schema, owner, variant, and stable collections", () => {
  const workspace = createWorkspace("user-a", () => "variant-1");
  assert.equal(workspace.schemaVersion, 1);
  assert.equal(workspace.ownerUid, "user-a");
  assert.deepEqual(workspace.resumeVariants[0].projectIds, []);
  assert.deepEqual(workspace.resumeVariants[0].sectionOrder, [
    "summary", "skills", "experience", "projects", "education",
  ]);
  assert.doesNotThrow(() => assertWorkspace(workspace, "user-a"));
  assert.throws(() => assertWorkspace(workspace, "user-b"));
});

test("storage is UID-scoped, validates JSON, and surfaces read/write failures", () => {
  const fakeStorage = storage();
  const workspace = createWorkspace("user-a");
  assert.equal(saveWorkspace(workspace, fakeStorage), true);
  assert.deepEqual(loadWorkspace("user-a", fakeStorage), workspace);
  assert.equal(loadWorkspace("user-b", fakeStorage), null);

  fakeStorage.values.set(workspaceStorageKey("user-a"), "{bad json");
  assert.throws(() => loadWorkspace("user-a", fakeStorage), WorkspaceStorageError);
  fakeStorage.values.set(workspaceStorageKey("user-a"), JSON.stringify({
    ...workspace,
    ownerUid: "user-b",
  }));
  assert.throws(() => loadWorkspace("user-a", fakeStorage), WorkspaceStorageError);

  const failingRead = { getItem: () => { throw new Error("read failed"); } };
  assert.throws(() => loadWorkspace("user-a", failingRead), WorkspaceStorageError);
  const failingWrite = { setItem: () => { throw new Error("write failed"); } };
  assert.throws(() => saveWorkspace(workspace, failingWrite), WorkspaceStorageError);
  assert.equal(loadWorkspace("user-a", null), null);
});

test("resolver preserves every selected order, applies authored overrides, and does not mutate", () => {
  const workspace = createWorkspace("user-a");
  const [variant] = workspace.resumeVariants;
  const experience = [
    { id: "experience-1", company: "A", role: "One", startDate: "", endDate: "", description: "" },
    { id: "experience-2", company: "B", role: "Two", startDate: "", endDate: "", description: "" },
  ];
  const education = [
    { id: "education-1", institution: "School A", degree: "A", startDate: "", endDate: "" },
    { id: "education-2", institution: "School B", degree: "B", startDate: "", endDate: "" },
  ];
  const skills = [{ id: "skill-1", name: "React" }, { id: "skill-2", name: "Node" }];
  const projects = [
    {
      id: "project-1",
      source: "github",
      sourceData: { owner: "octo", repoName: "demo", githubDescription: "external" },
      resumeData: { title: "Authored", techStack: "React", liveLink: "", description: "written" },
    },
    {
      id: "project-2",
      source: "manual",
      sourceData: {},
      resumeData: { title: "Manual", techStack: "", liveLink: "", description: "" },
    },
  ];
  workspace.profile.experience = experience;
  workspace.profile.education = education;
  workspace.profile.skills = skills;
  workspace.projects = projects;
  variant.experienceIds = ["experience-2", "experience-1"];
  variant.educationIds = ["education-2", "education-1"];
  variant.skillIds = ["skill-2", "skill-1"];
  variant.projectIds = ["project-2", "project-1"];
  variant.overrides.personalInfo = { fullName: "Override" };
  variant.overrides.projects["project-1"] = { description: "variant writing" };

  const before = structuredClone(workspace);
  const result = resolveResume(workspace, variant.id);
  assert.deepEqual(Object.keys(result), [
    "template", "personalInfo", "experience", "education", "skills", "projects",
  ]);
  assert.deepEqual(result.experience.map((item) => item.id), ["experience-2", "experience-1"]);
  assert.deepEqual(result.education.map((item) => item.id), ["education-2", "education-1"]);
  assert.deepEqual(result.skills, ["Node", "React"]);
  assert.deepEqual(result.projects.map((item) => item.title), ["Manual", "Authored"]);
  assert.equal(result.projects[1].description, "variant writing");
  assert.equal(result.projects[1].githubDescription, undefined);
  assert.equal(result.personalInfo.fullName, "Override");
  assert.deepEqual(workspace, before);
  assert.equal(resolveResume(workspace, "missing-variant").template, "modern");
});

test("source refresh preserves authored project data and validates manual projects", () => {
  const githubProject = {
    id: "project-1",
    source: "github",
    sourceData: { owner: "old", repoName: "demo" },
    resumeData: { title: "Written title", techStack: "", liveLink: "", description: "Written" },
  };
  const refreshed = refreshProjectSource(githubProject, {
    owner: "new",
    repoName: "demo",
    githubDescription: "new external description",
  });
  assert.equal(refreshed.sourceData.owner, "new");
  assert.equal(refreshed.resumeData.description, "Written");
  assert.throws(() => refreshProjectSource({
    ...githubProject,
    source: "manual",
    sourceData: {},
  }, {}));
  assert.doesNotThrow(() => assertWorkspace({
    ...createWorkspace("user-a"),
    projects: [{
      id: "manual-1",
      source: "manual",
      sourceData: {},
      resumeData: { title: "", techStack: "", liveLink: "", description: "" },
    }],
  }, "user-a"));
});

test("legacy migration preserves content, order, IDs, and original payload without automatic ownership", () => {
  const legacy = {
    template: "minimal",
    personalInfo: { fullName: "Legacy User", title: "Developer" },
    experience: [{ id: "experience-1", company: "A", role: "One" }],
    education: [{ id: "education-1", institution: "School", degree: "BSc" }],
    skills: ["JavaScript", "React"],
    projects: [{ id: "project-1", title: "Old project", description: "written" }],
  };
  const fakeStorage = storage({ "resume-data": JSON.stringify(legacy) });
  const candidate = createLegacyMigrationCandidate(fakeStorage);
  assert.equal(candidate.workspace.ownerUid, "pending-migration");
  assert.equal(candidate.workspace.profile.personalInfo.fullName, "Legacy User");
  assert.deepEqual(candidate.workspace.profile.experience.map((item) => item.id), ["experience-1"]);
  assert.deepEqual(candidate.workspace.profile.education.map((item) => item.id), ["education-1"]);
  assert.deepEqual(candidate.workspace.profile.skills.map((item) => item.name), ["JavaScript", "React"]);
  assert.deepEqual(candidate.workspace.resumeVariants[0].projectIds, ["project-1"]);
  assert.equal(candidate.workspace.projects[0].source, "manual");
  assert.deepEqual(candidate.workspace.projects[0].sourceData, {});
  assert.equal(fakeStorage.values.get("resume-data"), JSON.stringify(legacy));
  assert.equal(loadWorkspace("legacy-user", fakeStorage), null);
});

test("migration commit is explicit, duplicate-safe, and failure-safe", () => {
  const legacyKey = JSON.stringify({ personalInfo: { fullName: "Legacy" } });
  const fakeStorage = storage({ "resume-data": legacyKey });
  const migrated = commitLegacyMigration("user-a", fakeStorage);
  assert.equal(migrated.ownerUid, "user-a");
  assert.deepEqual(fakeStorage.values.get("resume-data"), legacyKey);
  assert.throws(() => commitLegacyMigration("user-a", fakeStorage), /already exists/);

  const failingStorage = {
    getItem: (key) => key === "resume-data" ? legacyKey : null,
    setItem: () => { throw new Error("write failed"); },
  };
  assert.throws(() => commitLegacyMigration("user-b", failingStorage));
  assert.equal(failingStorage.getItem("resume-data"), legacyKey);
  assert.equal(createLegacyMigrationCandidate(storage({ "resume-data": "{}" })), null);
});
