const ENTRY_KEYS = {
  experience: "experienceIds",
  education: "educationIds",
  projects: "projectIds",
  skills: "skillIds",
};

const clone = (value) =>
  globalThis.structuredClone
    ? globalThis.structuredClone(value)
    : JSON.parse(JSON.stringify(value));

export function sectionSelection(sectionKey) {
  return { type: "section", sectionKey };
}

export function entrySelection(sectionKey, collection, id) {
  return { type: "entry", sectionKey, collection, id };
}

export function selectionKey(selection) {
  if (!selection) return "";
  return selection.type === "entry"
    ? `entry:${selection.sectionKey}:${selection.id}`
    : `section:${selection.sectionKey}`;
}

export function moveDocumentSection(variant, sectionKey, delta) {
  const index = variant.sectionOrder.indexOf(sectionKey);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= variant.sectionOrder.length)
    return false;
  [variant.sectionOrder[index], variant.sectionOrder[target]] = [
    variant.sectionOrder[target],
    variant.sectionOrder[index],
  ];
  return true;
}

export function setDocumentSectionHidden(variant, sectionKey, hidden) {
  const current = variant.hiddenSections || [];
  variant.hiddenSections = hidden
    ? [...new Set([...current, sectionKey])]
    : current.filter((key) => key !== sectionKey);
}

export function moveDocumentEntry(variant, collection, id, delta) {
  const key = ENTRY_KEYS[collection];
  if (!key) return false;
  const index = variant[key].indexOf(id);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= variant[key].length) return false;
  [variant[key][index], variant[key][target]] = [
    variant[key][target],
    variant[key][index],
  ];
  return true;
}

export function removeDocumentEntry(variant, collection, id) {
  const key = ENTRY_KEYS[collection];
  if (!key) return false;
  const previousLength = variant[key].length;
  variant[key] = variant[key].filter((entryId) => entryId !== id);
  return variant[key].length !== previousLength;
}

export function resetDocumentEntryOverride(variant, collection, id) {
  if (!ENTRY_KEYS[collection] || !variant.overrides[collection]?.[id])
    return false;
  delete variant.overrides[collection][id];
  return true;
}

export function duplicateDocumentEntry(
  workspace,
  variantId,
  collection,
  id,
  idFactory,
) {
  const key = ENTRY_KEYS[collection];
  if (!key) throw new Error("This document entry cannot be duplicated.");
  const next = clone(workspace);
  const variant = next.resumeVariants.find((item) => item.id === variantId);
  if (!variant) throw new Error("Document not found.");
  const records =
    collection === "projects" ? next.projects : next.profile[collection];
  const sourceIndex = records.findIndex((record) => record.id === id);
  if (sourceIndex < 0 || !variant[key].includes(id))
    throw new Error("Document entry not found.");

  const duplicateId = idFactory();
  if (
    typeof duplicateId !== "string" ||
    !duplicateId.trim() ||
    records.some((record) => record.id === duplicateId)
  )
    throw new Error("Could not create a unique entry ID.");

  const duplicate = { ...clone(records[sourceIndex]), id: duplicateId };
  records.splice(sourceIndex + 1, 0, duplicate);
  const selectedIndex = variant[key].indexOf(id);
  variant[key].splice(selectedIndex + 1, 0, duplicateId);
  const override = variant.overrides[collection]?.[id];
  if (override)
    variant.overrides[collection][duplicateId] = clone(override);
  return { workspace: next, id: duplicateId };
}

export function entryOrderState(variant, collection, id) {
  const key = ENTRY_KEYS[collection];
  const index = key ? variant[key].indexOf(id) : -1;
  const length = key ? variant[key].length : 0;
  return {
    index,
    canMoveUp: index > 0,
    canMoveDown: index >= 0 && index < length - 1,
  };
}
