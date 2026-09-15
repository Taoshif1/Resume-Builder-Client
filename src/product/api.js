import { auth } from "../services/firebase";
export async function api(
  path,
  { method = "GET", body, signal, blob = false } = {},
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in required.");
  const token = await user.getIdToken();
  const response = await fetch(`/api${path}`, {
    method,
    signal,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (auth.currentUser?.uid !== user.uid)
    throw new Error("Account changed. Please retry.");
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw Object.assign(
      new Error(data.error || "Unable to contact PersonaCV. Please try again."),
      { status: response.status },
    );
  }
  return blob ? response.blob() : response.json();
}
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
