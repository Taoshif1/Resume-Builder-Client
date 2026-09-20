import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
};

for (const key of Object.keys(firebaseConfig))
  firebaseConfig[key] = firebaseConfig[key]?.trim();
if (import.meta.env.DEV)
  console.info("PersonaCV Firebase configuration", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    environment: import.meta.env.MODE,
    requiredConfigPresent: Object.values(firebaseConfig).every(Boolean),
  });
let auth = null;
let authConfigurationError = "";
try {
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.appId
  )
    throw new Error("Missing Firebase configuration");
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  if (import.meta.env.DEV && import.meta.env.VITE_AUTH_EMULATOR_URL)
    connectAuthEmulator(auth, import.meta.env.VITE_AUTH_EMULATOR_URL);
} catch {
  authConfigurationError = "PersonaCV sign-in is unavailable because this deployment's Firebase configuration is incomplete or invalid.";
}
export { auth, authConfigurationError };
