import { firebaseServices } from "./firebase.js";
import { createApp } from "./app.js";

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.APP_ORIGIN ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.FIRESTORE_EMULATOR_HOST)
)
  throw new Error("Production requires APP_ORIGIN and must not use emulators.");
const server = createApp(firebaseServices());
server.requestTimeout = 35000;
server.headersTimeout = 15000;
server.listen(Number(process.env.PORT || 3000), "0.0.0.0", () =>
  console.log("PersonaCV server is ready."),
);
