export const SCHEMA_VERSION = 1;
export const DOCUMENT_TYPES = ["resume", "cv"];
export const TEMPLATES = ["modern", "minimal", "corporate", "compact", "classic", "academic"];
export const SECTIONS = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
];
export const PERSONAL_FIELDS = [
  "fullName",
  "title",
  "email",
  "phone",
  "location",
  "summary",
];
export const EXPERIENCE_FIELDS = [
  "company",
  "role",
  "startDate",
  "endDate",
  "description",
];
export const EDUCATION_FIELDS = [
  "institution",
  "degree",
  "startDate",
  "endDate",
];
export const PROJECT_FIELDS = ["title", "techStack", "liveLink", "description"];
export const newId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
export const emptyFields = (fields) =>
  Object.fromEntries(fields.map((field) => [field, ""]));
export const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
export const isId = (value) =>
  typeof value === "string" && value.trim().length > 0;

export function requireValid(condition, message = "Invalid workspace data.") {
  if (!condition) throw new Error(message);
}

export function assertFields(value, fields, partial = false) {
  requireValid(isRecord(value));
  requireValid(Object.keys(value).every((key) => fields.includes(key)));
  requireValid(
    fields.every(
      (field) =>
        (partial && !Object.hasOwn(value, field)) ||
        typeof value[field] === "string",
    ),
  );
}

export function createVariant(
  id = newId(),
  name = "My Resume",
  documentType = "resume",
) {
  return {
    id,
    name,
    template: "modern",
    documentType,
    projectIds: [],
    experienceIds: [],
    educationIds: [],
    skillIds: [],
    sectionOrder: [...SECTIONS],
    overrides: {
      personalInfo: {},
      projects: {},
      experience: {},
      education: {},
      skills: {},
    },
  };
}

export function createWorkspace(ownerUid, idFactory = newId) {
  requireValid(isId(ownerUid), "An authenticated owner is required.");
  return {
    schemaVersion: SCHEMA_VERSION,
    ownerUid,
    profile: {
      personalInfo: emptyFields(PERSONAL_FIELDS),
      links: [],
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      achievements: [],
    },
    projects: [],
    resumeVariants: [createVariant(idFactory())],
  };
}

const SOURCE_TEXT_FIELDS = [
  "owner",
  "repoName",
  "repoUrl",
  "homepageUrl",
  "githubDescription",
  "lastUpdatedAt",
  "lastSyncedAt",
];
const SOURCE_FIELDS = [
  ...SOURCE_TEXT_FIELDS,
  "githubRepoId",
  "languages",
  "topics",
];

export function assertSourceData(sourceData) {
  requireValid(isRecord(sourceData));
  requireValid(
    Object.keys(sourceData).every((key) => SOURCE_FIELDS.includes(key)),
  );
  for (const [key, value] of Object.entries(sourceData)) {
    if (key === "githubRepoId") {
      requireValid(isId(value) || (Number.isSafeInteger(value) && value > 0));
    } else if (key === "languages" || key === "topics") {
      requireValid(
        Array.isArray(value) && value.every((item) => typeof item === "string"),
      );
    } else {
      requireValid(typeof value === "string");
    }
  }
}

export function refreshProjectSource(project, sourcePatch) {
  requireValid(
    project.source === "github",
    "Only imported projects have refreshable source data.",
  );
  assertSourceData(sourcePatch);
  const clone = globalThis.structuredClone
    ? globalThis.structuredClone(sourcePatch)
    : JSON.parse(JSON.stringify(sourcePatch));
  return { ...project, sourceData: { ...project.sourceData, ...clone } };
}

function assertRecords(records, fields) {
  requireValid(Array.isArray(records));
  const ids = new Set();
  for (const record of records) {
    requireValid(isRecord(record) && isId(record.id) && !ids.has(record.id));
    ids.add(record.id);
    const content = { ...record };
    delete content.id;
    assertFields(content, fields);
  }
}

function assertSelection(ids, records) {
  requireValid(Array.isArray(ids));
  requireValid(new Set(ids).size === ids.length);
  requireValid(
    ids.every((id) => isId(id) && records.some((record) => record.id === id)),
  );
}

function assertOverrides(overrides, records, fields) {
  requireValid(isRecord(overrides));
  for (const [id, patch] of Object.entries(overrides)) {
    requireValid(records.some((record) => record.id === id));
    assertFields(patch, fields, true);
  }
}

export function assertWorkspace(workspace, ownerUid) {
  requireValid(isRecord(workspace));
  requireValid(
    workspace.schemaVersion === SCHEMA_VERSION,
    "Unsupported workspace version.",
  );
  requireValid(
    isId(ownerUid) && workspace.ownerUid === ownerUid,
    "Workspace owner does not match this account.",
  );
  requireValid(
    Object.keys(workspace).every((key) =>
      [
        "schemaVersion",
        "ownerUid",
        "profile",
        "projects",
        "resumeVariants",
      ].includes(key),
    ),
  );
  const { profile, projects, resumeVariants } = workspace;
  requireValid(isRecord(profile));
  requireValid(
    Object.keys(profile).every((key) =>
      [
        "personalInfo",
        "links",
        "experience",
        "education",
        "skills",
        "certifications",
        "achievements",
        "languages",
        "volunteering",
        "customSections",
      ].includes(key),
    ),
  );
  assertFields(profile.personalInfo, PERSONAL_FIELDS);
  assertRecords(profile.links, ["label", "url"]);
  assertRecords(profile.experience, EXPERIENCE_FIELDS);
  assertRecords(profile.education, EDUCATION_FIELDS);
  assertRecords(profile.skills, ["name"]);
  assertRecords(profile.certifications, ["title", "description"]);
  assertRecords(profile.achievements, ["title", "description"]);
  for (const key of ["languages", "volunteering", "customSections"])
    if (profile[key] !== undefined)
      assertRecords(profile[key], ["title", "description"]);
  requireValid(Array.isArray(projects));
  requireValid(
    new Set(projects.map((project) => project?.id)).size === projects.length,
  );
  for (const project of projects) {
    requireValid(isRecord(project) && isId(project.id));
    requireValid(
      Object.keys(project).every((key) =>
        ["id", "source", "sourceData", "resumeData", "metadata"].includes(key),
      ),
    );
    requireValid(["manual", "github"].includes(project.source));
    if (project.metadata !== undefined)
      assertFields(
        project.metadata,
        [
          "shortName",
          "role",
          "tags",
          "githubUrl",
          "startDate",
          "endDate",
          "visibility",
        ],
        true,
      );
    assertSourceData(project.sourceData);
    assertFields(project.resumeData, PROJECT_FIELDS);
  }
  requireValid(Array.isArray(resumeVariants) && resumeVariants.length > 0);
  requireValid(
    new Set(resumeVariants.map((variant) => variant?.id)).size ===
      resumeVariants.length,
  );
  for (const variant of resumeVariants) {
    requireValid(isRecord(variant) && isId(variant.id) && isId(variant.name));
    requireValid(
      Object.keys(variant).every((key) =>
        [
          "id",
          "name",
          "template",
          "documentType",
          "projectIds",
          "experienceIds",
          "educationIds",
          "skillIds",
          "sectionOrder",
          "overrides",
          "hiddenSections",
          "targetRole",
          "company",
          "jobDescription",
          "labels",
          "createdAt",
          "updatedAt",
          "archived",
          "paperSize",
          "fontSize",
          "fontFamily",
          "lineSpacing",
          "sectionGap",
          "entryGap",
          "pageMargin",
          "accentColor",
          "headerAlign",
          "sectionStyle",
        ].includes(key),
      ),
    );
    for (const key of [
      "targetRole",
      "company",
      "jobDescription",
      "labels",
      "createdAt",
      "updatedAt",
    ])
      if (variant[key] !== undefined)
        requireValid(typeof variant[key] === "string");
    if (variant.documentType !== undefined)
      requireValid(DOCUMENT_TYPES.includes(variant.documentType));
    if (variant.archived !== undefined)
      requireValid(typeof variant.archived === "boolean");
    if (variant.paperSize !== undefined)
      requireValid(["A4", "LETTER", "LEGAL"].includes(variant.paperSize));
    if (variant.fontSize !== undefined)
      requireValid(
        typeof variant.fontSize === "number" &&
          Number.isFinite(variant.fontSize) &&
          variant.fontSize >= 8 &&
          variant.fontSize <= 18,
      );
    if (variant.fontFamily !== undefined)
      requireValid(["sans", "serif", "mono"].includes(variant.fontFamily));
    if (variant.lineSpacing !== undefined)
      requireValid(
        typeof variant.lineSpacing === "number" &&
          Number.isFinite(variant.lineSpacing) &&
          variant.lineSpacing >= 0.9 &&
          variant.lineSpacing <= 2,
      );
    if (variant.sectionGap !== undefined)
      requireValid(
        typeof variant.sectionGap === "number" &&
          Number.isFinite(variant.sectionGap) &&
          variant.sectionGap >= 0 &&
          variant.sectionGap <= 24,
      );
    if (variant.entryGap !== undefined)
      requireValid(
        typeof variant.entryGap === "number" &&
          Number.isFinite(variant.entryGap) &&
          variant.entryGap >= 0 &&
          variant.entryGap <= 16,
      );
    if (variant.pageMargin !== undefined)
      requireValid(
        typeof variant.pageMargin === "number" &&
          Number.isFinite(variant.pageMargin) &&
          variant.pageMargin >= 20 &&
          variant.pageMargin <= 80,
      );
    if (variant.accentColor !== undefined)
      requireValid(/^#[0-9a-f]{6}$/i.test(variant.accentColor));
    if (variant.headerAlign !== undefined)
      requireValid(["left", "center"].includes(variant.headerAlign));
    if (variant.sectionStyle !== undefined)
      requireValid(["line", "underline", "plain"].includes(variant.sectionStyle));
    if (variant.hiddenSections !== undefined)
      requireValid(
        Array.isArray(variant.hiddenSections) &&
          variant.hiddenSections.every((s) =>
            [
              ...SECTIONS,
              "certifications",
              "achievements",
              "languages",
              "volunteering",
              "customSections",
            ].includes(s),
          ),
      );
    requireValid(TEMPLATES.includes(variant.template));
    assertSelection(variant.projectIds, projects);
    assertSelection(variant.experienceIds, profile.experience);
    assertSelection(variant.educationIds, profile.education);
    assertSelection(variant.skillIds, profile.skills);
    requireValid(
      Array.isArray(variant.sectionOrder) &&
        variant.sectionOrder.length === SECTIONS.length,
    );
    requireValid(
      new Set(variant.sectionOrder).size === SECTIONS.length &&
        variant.sectionOrder.every((section) => SECTIONS.includes(section)),
    );
    requireValid(isRecord(variant.overrides));
    requireValid(
      Object.keys(variant.overrides).every((key) =>
        [
          "personalInfo",
          "projects",
          "experience",
          "education",
          "skills",
        ].includes(key),
      ),
    );
    assertFields(variant.overrides.personalInfo, PERSONAL_FIELDS, true);
    assertOverrides(variant.overrides.projects, projects, PROJECT_FIELDS);
    assertOverrides(
      variant.overrides.experience,
      profile.experience,
      EXPERIENCE_FIELDS,
    );
    assertOverrides(
      variant.overrides.education,
      profile.education,
      EDUCATION_FIELDS,
    );
    assertOverrides(variant.overrides.skills, profile.skills, ["name"]);
  }
  return workspace;
}
