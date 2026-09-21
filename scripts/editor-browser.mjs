import assert from "node:assert/strict";

export async function verifyEditorInteractions({ page, api, ready, record, editor }) {
  const baseline = await api("workspace");
  const variantId = baseline.workspace.resumeVariants[0].id;
  const variantOf = workspace => workspace.resumeVariants.find(v => v.id === variantId);
  const toolbar = page.getByRole("toolbar", { name: "Selected document content actions" });
  const paper = page.locator(".pcv-paper");
  const section = key => paper.locator(`[data-selection-key="section:${key}"]`);
  const entry = (collection, id) => paper.locator(`[data-selection-key="entry:${collection}:${id}"]`);
  async function persisted() {
    const button = page.getByRole("button", { name: "Save", exact: true });
    if (await button.isEnabled()) await button.click();
    await page.waitForFunction(() => document.querySelector(".pcv-editor-save-state")?.textContent.trim() === "Saved");
    return (await api("workspace")).workspace;
  }
  async function openOutline() {
    const outline = page.locator(".pcv-document-outline");
    if (!await outline.evaluate(node => node.open)) await outline.locator("summary").click();
    return page.getByRole("navigation", { name: "Document outline" });
  }
  async function selectSection(key) {
    await section(key).getByRole("heading", { level: 2 }).click();
    assert.equal(await section(key).getAttribute("data-selected"), "true");
    await toolbar.waitFor();
  }

  await selectSection("experience");
  const initialOrder = variantOf(baseline.workspace).sectionOrder;
  const initialIndex = initialOrder.indexOf("experience");
  await toolbar.getByRole("button", { name: "Move up", exact: true }).click();
  let workspace = await persisted();
  assert.equal(variantOf(workspace).sectionOrder.indexOf("experience"), initialIndex - 1);
  await toolbar.getByRole("button", { name: "Move down", exact: true }).click();
  workspace = await persisted();
  assert.deepEqual(variantOf(workspace).sectionOrder, initialOrder);
  await toolbar.getByRole("button", { name: "Hide section", exact: true }).click();
  assert.equal(await section("experience").count(), 0);
  workspace = await persisted();
  assert.ok(variantOf(workspace).hiddenSections.includes("experience"));
  let outline = await openOutline();
  const restoreExperience = outline.getByRole("button", { name: "Experience Restore", exact: true });
  assert.equal(await restoreExperience.getAttribute("class"), "is-hidden");
  await restoreExperience.click();
  await section("experience").waitFor();
  workspace = await persisted();
  assert.ok(!variantOf(workspace).hiddenSections.includes("experience"));
  record("Contextual section selection, move up/down, hide and restore");

  for (const [collection, idsKey, sourceKey] of [
    ["experience", "experienceIds", "profile"],
    ["projects", "projectIds", "projects"],
  ]) {
    const before = await persisted();
    const sourceRecords = sourceKey === "profile" ? before.profile.experience : before.projects;
    const sourceId = variantOf(before)[idsKey][0];
    const source = sourceRecords.find(item => item.id === sourceId);
    const heading = collection === "experience" ? source.role : source.resumeData.title;
    await entry(collection, sourceId).focus();
    await entry(collection, sourceId).press("Enter");
    assert.equal(await entry(collection, sourceId).getAttribute("data-selected"), "true");
    await toolbar.getByRole("button", { name: "Edit", exact: true }).click();
    const field = entry(collection, sourceId).locator("h3[contenteditable=true]");
    await page.waitForFunction(() => document.activeElement?.matches("h3[contenteditable=true]"));
    await field.fill("H customized " + collection);
    await field.press("Tab");
    workspace = await persisted();
    assert.equal(variantOf(workspace).overrides[collection][sourceId][collection === "experience" ? "role" : "title"], "H customized " + collection);
    await toolbar.getByRole("button", { name: "Reset customization", exact: true }).click();
    workspace = await persisted();
    assert.equal(variantOf(workspace).overrides[collection][sourceId], undefined);
    assert.equal(await field.textContent(), heading);
    await toolbar.getByRole("button", { name: "Duplicate", exact: true }).click();
    workspace = await persisted();
    const duplicatedId = variantOf(workspace)[idsKey].find(id => !variantOf(before)[idsKey].includes(id));
    assert.ok(duplicatedId, "Duplicate gets a new source identity");
    assert.equal(await entry(collection, duplicatedId).getAttribute("data-selected"), "true");
    const duplicateIndex = variantOf(workspace)[idsKey].indexOf(duplicatedId);
    await toolbar.getByRole("button", { name: "Move up", exact: true }).click();
    workspace = await persisted();
    assert.equal(variantOf(workspace)[idsKey].indexOf(duplicatedId), duplicateIndex - 1);
    await toolbar.getByRole("button", { name: "Move down", exact: true }).click();
    workspace = await persisted();
    assert.equal(variantOf(workspace)[idsKey].indexOf(duplicatedId), duplicateIndex);
    await entry(collection, sourceId).focus();
    await entry(collection, sourceId).press("Enter");
    await toolbar.getByRole("button", { name: "Remove from this document", exact: true }).click();
    workspace = await persisted();
    assert.ok(!variantOf(workspace)[idsKey].includes(sourceId));
    assert.equal(await entry(collection, sourceId).count(), 0);
    const afterRecords = sourceKey === "profile" ? workspace.profile.experience : workspace.projects;
    assert.deepEqual(afterRecords.find(item => item.id === sourceId), source);
    record(`Contextual ${collection}: Edit, reset, duplicate, move and remove preserve source`);
  }

  outline = await openOutline();
  const paperTitles = await paper.locator("section > h2").allTextContents();
  const outlineTitles = await outline.locator("button > span").allTextContents();
  assert.deepEqual(outlineTitles.map(t => t.toUpperCase()), paperTitles.map(t => t.toUpperCase()));
  await outline.getByRole("button", { name: "Education", exact: true }).click();
  await page.waitForFunction(() => document.activeElement?.dataset.selectionKey === "section:education");
  assert.equal(await section("education").getAttribute("data-selected"), "true");
  await page.waitForFunction(() => {
    const node = document.querySelector('[data-selection-key="section:education"]');
    const rect = node.getBoundingClientRect();
    return rect.top >= 0 && rect.top < innerHeight;
  });
  outline = await openOutline();
  const currentOutlineEntry = outline.getByRole("button", { name: "Education Current", exact: true });
  assert.equal(await currentOutlineEntry.locator("span").textContent(), "Education");
  assert.equal(await currentOutlineEntry.getAttribute("aria-current"), "location");
  await page.locator(".pcv-document-outline summary").click();
  record("Document outline order, focus, selection, scroll and current indicator");

  // Explicit empty-source precondition, only in the isolated demo workspace.
  workspace = await persisted();
  for (const key of ["certifications", "languages", "customSections"]) {
    workspace.profile[key] = [];
    variantOf(workspace).hiddenSections = [...new Set([...(variantOf(workspace).hiddenSections || []), key])];
  }
  let current = await api("workspace");
  await api("workspace", "PUT", { workspace, revision: current.revision });
  await ready(editor);
  for (const [key, label, title] of [
    ["certifications", "Certifications", "H Certification"],
    ["languages", "Languages", "H Language"],
    ["customSections", "Custom sections", "H Custom section"],
  ]) {
    await page.getByRole("navigation", { name: "Editor sections" }).getByRole("button", { name: "Order", exact: true }).click();
    let row = page.locator(".pcv-add-section-row").filter({ has: page.getByRole("checkbox", { name: label, exact: true }) });
    assert.equal(await row.getByRole("checkbox").isDisabled(), true);
    assert.ok((await row.textContent()).includes("No entries"));
    await row.getByRole("link", { name: "Add entries", exact: true }).click();
    await page.waitForURL("**/dashboard/profile#" + key);
    const collection = page.locator("#" + key);
    if (!await collection.evaluate(node => node.open)) await collection.locator(":scope > summary").click();
    await collection.getByRole("button", { name: "Add entry", exact: true }).click();
    await collection.getByLabel("Title", { exact: true }).fill(title);
    await collection.getByLabel("Description", { exact: true }).fill("Created through the source workflow.");
    const savedResponse = page.waitForResponse(response => response.url().endsWith("/api/workspace") && response.request().method() === "PUT");
    await page.getByRole("button", { name: "Save workspace", exact: true }).click();
    assert.equal((await savedResponse).status(), 200);
    await page.waitForFunction(() => !document.querySelector('.pcv-savebar [role="status"]')?.textContent.startsWith("Saving"));
    assert.equal((await api("workspace")).workspace.profile[key][0].title, title);
    await page.getByRole("link", { name: "Resumes & CVs", exact: true }).click();
    await page.getByRole("link", { name: "Edit document", exact: true }).click();
    await page.waitForURL("**" + editor);
    await page.getByRole("navigation", { name: "Editor sections" }).getByRole("button", { name: "Order", exact: true }).click();
    row = page.locator(".pcv-add-section-row").filter({ has: page.getByRole("checkbox", { name: label, exact: true }) });
    await row.getByRole("checkbox").check();
    await section(key).waitFor();
    assert.ok((await section(key).textContent()).includes(title));
    await persisted();
    await selectSection(key);
    await toolbar.getByRole("button", { name: "Hide section", exact: true }).click();
    assert.equal(await section(key).count(), 0);
    await persisted();
    outline = await openOutline();
    await outline.getByRole("button", { name: (key === "customSections" ? "Additional Information" : label) + " Restore", exact: true }).click();
    await section(key).waitFor();
    workspace = await persisted();
    assert.ok(!variantOf(workspace).hiddenSections.includes(key));
    assert.equal(workspace.profile[key][0].title, title);
    record(`${label}: empty source, Add entries, create, return, show, hide and restore`);
  }
  current = await api("workspace");
  await api("workspace", "PUT", { workspace: baseline.workspace, revision: current.revision });
  await ready(editor);
}
