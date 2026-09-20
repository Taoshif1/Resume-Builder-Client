const AUTH_MESSAGES = {
  "auth/account-exists-with-different-credential":
    "An account already exists with this email. Sign in with its original method, then connect Google from your account.",
  "auth/email-already-in-use": "An account already uses this email.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/missing-password": "Enter your password.",
  "auth/user-disabled": "This account is disabled. Contact support if you believe this is a mistake.",
  "auth/too-many-requests": "Too many sign-in attempts. Wait a moment, then try again.",
  "auth/weak-password": "Use at least 8 characters for your password.",
  "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow pop-ups and try again.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/cancelled-popup-request": "Google sign-in was cancelled.",
  "auth/network-request-failed": "We could not connect to the authentication service. Check your connection and try again.",
  "auth/internal-error": "The authentication service could not complete the request. Try again.",
};

export function authErrorMessage(error) {
  if (error && AUTH_MESSAGES[error.code]) return AUTH_MESSAGES[error.code];
  return "Unable to complete the authentication request. Please try again.";
}

export function safeAuthDestination(value) {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
  )
    return value;
  return "/dashboard";
}
