import {
  assertWorkspace,
  createWorkspace,
} from "../src/resume/data/workspace.js";
import {
  assertActive,
  assertOwner,
  assertCapability,
  assertPlanWorkspace,
  entitlements,
  PLANS,
} from "../src/product/plans.js";
import {
  matchJob,
  qualityChecks,
  resumeDocument,
} from "../src/product/document.js";
import {
  PAYMENT_METHODS,
  enabledPaymentMethods,
  normalizeCommerce,
} from "../src/product/commerce.js";

const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};

const normalizeAccount = (record) =>
  record?.plan === "premium" ? { ...record, plan: "pro" } : record;

export function validatePayload(workspace, uid) {
  try {
    assertWorkspace(workspace, uid);
  } catch (error) {
    fail(error.message);
  }
  if (Buffer.byteLength(JSON.stringify(workspace)) > 700000)
    fail(
      "Workspace exceeds the 700 KB document limit. Export a backup and reduce content.",
    );
  const inspect = (value) => {
    if (typeof value === "string" && value.length > 20000)
      fail("A text field exceeds 20,000 characters.");
    if (value && typeof value === "object")
      for (const [key, child] of Object.entries(value)) {
        if (["__proto__", "constructor", "prototype"].includes(key))
          fail("Invalid field name.");
        inspect(child);
      }
  };
  inspect(workspace);
}

export function createService(db, auth) {
  const users = db.collection("users");
  const workspaces = db.collection("workspaces");
  const paymentRequests = db.collection("paymentRequests");
  const settingsRef = db.collection("system").doc("settings");

  async function account(uid) {
    const data = (await users.doc(uid).get()).data();
    assertActive(data);
    return normalizeAccount(data);
  }

  async function settings() {
    return (await settingsRef.get()).data() || {};
  }

  async function initialize(identity) {
    const ref = users.doc(identity.uid);
    await db.runTransaction(async (tx) => {
      if (!(await tx.get(ref)).exists)
        tx.create(ref, {
          uid: identity.uid,
          email: identity.email || "",
          displayName: identity.name || "",
          role: "user",
          plan: "free",
          status: "active",
          createdAt: new Date().toISOString(),
          projects: 0,
          variants: 1,
          exports: 0,
          purchasedDocumentSlots: 0,
        });
    });
    const user = await account(identity.uid);
    const config = await settings();
    const commerce = normalizeCommerce(config.commerce);
    return {
      account: Object.fromEntries(
        Object.entries(user).filter(([key]) => key !== "notes"),
      ),
      entitlements: entitlements(user, config),
      features: {
        ai: Boolean(process.env.AI_API_KEY) && config.aiEnabled !== false,
        publicGithub: config.publicGithub !== false,
      },
      billing: { configured: false, manualPayments: true },
      settings: {
        supportEmail: config.supportEmail || "",
        commerce: {
          proMonthlyBdt: commerce.proMonthlyBdt,
          proYearlyBdt: commerce.proYearlyBdt,
          documentPackSize: commerce.documentPackSize,
          documentPackBdt: commerce.documentPackBdt,
          paymentMethods: enabledPaymentMethods(commerce),
        },
      },
    };
  }

  async function load(uid) {
    await account(uid);
    return db.runTransaction(async (tx) => {
      const ref = workspaces.doc(uid);
      const [current, user] = await Promise.all([
        tx.get(ref),
        tx.get(users.doc(uid)),
      ]);
      assertActive(user.data());
      if (current.exists) return current.data();
      const data = { workspace: createWorkspace(uid), revision: 0 };
      tx.create(ref, data);
      return data;
    });
  }

  async function save(uid, body) {
    validatePayload(body.workspace, uid);
    if (!Number.isSafeInteger(body.revision) || body.revision < 0)
      fail("Invalid revision.");
    return db.runTransaction(async (tx) => {
      const [userDoc, workspaceDoc, configDoc] = await Promise.all([
        tx.get(users.doc(uid)),
        tx.get(workspaces.doc(uid)),
        tx.get(settingsRef),
      ]);
      const user = userDoc.data();
      const previous = workspaceDoc.data();
      assertPlanWorkspace(
        user,
        body.workspace,
        previous?.workspace,
        configDoc.data(),
      );
      if ((previous?.revision || 0) !== body.revision)
        fail(
          "Another tab or device saved changes. Download your local backup, then reload the cloud version.",
          409,
        );
      const data = {
        workspace: body.workspace,
        revision: body.revision + 1,
        updatedAt: new Date().toISOString(),
      };
      tx.set(workspaces.doc(uid), data);
      tx.update(users.doc(uid), {
        projects: body.workspace.projects.length,
        variants: body.workspace.resumeVariants.length,
        displayName: body.workspace.profile.personalInfo.fullName,
        updatedAt: data.updatedAt,
      });
      return data;
    });
  }

  async function history(uid, body) {
    assertCapability(await account(uid), "history", await settings());
    const ref = workspaces.doc(uid).collection("history");
    if (body) {
      const current = await load(uid);
      // Bounded history avoids unbounded storage growth; newest twenty checkpoints.
      const old = await ref.orderBy("createdAt", "desc").get();
      const batch = db.batch();
      old.docs.slice(19).forEach((doc) => batch.delete(doc.ref));
      batch.set(ref.doc(), {
        ...current,
        createdAt: new Date().toISOString(),
        label: String(body.label || "Checkpoint").slice(0, 100),
      });
      await batch.commit();
    }
    return {
      history: (
        await ref.orderBy("createdAt", "desc").limit(20).get()
      ).docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  }

  async function guidance(uid, body) {
    const user = await account(uid);
    assertCapability(user, "advancedATS", await settings());
    const { workspace } = await load(uid);
    const model = resumeDocument(workspace, body.variantId);
    return {
      checks: qualityChecks(model),
      match: matchJob(model, String(body.description || "").slice(0, 20000)),
    };
  }

  async function publicConfig() {
    const config = await settings();
    const commerce = normalizeCommerce(config.commerce);
    return {
      commerce: {
        proMonthlyBdt: commerce.proMonthlyBdt,
        proYearlyBdt: commerce.proYearlyBdt,
        documentPackSize: commerce.documentPackSize,
        documentPackBdt: commerce.documentPackBdt,
      },
    };
  }

  async function listPayments(uid) {
    await account(uid);
    const config = normalizeCommerce((await settings()).commerce);
    const requests = (
      await paymentRequests.where("uid", "==", uid).limit(20).get()
    ).docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return {
      commerce: {
        proMonthlyBdt: config.proMonthlyBdt,
        proYearlyBdt: config.proYearlyBdt,
        documentPackSize: config.documentPackSize,
        documentPackBdt: config.documentPackBdt,
        paymentMethods: enabledPaymentMethods(config),
      },
      requests,
    };
  }

  async function createPayment(uid, body) {
    const user = await account(uid);
    const config = normalizeCommerce((await settings()).commerce);
    const methods = enabledPaymentMethods(config);
    const method = methods.find((entry) => entry.id === body.method);
    if (!method) fail("Choose an enabled payment method.");

    const transactionId = String(body.transactionId || "").trim().toUpperCase();
    if (!/^[A-Z0-9_-]{4,80}$/.test(transactionId))
      fail("Enter a valid transaction ID.");

    const duplicate = await paymentRequests
      .where("transactionId", "==", transactionId)
      .limit(1)
      .get();
    if (!duplicate.empty)
      fail("This transaction ID has already been submitted.", 409);

    const recent = await paymentRequests.where("uid", "==", uid).limit(20).get();
    if (recent.docs.filter((doc) => doc.data().status === "pending").length >= 5)
      fail("You already have several pending payment requests.", 429);

    const product = body.product;
    let amountBdt;
    let quantity = 1;
    let documentSlots = 0;
    let period = null;
    if (product === "document_pack") {
      quantity = Number(body.quantity);
      if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20)
        fail("Choose between 1 and 20 document packs.");
      documentSlots = quantity * config.documentPackSize;
      amountBdt = quantity * config.documentPackBdt;
    } else if (product === "pro") {
      period = body.period === "yearly" ? "yearly" : "monthly";
      amountBdt =
        period === "yearly" ? config.proYearlyBdt : config.proMonthlyBdt;
    } else {
      fail("Choose a valid purchase.");
    }

    const request = {
      uid,
      email: user.email || "",
      product,
      period,
      quantity,
      documentSlots,
      amountBdt,
      method: method.id,
      receiverNumber: method.number,
      transactionId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const ref = paymentRequests.doc();
    await ref.set(request);
    return { request: { id: ref.id, ...request } };
  }

  async function reviewPayment(uid, id, action) {
    assertOwner(await account(uid));
    if (!/^[\w-]+$/.test(id)) fail("Invalid payment request ID.");
    if (!["approve", "reject"].includes(action))
      fail("Choose approve or reject.");

    const requestRef = paymentRequests.doc(id);
    await db.runTransaction(async (tx) => {
      const requestDoc = await tx.get(requestRef);
      if (!requestDoc.exists) fail("Payment request not found.", 404);
      const request = requestDoc.data();
      if (request.status !== "pending")
        fail("This payment request has already been reviewed.", 409);
      const targetRef = users.doc(request.uid);
      const targetDoc = await tx.get(targetRef);
      if (!targetDoc.exists) fail("User not found.", 404);

      if (action === "approve") {
        if (request.product === "document_pack") {
          const current = Number(targetDoc.data().purchasedDocumentSlots || 0);
          tx.update(targetRef, {
            purchasedDocumentSlots: current + request.documentSlots,
            updatedAt: new Date().toISOString(),
          });
        } else if (request.product === "pro") {
          tx.update(targetRef, {
            plan: "pro",
            lastManualPlanPeriod: request.period,
            lastManualPaymentAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      tx.update(requestRef, {
        status: action === "approve" ? "approved" : "rejected",
        reviewedAt: new Date().toISOString(),
        reviewedBy: uid,
      });
      tx.set(db.collection("adminAudit").doc(), {
        actor: uid,
        target: request.uid,
        action: `payment-${action}`,
        paymentRequestId: id,
        product: request.product,
        amountBdt: request.amountBdt,
        createdAt: new Date().toISOString(),
      });
    });
    return { ok: true };
  }

  async function adminList(uid) {
    assertOwner(await account(uid));
    const records = (await users.get()).docs.map((d) => normalizeAccount(d.data()));
    const config = await settings();
    const commerce = normalizeCommerce(config.commerce);
    const recentPayments = (
      await paymentRequests.orderBy("createdAt", "desc").limit(100).get()
    ).docs.map((d) => ({ id: d.id, ...d.data() }));
    const metrics = {
      users: records.length,
      free: records.filter((u) => u.plan === "free").length,
      pro: records.filter((u) => u.plan === "pro").length,
      suspended: records.filter((u) => u.status !== "active").length,
      projects: records.reduce((s, u) => s + (u.projects || 0), 0),
      variants: records.reduce((s, u) => s + (u.variants || 0), 0),
      exports: records.reduce((s, u) => s + (u.exports || 0), 0),
      pendingPayments: recentPayments.filter((p) => p.status === "pending").length,
    };
    return {
      users: records,
      metrics,
      settings: { ...config, commerce },
      plans: PLANS,
      paymentRequests: recentPayments,
      feedback: (
        await db
          .collection("feedback")
          .orderBy("createdAt", "desc")
          .limit(100)
          .get()
      ).docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  }

  async function adminUpdate(uid, target, patch) {
    assertOwner(await account(uid));
    if (!target || target.includes("/")) fail("Invalid user ID.");
    const ref = users.doc(target);
    await db.runTransaction(async (tx) => {
      const current = (await tx.get(ref)).data();
      if (!current) fail("User not found.", 404);
      if (current.role === "owner")
        fail("Owner accounts cannot be changed through this dashboard.", 403);
      const update = {};
      if (patch.plan !== undefined) {
        if (!["free", "pro"].includes(patch.plan)) fail("Invalid plan.");
        update.plan = patch.plan;
      }
      if (patch.status !== undefined) {
        if (!["active", "suspended"].includes(patch.status))
          fail("Invalid status.");
        update.status = patch.status;
      }
      if (patch.notes !== undefined)
        update.notes = String(patch.notes).slice(0, 2000);
      tx.update(ref, update);
      tx.set(db.collection("adminAudit").doc(), {
        actor: uid,
        target,
        update,
        createdAt: new Date().toISOString(),
      });
    });
    if (patch.status === "suspended") await auth.revokeRefreshTokens(target);
    return { ok: true };
  }

  async function deleteAccount(uid, target) {
    assertOwner(await account(uid));
    const current = (await users.doc(target).get()).data();
    if (!current || current.role === "owner")
      fail("Cannot delete this account.", 403);
    await users.doc(target).update({ status: "deleting" });
    await auth.deleteUser(target).catch((error) => {
      if (error.code !== "auth/user-not-found") throw error;
    });
    await db.recursiveDelete(workspaces.doc(target));
    const feedback = await db
      .collection("feedback")
      .where("uid", "==", target)
      .get();
    for (const doc of feedback.docs) await doc.ref.delete();
    const payments = await paymentRequests.where("uid", "==", target).get();
    for (const doc of payments.docs) await doc.ref.delete();
    await users.doc(target).delete();
    return { ok: true };
  }

  async function updateSettings(uid, body) {
    assertOwner(await account(uid));
    const next = {};
    for (const key of ["publicGithub", "aiEnabled"])
      if (body[key] !== undefined) {
        if (typeof body[key] !== "boolean") fail("Invalid flag.");
        next[key] = body[key];
      }
    if (body.supportEmail !== undefined)
      next.supportEmail = String(body.supportEmail).slice(0, 200);
    if (body.commerce !== undefined) {
      const commerce = normalizeCommerce(body.commerce);
      for (const { id } of PAYMENT_METHODS)
        if (
          commerce.paymentMethods[id].enabled &&
          !commerce.paymentMethods[id].number
        )
          fail("Enabled payment methods require an account number.");
      next.commerce = commerce;
    }
    if (body.enabledTemplates !== undefined) {
      if (
        !Array.isArray(body.enabledTemplates) ||
        !body.enabledTemplates.includes("modern") ||
        !body.enabledTemplates.every((template) =>
          ["modern", "minimal", "corporate"].includes(template),
        )
      )
        fail("Keep the Free template enabled and choose valid templates.");
      next.enabledTemplates = [...new Set(body.enabledTemplates)];
    }
    if (body.plans !== undefined) {
      next.plans = {};
      for (const plan of ["free", "pro"]) {
        const config = body.plans[plan];
        if (!config) continue;
        next.plans[plan] = {};
        for (const key of ["maxProjects", "maxVariants"]) {
          if (
            !Number.isSafeInteger(config[key]) ||
            config[key] < 1 ||
            config[key] > 10000
          )
            fail("Limits must be between 1 and 10000.");
          next.plans[plan][key] = config[key];
        }
      }
    }
    await settingsRef.set(next, { merge: true });
    return { ok: true };
  }

  async function recordExport(uid) {
    await db.runTransaction(async (tx) => {
      const ref = users.doc(uid);
      const data = (await tx.get(ref)).data();
      assertActive(data);
      tx.update(ref, { exports: (data.exports || 0) + 1 });
    });
  }

  async function feedback(uid, body) {
    await account(uid);
    if (
      typeof body.message !== "string" ||
      !body.message.trim() ||
      body.message.length > 5000
    )
      fail("Feedback must contain 1–5000 characters.");
    await db.collection("feedback").add({
      uid,
      message: body.message.trim(),
      status: "open",
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }

  async function resolveFeedback(uid, id) {
    assertOwner(await account(uid));
    if (!/^[\w-]+$/.test(id)) fail("Invalid feedback ID.");
    await db.collection("feedback").doc(id).update({ status: "resolved" });
    return { ok: true };
  }

  return {
    initialize,
    account,
    settings,
    publicConfig,
    listPayments,
    createPayment,
    reviewPayment,
    load,
    save,
    history,
    guidance,
    adminList,
    adminUpdate,
    deleteAccount,
    updateSettings,
    recordExport,
    feedback,
    resolveFeedback,
  };
}
