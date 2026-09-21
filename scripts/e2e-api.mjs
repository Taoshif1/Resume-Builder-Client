import assert from "node:assert/strict";
import { firebaseServices, resolveFirebaseConfig } from "../server/firebase.js";
import { createApp } from "../server/app.js";

assert.equal(process.env.FIREBASE_PROJECT_ID, "demo-personacv", "E2E requires demo-personacv.");
for (const key of ["FIREBASE_AUTH_EMULATOR_HOST", "FIRESTORE_EMULATOR_HOST"]) {
  assert.match(process.env[key] || "", /^(127\.0\.0\.1|localhost):\d+$/, `${key} must point to a local emulator.`);
}
assert.equal(new URL(process.env.APP_ORIGIN).hostname, "127.0.0.1");
const config = resolveFirebaseConfig();
assert.equal(config.projectId, "demo-personacv");
assert.equal(config.emulators, true);
const services = firebaseServices();
if (services.configurationError) throw services.configurationError;
// The exhaustive sweep needs a larger budget; production keeps its default 90.
const server = createApp({ ...services, requestLimit: 1_000 });
server.requestTimeout = 35_000;
server.headersTimeout = 15_000;
server.listen(Number(process.env.PORT || 3000), "127.0.0.1", () =>
  console.log("PersonaCV isolated E2E API listening."),
);
