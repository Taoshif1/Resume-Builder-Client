export const PLANS = {
  free: {
    label: "Free",
    price: { monthly: 0, yearly: 0 },
    maxProjects: 10,
    maxVariants: 3,
    templates: ["modern"],
    advancedATS: false,
    jobMatching: false,
    aiTools: false,
    history: false,
  },
  pro: {
    label: "Pro",
    price: { monthly: 6, yearly: 60 },
    maxProjects: 100,
    maxVariants: 50,
    templates: ["modern", "minimal", "corporate"],
    advancedATS: true,
    jobMatching: true,
    aiTools: true,
    history: true,
  },
};

export const PUBLIC_PLAN_FEATURES = {
  free: [
    "3 resume variants",
    "10 reusable projects",
    "Public GitHub import",
    "Master Profile",
    "One ATS-friendly template",
    "PDF export",
    "Basic resume checks",
  ],
  pro: [
    "50 resume variants",
    "100 reusable projects",
    "All resume templates",
    "Advanced ATS analysis",
    "Job-targeted variants",
    "Resume history",
    "Optional configured AI writing assistance",
  ],
};

function normalizedPlan(account) {
  // A short-lived pre-release branch exposed a Premium label. Treat any legacy
  // value as Pro so old test data is not silently downgraded while the public
  // product remains Free + Pro.
  return account?.plan === "pro" || account?.plan === "premium" ? "pro" : "free";
}

export function entitlements(account, settings = {}) {
  if (account?.role === "owner") {
    return {
      ...PLANS.pro,
      templates: [...PLANS.pro.templates],
      maxProjects: Number.MAX_SAFE_INTEGER,
      maxVariants: Number.MAX_SAFE_INTEGER,
    };
  }

  const plan = normalizedPlan(account);
  const limits = { ...PLANS[plan], ...settings.plans?.[plan] };
  limits.templates = [...PLANS[plan].templates];
  if (settings.enabledTemplates) {
    limits.templates = limits.templates.filter((template) =>
      settings.enabledTemplates.includes(template),
    );
  }
  return limits;
}

export function assertActive(account) {
  if (!account || account.status !== "active") {
    throw Object.assign(new Error("Account is suspended or unavailable."), {
      status: 403,
    });
  }
}

export function assertOwner(account) {
  assertActive(account);
  if (account.role !== "owner") {
    throw Object.assign(new Error("Owner access required."), { status: 403 });
  }
}

export function assertCapability(account, capability, settings) {
  assertActive(account);
  if (!entitlements(account, settings)[capability]) {
    throw Object.assign(new Error("This feature requires Pro."), { status: 403 });
  }
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
    ) {
      throw Object.assign(
        new Error(`${collection} limit reached. Upgrade or remove an item.`),
        { status: 403 },
      );
    }
  }

  for (const variant of workspace.resumeVariants) {
    const previousVariant = previous?.resumeVariants.find(
      (entry) => entry.id === variant.id,
    );
    if (
      !limits.templates.includes(variant.template) &&
      previousVariant?.template !== variant.template
    ) {
      throw Object.assign(new Error("This template requires Pro."), {
        status: 403,
      });
    }
    if (
      !limits.jobMatching &&
      variant.jobDescription &&
      variant.jobDescription !== previousVariant?.jobDescription
    ) {
      throw Object.assign(new Error("Job targeting requires Pro."), {
        status: 403,
      });
    }
  }
}
