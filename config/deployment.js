// Shared build/runtime checks. Values are never included in error messages.
export function assertNoProductionEmulators(env) {
  const configured = Object.keys(env).some((key) =>
    (/(?:^|_)EMULATOR_(?:HOST|URL)$/.test(key) || key === "FIREBASE_EMULATOR_HUB") &&
    String(env[key] || "").trim(),
  );
  if (configured) throw new Error("Production must not use Firebase emulators.");
}

export function productionOrigin(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error("PersonaCV server APP_ORIGIN is not configured.");
  let url;
  try { url = new URL(text); } catch { /* Report only the variable name. */ }
  if (!url || url.protocol !== "https:" || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash)
    throw new Error("APP_ORIGIN must be an HTTPS origin without a path, credentials, query or fragment.");
  return url.origin;
}
