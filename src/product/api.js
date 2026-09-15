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

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
