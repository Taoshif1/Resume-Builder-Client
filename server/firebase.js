import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function serviceAccountFromEnv() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON. Replace it with the complete Firebase service-account JSON.",
    );
  }
}

export function firebaseServices() {
  const serviceAccount = serviceAccountFromEnv();
  const configuredProjectId = process.env.FIREBASE_PROJECT_ID || undefined;
  const credentialProjectId = serviceAccount?.project_id || undefined;

  if (
    configuredProjectId &&
    credentialProjectId &&
    configuredProjectId !== credentialProjectId
  ) {
    console.warn(
      "FIREBASE_PROJECT_ID does not match the service-account project. Using the service-account project.",
      {
        configuredProjectId,
        credentialProjectId,
      },
    );
  }

  // A supplied service account is authoritative. This prevents a stale
  // FIREBASE_PROJECT_ID from making Firebase Admin reject otherwise valid
  // browser ID tokens because their audience belongs to another project.
  const projectId = credentialProjectId || configuredProjectId;
  const usingEmulators = Boolean(
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
      process.env.FIRESTORE_EMULATOR_HOST,
  );

  const options = projectId ? { projectId } : {};
  if (!usingEmulators) {
    options.credential = serviceAccount
      ? cert(serviceAccount)
      : applicationDefault();
  }

  const app = getApps()[0] || initializeApp(options);
  return { auth: getAuth(app), db: getFirestore(app) };
}
