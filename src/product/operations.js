import {
  assertWorkspace,
  createVariant,
  newId,
} from "../resume/data/workspace.js";

export function mutateWorkspace(workspace, edit) {
  const next = structuredClone(workspace);
  edit(next);
  return assertWorkspace(next, workspace.ownerUid);
}
export function removeRecord(workspace, collection, id) {
  return mutateWorkspace(workspace, (next) => {
    const records =
      collection === "projects" ? next.projects : next.profile[collection];
    records.splice(
      records.findIndex((item) => item.id === id),
      records.some((item) => item.id === id) ? 1 : 0,
    );
    const key = {
      projects: "projectIds",
      experience: "experienceIds",
      education: "educationIds",
      skills: "skillIds",
    }[collection];
    for (const variant of next.resumeVariants) {
      if (key) variant[key] = variant[key].filter((value) => value !== id);
      if (variant.overrides[collection])
        delete variant.overrides[collection][id];
    }
  });
}
export function addVariant(workspace, original) {
  return mutateWorkspace(workspace, (next) => {
    const variant = original ? structuredClone(original) : createVariant();
    variant.id = newId();
    variant.name = original ? `${original.name} copy` : "New resume";
    variant.createdAt = new Date().toISOString();
    variant.updatedAt = variant.createdAt;
    if (!original) {
      for (const [key, records] of Object.entries({
        projectIds: next.projects,
        experienceIds: next.profile.experience,
        educationIds: next.profile.education,
        skillIds: next.profile.skills,
      }))
        variant[key] = records.map((r) => r.id);
    }
    next.resumeVariants.push(variant);
  });
}
export function move(items, index, delta) {
  const next = [...items];
  const target = index + delta;
  if (target < 0 || target >= items.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
export function githubSource(repo, now = new Date().toISOString()) {
  if (
    !Number.isSafeInteger(repo?.id) ||
    repo.id <= 0 ||
    repo.private !== false ||
    !repo.owner?.login ||
    !repo.name
  )
    throw new Error("Invalid public repository.");
  return {
    githubRepoId: repo.id,
    owner: repo.owner.login,
    repoName: repo.name,
    repoUrl: `https://github.com/${repo.owner.login}/${repo.name}`,
    homepageUrl: repo.homepage || "",
    githubDescription: repo.description || "",
    languages: repo.language ? [repo.language] : [],
    topics: repo.topics || [],
    lastUpdatedAt: repo.updated_at || "",
    lastSyncedAt: now,
  };
}
export function importRepositories(workspace, repositories) {
  return mutateWorkspace(workspace, (next) => {
    for (const repo of repositories) {
      const sourceData = githubSource(repo);
      const existing = next.projects.find(
        (p) => p.source === "github" && p.sourceData.githubRepoId === repo.id,
      );
      if (existing) existing.sourceData = sourceData;
      else
        next.projects.push({
          id: newId(),
          source: "github",
          sourceData,
          resumeData: {
            title: repo.name,
            techStack: sourceData.languages.join(", "),
            liveLink: sourceData.homepageUrl,
            description: "",
          },
        });
    }
  });
}
export function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
