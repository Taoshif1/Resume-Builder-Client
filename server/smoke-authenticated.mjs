import assert from "node:assert/strict";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Use a dedicated test account. Supply secrets via ignored env files or shell env only.
const base = process.env.SMOKE_BASE_URL || "http://localhost:3000";
if (!process.env.SMOKE_EMAIL || !process.env.SMOKE_PASSWORD)
  throw new Error(
    "Set SMOKE_EMAIL and SMOKE_PASSWORD for a dedicated test account in an ignored env file.",
  );
const app = initializeApp({
  apiKey: process.env.VITE_apiKey,
  projectId: process.env.VITE_projectId,
});
const auth = getAuth(app);
async function request(path, method = "GET", body) {
  const token = await auth.currentUser.getIdToken();
  const response = await fetch(base + "/api" + path, {
    method,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  console.log(`${method} /api${path}: ${response.status}`);
  assert.equal(
    response.status,
    200,
    `Authenticated ${path} failed; inspect runtime logs.`,
  );
  return response.json();
}
try {
  await signInWithEmailAndPassword(
    auth,
    process.env.SMOKE_EMAIL,
    process.env.SMOKE_PASSWORD,
  );
  await request("/account");
  const original = await request("/workspace");
  const changed = structuredClone(original);
  const marker = `PersonaCV smoke ${Date.now()}`;
  changed.workspace.profile.personalInfo.fullName = marker;
  await request("/workspace", "PUT", changed);
  const reloaded = await request("/workspace");
  assert.equal(reloaded.workspace.profile.personalInfo.fullName, marker);
  await signOut(auth);
  await signInWithEmailAndPassword(
    auth,
    process.env.SMOKE_EMAIL,
    process.env.SMOKE_PASSWORD,
  );
  await request("/account");
  const relogged = await request("/workspace");
  assert.equal(relogged.workspace.profile.personalInfo.fullName, marker);
  await request("/workspace", "PUT", {
    workspace: original.workspace,
    revision: relogged.revision,
  });
  console.log(
    "PASS: authenticated account, workspace save/reload and logout/login persistence; original workspace restored.",
  );
} catch (error) {
  console.error(
    error.code || "smoke-failed",
    "Authenticated smoke test failed. Inspect API status and runtime logs.",
  );
  process.exitCode = 1;
} finally {
  await signOut(auth);
  await deleteApp(app);
}
