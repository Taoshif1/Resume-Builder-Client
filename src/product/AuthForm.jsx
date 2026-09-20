import { useContext, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, authConfigurationError } from "../services/firebase";
import { loginUser, registerUser, googleLogin } from "../services/auth";
import { AuthContext } from "../context/AuthContext";
import { authErrorMessage, safeAuthDestination } from "../services/auth-errors";
import { Field } from "./Fields";
import AppLoader from "./AppLoader";

export default function AuthForm({ register = false }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useContext(AuthContext);

  const destination = safeAuthDestination(location.state?.from);

  async function action(fn, redirect = true) {
    setBusy(true);
    setMessage("");
    try {
      if (!auth)
        throw Object.assign(new Error(authConfigurationError), {
          code: "auth/configuration-not-found",
        });
      await fn();
      if (redirect) navigate(destination, { replace: true });
      else
        setMessage(
          "If this email has an account, a password reset link has been requested.",
        );
    } catch (error) {
      setMessage(
        error.code === "auth/configuration-not-found"
          ? authConfigurationError
          : authErrorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    if (register && password !== confirm)
      return setMessage("Passwords do not match.");
    if (register && password.length < 8)
      return setMessage("Use at least 8 characters for your password.");
    if (register && !terms)
      return setMessage(
        "Accept the terms and privacy acknowledgement to continue.",
      );
    action(() =>
      register
        ? registerUser(name, email, password)
        : loginUser(email, password),
    );
  }

  const title = register ? "Create your PersonaCV account" : "Welcome back";
  const intro = register
    ? "Start with your reusable profile, then tailor each application."
    : "Sign in to continue building focused, ATS-friendly resumes.";

  if (status === "initializing") return <AppLoader />;

  if (status === "authenticated")
    return <Navigate to={destination} replace />;

  const unavailable = status === "error" || Boolean(authConfigurationError);

  return (
    <main
      className={
        "pcv-page max-w-xl mx-auto py-12 " +
        (register ? "pcv-auth-signup" : "pcv-auth-login")
      }
    >
      <form
        data-theme="light"
        className="pcv-card pcv-auth-card space-y-4"
        onSubmit={submit}
        aria-busy={busy}
      >
        <p className="pcv-eyebrow">PERSONACV</p>
        <h1>{title}</h1>
        <p>{intro}</p>
        {register && (
          <Field
            label="Full name"
            value={name}
            onChange={setName}
            required
            autoComplete="name"
          />
        )}
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
          type={show ? "text" : "password"}
          value={password}
          onChange={setPassword}
          required
          minLength={register ? 8 : 1}
          autoComplete={register ? "new-password" : "current-password"}
        />
        <label className="flex gap-2 items-center text-sm">
          <input
            type="checkbox"
            checked={show}
            onChange={(event) => setShow(event.target.checked)}
          />
          Show password
        </label>
        {register && (
          <>
            <Field
              label="Confirm password"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={setConfirm}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-sm">
              Use at least 8 characters. A unique passphrase is best.
            </p>
            <label className="flex gap-2 text-sm items-start">
              <input
                type="checkbox"
                checked={terms}
                onChange={(event) => setTerms(event.target.checked)}
              />
              <span>
                I agree to the <Link to="/terms-of-service">Terms</Link> and{" "}
                <Link to="/privacy-policy">Privacy Policy</Link>.
              </span>
            </label>
          </>
        )}
        <button className="btn btn-primary w-full" disabled={busy || unavailable}>
          {busy ? "Please wait…" : register ? "Create Account" : "Sign In"}
        </button>
        {!register && (
          <button
            className="btn btn-ghost w-full"
            type="button"
            disabled={busy || !email || unavailable}
            onClick={() =>
              action(() => sendPasswordResetEmail(auth, email), false)
            }
          >
            Forgot Password
          </button>
        )}
        <button
          className="btn btn-outline w-full"
          type="button"
          disabled={busy || unavailable || (register && !terms)}
          onClick={() => action(googleLogin)}
        >
          Continue with Google
        </button>
        {(message || (unavailable && authConfigurationError)) && (
          <p role="status" className="pcv-notice">
            {message || authConfigurationError}
          </p>
        )}
        <p>
          {register ? "Already have an account?" : "Don't have an account?"}{" "}
          <Link
            to={register ? "/get-started" : "/get-started/register"}
            state={location.state}
          >
            {register ? "Sign in" : "Create one"}
          </Link>
        </p>
      </form>
    </main>
  );
}
