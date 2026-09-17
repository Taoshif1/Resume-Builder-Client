import { auth } from "../services/firebase";
import { requestApi } from "./api-client.js";

export function api(path, options) {
  return requestApi(
    auth,
    (import.meta.env.VITE_API_URL || "").replace(/\/$/, ""),
    path,
    options,
  );
}

export { downloadBlob } from "./download.js";
