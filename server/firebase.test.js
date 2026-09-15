import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { resolveFirebaseConfig, resolveFirebaseProjectId } from "./firebase.js";
import { createApp } from "./app.js";

const account = {
  project_id: " demo-test ",
  client_email: " admin@example.test ",
  private_key: " key\\nline ",
};
test("project resolution normalizes all sources and rejects mismatches", () => {
  for (const name of [
    "FIREBASE_PROJECT_ID",
    "VITE_projectId",
    "GOOGLE_CLOUD_PROJECT",
    "GCLOUD_PROJECT",
  ])
    assert.equal(
      resolveFirebaseProjectId({ [name]: " demo-test " }),
      "demo-test",
    );
  assert.equal(resolveFirebaseProjectId({}, account), "demo-test");
  assert.throws(
    () => resolveFirebaseProjectId({ VITE_projectId: "other" }, account),
    /do not match/,
  );
});
test("service account validation and emulator isolation", () => {
  const config = resolveFirebaseConfig({
    FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify(account),
  });
  assert.equal(config.serviceAccount.private_key, "key\nline");
  for (const raw of ["{", "null", "{}", JSON.stringify({ project_id: "p" })])
    assert.throws(
      () => resolveFirebaseConfig({ FIREBASE_SERVICE_ACCOUNT_JSON: raw }),
      (e) => e.status === 503,
    );
  const env = {
    FIREBASE_PROJECT_ID: "demo-test",
    FIREBASE_AUTH_EMULATOR_HOST: "localhost:9099",
    FIRESTORE_EMULATOR_HOST: "localhost:8080",
  };
  assert.equal(resolveFirebaseConfig(env).emulators, true);
  assert.throws(
    () =>
      resolveFirebaseConfig({
        ...env,
        NODE_ENV: "production",
        APP_ORIGIN: "https://example.test",
      }),
    /must not/,
  );
});
async function serve(t, options) {
  const server = createApp(options);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  return (path) =>
    fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      headers: { Authorization: "Bearer test-token" },
    });
}
for (const [label, env] of [
  ["missing project", {}],
  ["missing credentials", { FIREBASE_PROJECT_ID: "demo-test" }],
]) {
  test(`${label} returns 503 for health and authenticated account`, async (t) => {
    let configurationError;
    try {
      resolveFirebaseConfig(env);
    } catch (error) {
      configurationError = error;
    }
    assert.equal(configurationError.status, 503);
    const request = await serve(t, { configurationError });
    for (const path of ["/api/health", "/api/account", "/api/workspace"]) {
      const response = await request(path);
      assert.equal(response.status, 503);
      assert.doesNotMatch(
        JSON.stringify(await response.json()),
        /Session expired|private_key|client_email/,
      );
    }
  });
}
for (const [code, status] of [
  ["auth/argument-error", 401],
  ["auth/id-token-expired", 401],
  ["auth/id-token-revoked", 401],
  ["auth/user-disabled", 401],
  ["app/invalid-credential", 503],
  ["auth/insufficient-permission", 503],
  ["auth/internal-error", 503],
]) {
  test(`verification ${code} returns ${status} without revocation fallback`, async (t) => {
    let calls = 0;
    const request = await serve(t, {
      service: {},
      auth: {
        verifyIdToken: async (_token, revoked) => {
          calls++;
          assert.equal(revoked, true);
          throw Object.assign(new Error("sensitive upstream detail"), { code });
        },
      },
    });
    const response = await request("/api/account");
    assert.equal(response.status, status);
    assert.equal(calls, 1);
    assert.doesNotMatch(
      JSON.stringify(await response.json()),
      /sensitive upstream/,
    );
  });
}
test("valid token reaches account; Firestore infrastructure failures return 503", async (t) => {
  const auth = { verifyIdToken: async () => ({ uid: "alice" }) };
  const request = await serve(t, {
    auth,
    service: {
      initialize: async (identity) => ({ account: identity }),
      account: async () => {},
      load: async () => {
        throw Object.assign(new Error("credential detail"), { code: 7 });
      },
    },
  });
  assert.equal((await request("/api/account")).status, 200);
  assert.equal((await request("/api/workspace")).status, 503);
});
