import test from "node:test";
import assert from "node:assert/strict";
import { requestApi } from "./api-client.js";

for (const status of [401, 403, 409, 429, 503]) {
  test(`API ${status} keeps the user signed in and only 401 retries once`, async (t) => {
    const refreshes = [];
    const user = {
      uid: "alice",
      getIdToken: async (force) => {
        refreshes.push(force);
        return "test-token";
      },
    };
    const auth = { currentUser: user };
    t.mock.method(
      globalThis,
      "fetch",
      async () =>
        new Response(JSON.stringify({ error: "Server response" }), {
          status,
          headers: { "content-type": "application/json" },
        }),
    );
    await assert.rejects(
      requestApi(auth, "", "/account"),
      (error) => error.status === status,
    );
    assert.deepEqual(refreshes, status === 401 ? [false, true] : [false]);
    assert.equal(auth.currentUser, user);
  });
}
test("a refreshed 401 request can succeed", async (t) => {
  let calls = 0;
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(JSON.stringify({ account: {} }), {
        status: ++calls === 1 ? 401 : 200,
        headers: { "content-type": "application/json" },
      }),
  );
  const auth = {
    currentUser: { uid: "alice", getIdToken: async () => "test-token" },
  };
  assert.deepEqual(await requestApi(auth, "", "/account"), { account: {} });
  assert.equal(calls, 2);
});
