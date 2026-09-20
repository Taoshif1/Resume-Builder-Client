export function initialAuthState(configurationError = "") {
  if (configurationError)
    return { status: "error", user: null, error: configurationError };
  return { status: "initializing", user: null, error: "" };
}

export function resolvedAuthState(user) {
  if (user) return { status: "authenticated", user, error: "" };
  return { status: "unauthenticated", user: null, error: "" };
}

export function failedAuthState() {
  return {
    status: "error",
    user: null,
    error: "We could not connect to the authentication service. Try again.",
  };
}
