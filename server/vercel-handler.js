import { createApp } from "./app.js";
import { firebaseServices } from "./firebase.js";

const app = createApp(firebaseServices());

export function handleVercelRequest(req, res) {
  app.emit("request", req, res);
}
