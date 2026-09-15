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
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

if (import.meta.env.DEV && import.meta.env.VITE_AUTH_EMULATOR_URL)
  connectAuthEmulator(auth, import.meta.env.VITE_AUTH_EMULATOR_URL);
