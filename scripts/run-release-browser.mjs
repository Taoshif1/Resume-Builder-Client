import assert from "node:assert/strict";

const targets = [
  "http://127.0.0.1:3000/api/health",
  "http://127.0.0.1:5173/",
];

async function waitFor(url) {
  const deadline = Date.now() + 60_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError?.message}`);
}

const [healthResponse] = await Promise.all(targets.map(waitFor));
const health = await healthResponse.json();
assert.equal(health.firebase?.emulator, true, "E2E requires Firebase emulator mode.");
assert.equal(process.env.FIREBASE_PROJECT_ID, "demo-personacv", "E2E requires the demo project.");
await import("./release-browser.mjs");
