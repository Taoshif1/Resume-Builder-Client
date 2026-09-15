import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const configurationError = (message) =>
  Object.assign(new Error(message), {
    status: 503,
    code: "firebase/server-configuration",
  });
function parseAccount(raw) {
  let account;
  try {
    account = JSON.parse(raw);
  } catch {
    throw configurationError(
      "Firebase Admin credentials must contain valid service-account JSON.",
    );
  }
  if (
    !account ||
    !["project_id", "client_email", "private_key"].every((key) =>
      clean(account[key]),
    )
  )
    throw configurationError(
      "Firebase Admin credentials require project_id, client_email and private_key.",
    );
  return {
    ...account,
    project_id: clean(account.project_id),
    client_email: clean(account.client_email),
    private_key: clean(account.private_key).replace(/\\n/g, "\n"),
  };
}
export function resolveFirebaseProjectId(
  env = process.env,
  serviceAccount = null,
) {
  const candidates = [
    serviceAccount?.project_id,
    env.FIREBASE_PROJECT_ID,
    env.VITE_projectId,
    env.GOOGLE_CLOUD_PROJECT,
    env.GCLOUD_PROJECT,
  ]
    .map(clean)
    .filter(Boolean);
  if (!candidates.length)
    throw configurationError(
      "PersonaCV server Firebase project ID is not configured.",
    );
  if (new Set(candidates).size !== 1)
    throw configurationError(
      "PersonaCV client and server Firebase project IDs do not match.",
    );
  return candidates[0];
}
export function resolveFirebaseConfig(env = process.env) {
  if ((env.NODE_ENV === "production" || env.VERCEL) && !clean(env.APP_ORIGIN))
    throw configurationError("PersonaCV server APP_ORIGIN is not configured.");
  const emulators = Boolean(
    clean(env.FIREBASE_AUTH_EMULATOR_HOST) ||
    clean(env.FIRESTORE_EMULATOR_HOST),
  );
  if (emulators && (env.NODE_ENV === "production" || env.VERCEL))
    throw configurationError("Production must not use Firebase emulators.");
  if (
    emulators &&
    !(
      clean(env.FIREBASE_AUTH_EMULATOR_HOST) &&
      clean(env.FIRESTORE_EMULATOR_HOST)
    )
  )
    throw configurationError(
      "Configure both Auth and Firestore emulators together.",
    );
  let serviceAccount = clean(env.FIREBASE_SERVICE_ACCOUNT_JSON)
    ? parseAccount(env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : null;
  const credentialPath = clean(env.GOOGLE_APPLICATION_CREDENTIALS);
  if (!serviceAccount && credentialPath && !emulators) {
    try {
      serviceAccount = parseAccount(readFileSync(credentialPath, "utf8"));
    } catch {
      throw configurationError(
        "GOOGLE_APPLICATION_CREDENTIALS must point to a readable, valid service-account file.",
      );
    }
  }
  const projectId = resolveFirebaseProjectId(env, serviceAccount);
  if (!emulators && !serviceAccount)
    throw configurationError(
      "PersonaCV server Firebase Admin credentials are not configured.",
    );
  return {
    projectId,
    serviceAccount,
    emulators,
    useApplicationDefault:
      !clean(env.FIREBASE_SERVICE_ACCOUNT_JSON) && Boolean(credentialPath),
  };
}
// Preserve an HTTP server even when configuration fails, so clients receive a safe 503.
export function firebaseServices() {
  let config;
  try {
    config = resolveFirebaseConfig();
    if (config.useApplicationDefault)
      process.env.GOOGLE_APPLICATION_CREDENTIALS = clean(
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
      );
    const options = { projectId: config.projectId };
    if (!config.emulators)
      options.credential = config.useApplicationDefault
        ? applicationDefault()
        : cert(config.serviceAccount);
    const app =
      getApps().find((app) => app.name === "personacv") ||
      initializeApp(options, "personacv");
    if (app.options.projectId !== config.projectId)
      throw configurationError(
        "Firebase Admin project changed; restart the server.",
      );
    const auth = getAuth(app);
    const db = getFirestore(app);
    let readyUntil = 0;
    let pending;
    const readiness = async () => {
      if (Date.now() < readyUntil) return;
      if (!pending)
        pending = (async () => {
          try {
            if (options.credential) await options.credential.getAccessToken();
            await db.collection("system").doc("settings").get();
            readyUntil = Date.now() + 30000;
          } catch (error) {
            const reason = error.details?.includes("API has not been used")
              ? "firestore-api-disabled"
              : error.code === 5
                ? "firestore-database-missing"
                : error.code === 7
                  ? "firestore-permission-denied"
                  : "firebase-infrastructure-unavailable";
            console.error("Firebase readiness failed", {
              reason,
              projectId: config.projectId,
            });
            throw configurationError(
              "PersonaCV server Firebase credentials or Firestore access are unavailable.",
            );
          } finally {
            pending = null;
          }
        })();
      await pending;
    };
    return {
      auth,
      db,
      readiness,
      firebase: {
        projectConfigured: true,
        adminCredentialConfigured: !config.emulators,
        emulator: config.emulators,
      },
    };
  } catch (error) {
    const safeError =
      error.status === 503
        ? error
        : configurationError(
            "PersonaCV server Firebase Admin credentials are invalid.",
          );
    let projectConfigured = false;
    try {
      projectConfigured = Boolean(resolveFirebaseProjectId());
    } catch {
      /* Invalid project configuration. */
    }
    return {
      configurationError: safeError,
      firebase: { projectConfigured, adminCredentialConfigured: false },
    };
  }
}
