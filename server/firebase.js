import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export function firebaseServices() {
  const credentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const app = initializeApp({
    credential: credentials
      ? cert(JSON.parse(credentials))
      : applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  return { auth: getAuth(app), db: getFirestore(app) };
}
