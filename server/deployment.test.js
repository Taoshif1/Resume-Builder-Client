import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "./app.js";
import { resolveFirebaseConfig } from "./firebase.js";
import { assertNoProductionEmulators, productionOrigin } from "../config/deployment.js";

const valid = {
  APP_ORIGIN: "https://personacv.vercel.app",
  FIREBASE_PROJECT_ID: "deployment-test",
  FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({ project_id: "deployment-test", client_email: "test@example.test", private_key: "test-key" }),
};
for (const key of ["FIREBASE_AUTH_EMULATOR_HOST", "FIRESTORE_EMULATOR_HOST", "VITE_AUTH_EMULATOR_URL", "FIREBASE_DATABASE_EMULATOR_HOST", "FIREBASE_EMULATOR_HUB"]) {
  test(`production build and runtime reject ${key}`, () => {
    const env = { ...valid, [key]: "localhost:9099" };
    assert.throws(() => assertNoProductionEmulators(env), /must not use/);
    for (const deployment of [{ NODE_ENV: "production" }, { VERCEL: "1" }])
      assert.throws(() => resolveFirebaseConfig({ ...env, ...deployment }), error => error.status === 503 && /must not use/.test(error.message));
  });
}
test("production requires an HTTPS origin and matching Firebase configuration", () => {
  for (const value of [undefined, "", "not-a-url", "http://example.test", "https://example.test/path", "https://example.test/?q=1", "https://example.test/#x", "https://user:pass@example.test"])
    assert.throws(() => resolveFirebaseConfig({ ...valid, NODE_ENV: "production", APP_ORIGIN: value }), error => error.status === 503);
  assert.equal(productionOrigin(" https://personacv.vercel.app/ "), valid.APP_ORIGIN);
  assert.equal(resolveFirebaseConfig({ ...valid, NODE_ENV: "production" }).emulators, false);
  assert.throws(() => resolveFirebaseConfig({ ...valid, NODE_ENV: "production", VITE_projectId: "other" }), /do not match/);
});
test("API accepts the configured origin and rejects foreign origins before writes", async (t) => {
  const previous = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = " https://personacv.vercel.app/ ";
  t.after(() => { if (previous === undefined) delete process.env.APP_ORIGIN; else process.env.APP_ORIGIN = previous; });
  let writes = 0;
  const server = createApp({ auth: { verifyIdToken: async () => ({ uid: "test" }) }, service: { account: async () => {}, save: async (_uid, body) => { writes++; return body; } } });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  const request = origin => fetch(`http://127.0.0.1:${server.address().port}/api/workspace`, { method: "PUT", headers: { Origin: origin, Authorization: "Bearer test", "Content-Type": "application/json" }, body: JSON.stringify({ revision: 3 }) });
  assert.equal((await request("https://foreign.example")).status, 403);
  assert.equal(writes, 0);
  const response = await request(valid.APP_ORIGIN);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { revision: 3 });
  assert.equal(writes, 1);
});