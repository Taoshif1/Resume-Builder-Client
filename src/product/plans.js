export const PLANS = {
  free: {
    label: "Free",
    price: { monthly: 0, yearly: 0 },
    priceBdt: { monthly: 0, yearly: 0 },
    maxProjects: 10,
    maxVariants: 2,
    templates: ["modern"],
    advancedATS: false,
    jobMatching: false,
    aiTools: false,
    history: false,
  },
  pro: {
    label: "Pro",
    price: { monthly: 6, yearly: 60 },
    priceBdt: { monthly: 499, yearly: 4990 },
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
    "2 resume or CV documents",
    "10 reusable projects",
    "Public GitHub import",
    "Master Profile",
    "One ATS-friendly template",
    "PDF export",
    "Basic document checks",
  ],
  pro: [
    "50 resume or CV documents",
    "100 reusable projects",
    "All document templates",
    "Document checks & keyword comparison",
    "Job-targeted resume variants",
    "Document history",
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
  const purchasedDocumentSlots = Number(account?.purchasedDocumentSlots || 0);
  limits.maxVariants +=
    Number.isSafeInteger(purchasedDocumentSlots) && purchasedDocumentSlots > 0
      ? purchasedDocumentSlots
      : 0;
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
