import {
  createWorkspace,
  isRecord,
  newId,
  requireValid,
} from "./workspace.js";
import {
  loadWorkspace,
  readLegacyResume,
  saveWorkspace,
} from "../storage/workspaceStorage.js";

const text = (value) => (typeof value === "string" ? value : "");

const copyRecords = (records, fields) =>
  Array.isArray(records)
    ? records.map((item) => ({
        id: typeof item?.id === "string" && item.id ? item.id : newId(),
        ...Object.fromEntries(fields.map((field) => [field, text(item?.[field])])),
      }))
    : [];

export function createLegacyMigrationCandidate(storage) {
  const legacy = readLegacyResume(storage);
  if (!legacy || !["template", "personalInfo", "experience", "education", "skills", "projects"]
    .some((key) => Object.hasOwn(legacy, key))) return null;

  const workspace = createWorkspace("pending-migration");
  const experience = copyRecords(legacy.experience, [
    "company", "role", "startDate", "endDate", "description",
  ]);
  const education = copyRecords(legacy.education, [
    "institution", "degree", "startDate", "endDate",
  ]);
  const skills = Array.isArray(legacy.skills)
    ? legacy.skills.map((skill) => ({ id: newId(), name: text(skill) })).filter((skill) => skill.name)
    : [];
  const projects = Array.isArray(legacy.projects)
    ? legacy.projects.map((project) => ({
        id: typeof project?.id === "string" && project.id ? project.id : newId(),
        source: "manual",
        sourceData: {},
        resumeData: {
          title: text(project?.title),
          techStack: text(project?.techStack),
          liveLink: text(project?.liveLink),
          description: text(project?.description),
        },
      }))
    : [];

  workspace.profile.personalInfo = {
    ...workspace.profile.personalInfo,
    ...(isRecord(legacy.personalInfo)
      ? Object.fromEntries(Object.keys(workspace.profile.personalInfo).map((field) => [field, text(legacy.personalInfo[field])]))
      : {}),
  };
  workspace.profile.experience = experience;
  workspace.profile.education = education;
  workspace.profile.skills = skills;
  workspace.projects = projects;
  const variant = workspace.resumeVariants[0];
  variant.name = "Migrated Resume";
  variant.template = ["modern", "minimal", "corporate"].includes(legacy.template)
    ? legacy.template
    : "modern";
  variant.experienceIds = experience.map((item) => item.id);
  variant.educationIds = education.map((item) => item.id);
  variant.skillIds = skills.map((item) => item.id);
  variant.projectIds = projects.map((item) => item.id);
  return { legacy, workspace };
}

export function migrateLegacyResume(uid, storage) {
  requireValid(typeof uid === "string" && uid.trim(), "An authenticated owner is required.");
  const candidate = createLegacyMigrationCandidate(storage);
  if (!candidate) return null;
  const workspace = { ...candidate.workspace, ownerUid: uid };
  return workspace;
}

export function commitLegacyMigration(uid, storage) {
  requireValid(typeof uid === "string" && uid.trim(), "An authenticated owner is required.");
  if (loadWorkspace(uid, storage)) {
    throw new Error("A workspace already exists for this account.");
  }
  const workspace = migrateLegacyResume(uid, storage);
  if (!workspace) return null;
  saveWorkspace(workspace, storage);
  return workspace;
}
