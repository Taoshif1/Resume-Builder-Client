export const PLANS = {
  free: {
    maxProjects: 10,
    maxVariants: 3,
    templates: ["modern"],
    advancedATS: false,
    jobMatching: false,
    aiTools: false,
    privateGithub: false,
    history: false,
    advancedExport: false,
  },
  pro: {
    maxProjects: 1000,
    maxVariants: 200,
    templates: ["modern", "minimal", "corporate"],
    advancedATS: true,
    jobMatching: true,
    aiTools: true,
    privateGithub: false,
    history: true,
    advancedExport: true,
  },
};
export function entitlements(account, settings = {}) {
  const plan = account?.plan === "pro" ? "pro" : "free";
  const limits = { ...PLANS[plan], ...settings.plans?.[plan] };
  if (account?.role === "owner")
    return {
      ...PLANS.pro,
      maxProjects: Number.MAX_SAFE_INTEGER,
      maxVariants: Number.MAX_SAFE_INTEGER,
    };
  if (settings.enabledTemplates) limits.templates = limits.templates.filter(t => settings.enabledTemplates.includes(t));
  return limits;
}
export function assertActive(account) {
  if (!account || account.status !== "active")
    throw Object.assign(new Error("Account is suspended or unavailable."), {
      status: 403,
    });
}
export function assertOwner(account) {
  assertActive(account);
  if (account.role !== "owner")
    throw Object.assign(new Error("Owner access required."), { status: 403 });
}
export function assertCapability(account, capability, settings) {
  assertActive(account);
  if (!entitlements(account, settings)[capability])
    throw Object.assign(new Error("This feature requires Pro."), {
      status: 403,
    });
}
export function assertPlanWorkspace(account, workspace, previous, settings) {
  assertActive(account);
  const limits = entitlements(account, settings);
  for (const [collection, limit] of [
    ["projects", limits.maxProjects],
    ["resumeVariants", limits.maxVariants],
  ]) {
    if (
      workspace[collection].length >
      Math.max(limit, previous?.[collection]?.length || 0)
    )
      throw Object.assign(
        new Error(`${collection} limit reached. Upgrade or remove an item.`),
        { status: 403 },
      );
  }
  for (const variant of workspace.resumeVariants) {
    if (
      !limits.templates.includes(variant.template) &&
      previous?.resumeVariants.find((v) => v.id === variant.id)?.template !==
        variant.template
    )
      throw Object.assign(new Error("This template requires Pro."), {
        status: 403,
      });
    if (
      !limits.jobMatching &&
      variant.jobDescription &&
      variant.jobDescription !==
        previous?.resumeVariants.find((v) => v.id === variant.id)
          ?.jobDescription
    )
      throw Object.assign(new Error("Job targeting requires Pro."), {
        status: 403,
      });
  }
}
