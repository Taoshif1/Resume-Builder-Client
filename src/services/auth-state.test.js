import test from "node:test";
import assert from "node:assert/strict";
import { failedAuthState, initialAuthState, resolvedAuthState } from "./auth-state.js";
import { authErrorMessage, safeAuthDestination } from "./auth-errors.js";

test("auth bootstrap remains initializing until Firebase resolves", () => {
  assert.equal(initialAuthState().status, "initializing");
  assert.deepEqual(resolvedAuthState(null), { status: "unauthenticated", user: null, error: "" });
  const user = { uid: "alice" };
  assert.deepEqual(resolvedAuthState(user), { status: "authenticated", user, error: "" });
});

test("auth bootstrap exposes configuration and restoration failures", () => {
  assert.deepEqual(initialAuthState("Incomplete configuration"), { status: "error", user: null, error: "Incomplete configuration" });
  assert.match(failedAuthState().error, /authentication service/i);
});

test("Firebase errors become accurate user-facing messages", () => {
  assert.equal(authErrorMessage({ code: "auth/invalid-credential" }), "Incorrect email or password.");
  assert.match(authErrorMessage({ code: "auth/network-request-failed" }), /connect/i);
  assert.match(authErrorMessage({ code: "auth/popup-blocked" }), /pop-ups/i);
  assert.doesNotMatch(authErrorMessage({ code: "unknown" }), /unknown/);
});

test("post-auth redirects accept only local application paths", () => {
  assert.equal(safeAuthDestination("/resume/abc?mode=edit"), "/resume/abc?mode=edit");
  for (const unsafe of ["https://example.com", "//example.com", "/\\example.com", null])
    assert.equal(safeAuthDestination(unsafe), "/dashboard");
});
