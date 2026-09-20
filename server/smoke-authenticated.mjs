import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Read-only by default. Explicit write checks require a dedicated test account.
const base = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const writeEnabled = process.env.SMOKE_WRITE === "1";
if (!process.env.SMOKE_EMAIL || !process.env.SMOKE_PASSWORD)
  throw new Error("Set SMOKE_EMAIL and SMOKE_PASSWORD for a dedicated test account in an ignored env file.");
const app = initializeApp({ apiKey: process.env.VITE_apiKey, projectId: process.env.VITE_projectId });
const auth = getAuth(app);
const login = () => signInWithEmailAndPassword(auth, process.env.SMOKE_EMAIL, process.env.SMOKE_PASSWORD);
let original, changed, writeAttempted = false;
async function request(path, method = "GET", body) {
  const token = await auth.currentUser.getIdToken();
  const response = await fetch(base + "/api" + path, {
    method, signal: AbortSignal.timeout(30000),
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  console.log(`${method} /api${path}: ${response.status}`);
  assert.equal(response.status, 200, `Authenticated ${path} failed; inspect runtime logs.`);
  return response.json();
}
try {
  await login(); await request("/account"); original = await request("/workspace");
  if (writeEnabled) {
    await mkdir(".artifacts", { recursive: true });
    await writeFile(`.artifacts/smoke-backup-${Date.now()}.json`, JSON.stringify(original, null, 2), { flag: "wx", mode: 0o600 });
    changed = structuredClone(original);
    changed.workspace.profile.personalInfo.fullName = `PersonaCV smoke ${Date.now()}`;
    writeAttempted = true;
    await request("/workspace", "PUT", changed);
  }
  await signOut(auth); await login(); await request("/account");
  const reloaded = await request("/workspace");
  assert.deepEqual(reloaded.workspace, writeEnabled ? changed.workspace : original.workspace);
  console.log(`PASS: authenticated account and logout/login persistence (${writeEnabled ? "write check; restoration pending" : "read-only; workspace unchanged"}).`);
} catch (error) {
  console.error(error.code || "smoke-failed", "Authenticated smoke test failed. Inspect API status and runtime logs.");
  process.exitCode = 1;
} finally {
  if (writeAttempted) {
    try {
      if (!auth.currentUser) await login();
      const current = await request("/workspace");
      if (JSON.stringify(current.workspace) !== JSON.stringify(original.workspace)) {
        // Never overwrite an intervening edit from another tab or device.
        assert.deepEqual(current.workspace, changed.workspace, "Concurrent edits detected; original backup retained locally. Restore manually after review.");
        await request("/workspace", "PUT", { workspace: original.workspace, revision: current.revision });
        assert.deepEqual((await request("/workspace")).workspace, original.workspace);
      }
      console.log("PASS: original workspace restored and verified.");
    } catch {
      console.error("RESTORATION FAILED: local .artifacts/smoke-backup-*.json retained. Review current cloud revision before restoring; do not rerun blindly.");
      process.exitCode = 1;
    }
  }
  await signOut(auth).catch(() => {}); await deleteApp(app);
}
