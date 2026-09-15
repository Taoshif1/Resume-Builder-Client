/**
 * Provider adapter contract. Implement checkout and portal with server-derived UID
 * and plan prices. Verify provider webhook signatures and deduplicate event IDs
 * transactionally before changing persisted plans. Never trust client success URLs.
 * @typedef {{configured: boolean, createCheckout: (uid:string)=>Promise<{url:string}>, createPortal: (uid:string)=>Promise<{url:string}>}} BillingAdapter
 */
export const billingAdapter = {
  configured: false,
  async createCheckout() {
    throw Object.assign(
      new Error(
        "Online billing is not configured. Contact support for Pro access.",
      ),
      { status: 503 },
    );
  },
  async createPortal() {
    throw Object.assign(new Error("Online billing is not configured."), {
      status: 503,
    });
  },
};
