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


test("admin settings retries one transient 503 and succeeds without signing out", async (t) => {
  let calls = 0;
  const user = {
    uid: "owner",
    getIdToken: async () => "owner-token",
  };
  const auth = { currentUser: user };
  t.mock.method(globalThis, "fetch", async () => {
    calls += 1;
    if (calls === 1)
      return new Response("temporary upstream failure", {
        status: 503,
        headers: { "content-type": "text/plain" },
      });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
  assert.deepEqual(
    await requestApi(auth, "", "/admin/settings", {
      method: "PUT",
      body: { commerce: { version: 2 } },
    }),
    { ok: true },
  );
  assert.equal(calls, 2);
  assert.equal(auth.currentUser, user);
});

test("payment submission is never retried automatically", async (t) => {
  let calls = 0;
  const user = {
    uid: "alice",
    getIdToken: async () => "test-token",
  };
  const auth = { currentUser: user };
  t.mock.method(globalThis, "fetch", async () => {
    calls += 1;
    return new Response("gateway unavailable", {
      status: 503,
      headers: { "content-type": "text/plain" },
    });
  });
  await assert.rejects(
    requestApi(auth, "", "/payments", {
      method: "POST",
      body: {
        product: "document_pack",
        method: "bkash",
        transactionId: "ABC123",
      },
    }),
    (error) => error.status === 503,
  );
  assert.equal(calls, 1);
});
