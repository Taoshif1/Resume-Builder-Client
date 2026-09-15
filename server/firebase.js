import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export function firebaseServices() {
  const rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccount = rawCredentials ? JSON.parse(rawCredentials) : null;
  const projectId =
    process.env.FIREBASE_PROJECT_ID || serviceAccount?.project_id || undefined;
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
