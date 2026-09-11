import { assertWorkspace } from "./workspace.js";

const byId = (records) => new Map(records.map((record) => [record.id, record]));
const clone = (value) => (globalThis.structuredClone
  ? globalThis.structuredClone(value)
  : JSON.parse(JSON.stringify(value)));

const ordered = (ids, records, overrides, mapRecord = (item) => item) => {
  const recordsById = byId(records);
  return ids.flatMap((id) => {
    const record = recordsById.get(id);
    if (!record) return [];
    return [mapRecord({ ...record, ...overrides[id] })];
  });
};

export function resolveResume(workspace, variantId) {
  assertWorkspace(workspace, workspace.ownerUid);
  const variant = workspace.resumeVariants.find((item) => item.id === variantId)
    ?? workspace.resumeVariants[0];
  const personalInfo = {
    ...workspace.profile.personalInfo,
    ...variant.overrides.personalInfo,
  };
  return clone({
    template: variant.template,
    personalInfo,
    experience: ordered(variant.experienceIds, workspace.profile.experience, variant.overrides.experience),
    education: ordered(variant.educationIds, workspace.profile.education, variant.overrides.education),
    skills: ordered(
      variant.skillIds,
      workspace.profile.skills,
      variant.overrides.skills,
      (item) => item.name,
    ),
    projects: ordered(
      variant.projectIds,
      workspace.projects,
      variant.overrides.projects,
      (item) => ({ ...item.resumeData, ...variant.overrides.projects[item.id] }),
    ),
  });
}
