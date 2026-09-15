import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import { loginUser, registerUser, googleLogin } from "../services/auth";
import { Field } from "./Fields";
export default function AuthForm({ register = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const destination =
    location.state?.from?.startsWith("/") &&
    !location.state.from.startsWith("//") &&
    !location.state.from.includes("\\")
      ? location.state.from
      : "/dashboard";
  async function action(fn, redirect = true) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      if (redirect) navigate(destination, { replace: true });
      else
        setMessage(
          "If this email has an account, a password reset link has been requested.",
        );
    } catch (e) {
      setMessage(
        e.code === "auth/weak-password"
          ? "Use a stronger password with at least 8 characters."
          : e.code === "auth/popup-closed-by-user"
            ? "Sign-in window closed. Try again when ready."
            : "Unable to complete the request. Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="pcv-card"
      style={{ color: "#172033" }}
      onSubmit={(e) => {
        e.preventDefault();
        action(() =>
          register ? registerUser(email, password) : loginUser(email, password),
        );
      }}
    >
      <h1>{register ? "Create your account" : "Welcome back"}</h1>
      <p>Build your developer profile with PersonaCV.</p>
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        autoComplete="email"
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        minLength={register ? 8 : 1}
        autoComplete={register ? "new-password" : "current-password"}
      />
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
      </button>
      {!register && (
        <button
          className="btn btn-ghost w-full"
          type="button"
          disabled={busy || !email}
          onClick={() =>
            action(() => sendPasswordResetEmail(auth, email), false)
          }
        >
          Forgot password
        </button>
      )}
      <button
        className="btn btn-outline w-full mt-3"
        type="button"
        disabled={busy}
        onClick={() => action(googleLogin)}
      >
        Continue with Google
      </button>
      {message && (
        <p role="status" className="pcv-notice">
          {message}
        </p>
      )}
      <p className="mt-4">
        {register ? "Already have an account?" : "New to PersonaCV?"}{" "}
        <Link to={register ? "/get-started" : "/get-started/register"}>
          {register ? "Sign in" : "Create account"}
        </Link>
      </p>
    </form>
  );
}
