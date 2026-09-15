export const PLANS = {
  free: { label: "Free", price: { monthly: 0, yearly: 0 }, maxProjects: 10, maxVariants: 3, templates: ["modern"], advancedATS: false, jobMatching: false, aiTools: false, privateGithub: false, history: false, advancedExport: false },
  pro: { label: "Pro", price: { monthly: 6, yearly: 60 }, maxProjects: 100, maxVariants: 50, templates: ["modern", "minimal", "corporate"], advancedATS: true, jobMatching: true, aiTools: true, privateGithub: false, history: true, advancedExport: true },
  premium: { label: "Premium", price: { monthly: 12, yearly: 120 }, maxProjects: 1000, maxVariants: 200, templates: ["modern", "minimal", "corporate"], advancedATS: true, jobMatching: true, aiTools: true, privateGithub: false, history: true, advancedExport: true },
};
export const PUBLIC_PLAN_FEATURES = {
  free: ["3 resume variants", "10 reusable projects", "Public GitHub import", "Master Profile", "One ATS-friendly template", "Standard PDF export", "Basic resume checks"],
  pro: ["50 resume variants", "100 reusable projects", "All resume templates", "Advanced ATS analysis", "Job-targeted variants", "Resume history", "Advanced customization"],
  premium: ["Everything in Pro", "200 resume variants", "1,000 reusable projects", "Extended resume history", "Advanced export controls", "Priority access to configured AI features"],
};
export function entitlements(account, settings = {}) {
  const plan = ["free", "pro", "premium"].includes(account?.plan) ? account.plan : "free";
  const limits = { ...PLANS[plan], ...settings.plans?.[plan] };
  if (account?.role === "owner") return { ...PLANS.premium, maxProjects: Number.MAX_SAFE_INTEGER, maxVariants: Number.MAX_SAFE_INTEGER };
  if (settings.enabledTemplates) limits.templates = limits.templates.filter((template) => settings.enabledTemplates.includes(template));
  return limits;
}
export function assertActive(account) { if (!account || account.status !== "active") throw Object.assign(new Error("Account is suspended or unavailable."), { status: 403 }); }
export function assertOwner(account) { assertActive(account); if (account.role !== "owner") throw Object.assign(new Error("Owner access required."), { status: 403 }); }
export function assertCapability(account, capability, settings) { assertActive(account); if (!entitlements(account, settings)[capability]) throw Object.assign(new Error("This feature requires Pro or Premium."), { status: 403 }); }
export function assertPlanWorkspace(account, workspace, previous, settings) {
  assertActive(account); const limits = entitlements(account, settings);
  for (const [collection, limit] of [["projects", limits.maxProjects], ["resumeVariants", limits.maxVariants]]) if (workspace[collection].length > Math.max(limit, previous?.[collection]?.length || 0)) throw Object.assign(new Error(`${collection} limit reached. Upgrade or remove an item.`), { status: 403 });
  for (const variant of workspace.resumeVariants) { const previousVariant = previous?.resumeVariants.find((entry) => entry.id === variant.id); if (!limits.templates.includes(variant.template) && previousVariant?.template !== variant.template) throw Object.assign(new Error("This template requires Pro or Premium."), { status: 403 }); if (!limits.jobMatching && variant.jobDescription && variant.jobDescription !== previousVariant?.jobDescription) throw Object.assign(new Error("Job targeting requires Pro or Premium."), { status: 403 }); }
}
