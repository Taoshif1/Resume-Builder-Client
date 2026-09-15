import { deleteApp } from "firebase-admin/app";
import assert from "node:assert/strict";
import { once } from "node:events";
import { firebaseServices } from "./firebase.js";
import { createApp } from "./app.js";
import { addVariant } from "../src/product/operations.js";

if (
  !process.env.FIREBASE_AUTH_EMULATOR_HOST ||
  !process.env.FIRESTORE_EMULATOR_HOST ||
  process.env.FIREBASE_PROJECT_ID !== "demo-personacv"
)
  throw new Error(
    "Integration tests require the isolated demo-personacv Auth and Firestore emulators.",
  );
const { auth, db } = firebaseServices();
const server = createApp({ auth, db });
server.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${server.address().port}`;
async function user(label) {
  const response = await fetch(
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `${label}-${Date.now()}@example.test`,
        password: "Testing123!",
        returnSecureToken: true,
      }),
    },
  );
  const data = await response.json();
  assert.ok(data.idToken, "Emulator signup must return an ID token");
  return { uid: data.localId, token: data.idToken };
}
async function request(user, path, method = "GET", body) {
  const response = await fetch(base + path, {
    method,
    headers: {
      Authorization: `Bearer ${user.token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: response.status,
    data: response.headers.get("content-type")?.includes("application/pdf")
      ? await response.arrayBuffer()
      : await response.json(),
  };
}
try {
  const alice = await user("alice");
  const bob = await user("bob");
  const owner = await user("owner");
  for (const u of [alice, bob, owner])
    assert.equal((await request(u, "/api/account")).status, 200);
  await db
    .collection("users")
    .doc(owner.uid)
    .update({ role: "owner", plan: "pro" });
  const first = (await request(alice, "/api/workspace")).data;
  assert.equal(
    (await request(alice, "/api/workspace")).data.workspace.resumeVariants[0]
      .id,
    first.workspace.resumeVariants[0].id,
    "initial IDs must be stable",
  );
  first.workspace.profile.personalInfo.fullName = "Alice Developer";
  first.workspace.profile.personalInfo.email = "alice@example.test";
  const saved = await request(alice, "/api/workspace", "PUT", first);
  assert.equal(saved.status, 200, JSON.stringify(saved));
  assert.equal(
    (await request(alice, "/api/workspace")).data.workspace.profile.personalInfo
      .fullName,
    "Alice Developer",
    "saved profile survives reload",
  );
  assert.equal(
    (await request(alice, "/api/workspace", "PUT", first)).status,
    409,
    "stale save conflict",
  );
  assert.equal(
    (await request(bob, "/api/workspace", "PUT", first)).status,
    400,
    "cross-user save denied",
  );
  assert.equal(
    (await request(bob, "/api/workspace")).data.workspace.profile.personalInfo
      .fullName,
    "",
    "isolated data",
  );
  assert.equal((await request(alice, "/api/admin")).status, 403);
  assert.equal(
    (
      await request(alice, `/api/admin/users/${alice.uid}`, "PATCH", {
        role: "owner",
        plan: "pro",
      })
    ).status,
    403,
  );
  let excess = first.workspace;
  for (let i = 0; i < 3; i++) excess = addVariant(excess);
  assert.equal(
    (
      await request(alice, "/api/workspace", "PUT", {
        workspace: excess,
        revision: saved.data.revision,
      })
    ).status,
    403,
    "free limits enforced",
  );
  assert.equal(
    (
      await request(owner, `/api/admin/users/${alice.uid}`, "PATCH", {
        plan: "pro",
        notes: "Owner-only note",
      })
    ).status,
    200,
  );
  assert.equal(
    (await request(alice, "/api/account")).data.account.notes,
    undefined,
    "admin notes are private",
  );
  assert.equal(
    (await request(alice, "/api/admin")).status,
    403,
    "Pro has no admin",
  );
  assert.equal(
    (
      await request(alice, "/api/workspace", "PUT", {
        workspace: excess,
        revision: saved.data.revision,
      })
    ).status,
    200,
  );
  assert.equal(
    (await request(alice, "/api/history", "POST", { label: "Test checkpoint" }))
      .data.history.length,
    1,
  );
  assert.equal(
    (
      await request(alice, "/api/export", "POST", {
        variantId: first.workspace.resumeVariants[0].id,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request(alice, "/api/feedback", "POST", {
        message: "Integration feedback",
      })
    ).status,
    200,
  );
  assert.ok((await request(owner, "/api/admin")).data.metrics.exports >= 1);
  assert.equal(
    (
      await request(owner, `/api/admin/users/${owner.uid}`, "PATCH", {
        status: "suspended",
      })
    ).status,
    403,
    "owner protected",
  );
  assert.equal(
    (
      await request(owner, `/api/admin/users/${bob.uid}`, "PATCH", {
        status: "suspended",
      })
    ).status,
    200,
  );
  assert.ok(
    [401, 403].includes((await request(bob, "/api/workspace")).status),
    "suspension blocks access",
  );
  assert.equal(
    (
      await request(owner, `/api/admin/users/${bob.uid}`, "PATCH", {
        status: "active",
      })
    ).status,
    200,
  );
  const direct = await fetch(
    `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/demo-personacv/databases/(default)/documents/users/${alice.uid}`,
    { headers: { Authorization: `Bearer ${alice.token}` } },
  );
  assert.equal(direct.status, 403, "direct browser Firestore access denied");
  assert.equal(
    (await request(owner, `/api/admin/users/${bob.uid}`, "DELETE")).status,
    200,
  );
  assert.equal(
    (await db.collection("workspaces").doc(bob.uid).get()).exists,
    false,
  );
  console.log(
    "PASS: real emulator Auth -> HTTP API -> Firestore isolation, stable IDs, conflicts, limits, Pro/admin separation, notes privacy, history, PDF, feedback, suspension, reactivation, deletion and rules.",
  );
} finally {
  server.close();
  await db.terminate();
  await deleteApp(auth.app);
}
