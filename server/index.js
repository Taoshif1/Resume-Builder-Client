import "./env.js";
import { firebaseServices } from "./firebase.js";
import { createApp } from "./app.js";

const server = createApp(firebaseServices());
server.requestTimeout = 35000;
server.headersTimeout = 15000;
server.listen(Number(process.env.PORT || 3000), "0.0.0.0", () =>
  console.log(
    "PersonaCV API listening; check /api/health for Firebase readiness.",
  ),
);
