import { sectionSelection, selectionKey } from "./document-interactions.js";

export function outlineTarget(sectionKey) {
  return selectionKey(sectionSelection(sectionKey));
}

export function buildDocumentOutline(document, hiddenSections = []) {
  const hidden = new Set(hiddenSections);
  return document.sections.map((section) => ({
    key: section.key,
    title: section.title,
    hidden: hidden.has(section.key),
    targetKey: outlineTarget(section.key),
  }));
}

export function scrollBehavior(prefersReducedMotion) {
  return prefersReducedMotion ? "auto" : "smooth";
}
