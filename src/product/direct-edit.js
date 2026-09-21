const ENTRY_FIELDS = {
  experience: new Set(["role", "company", "startDate", "endDate", "description"]),
  education: new Set(["degree", "institution", "startDate", "endDate"]),
  projects: new Set(["title", "description", "techStack"]),
  skills: new Set(["name"]),
};
const PERSONAL_FIELDS = new Set([
  "fullName",
  "title",
  "email",
  "phone",
  "location",
  "summary",
]);

// Identity belongs to a field, not merely its source record (e.g. two dates).
export function editablePartKey(part) {
  const source = part.source || { type: "personal", field: part.field };
  return JSON.stringify([source.type, source.collection || "", source.id || "", source.field]);
}

export function normalizeDirectText(value, multiline = false) {
  const text = String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .slice(0, 20000);
  if (!multiline) return text.replace(/\s+/g, " ").trim();
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function applyVariantDirectEdit(variant, change) {
  const value = normalizeDirectText(change.value, change.multiline);
  if (change.type === "personal" && PERSONAL_FIELDS.has(change.field)) {
    variant.overrides.personalInfo[change.field] = value;
    return;
  }
  if (
    change.type === "entry" &&
    ENTRY_FIELDS[change.collection]?.has(change.field) &&
    typeof change.id === "string"
  ) {
    variant.overrides[change.collection][change.id] = {
      ...variant.overrides[change.collection][change.id],
      [change.field]: value,
    };
    return;
  }
  throw new Error("Unsupported direct document edit.");
}
