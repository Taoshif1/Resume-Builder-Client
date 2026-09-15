import { createApp } from "../server/app.js";
import { firebaseServices } from "../server/firebase.js";

const app = createApp(firebaseServices());

export default function handler(req, res) {
  app.emit("request", req, res);
}
