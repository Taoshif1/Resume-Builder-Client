import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router";
export default function PublicInfo({ type }) {
  const { user } = useContext(AuthContext);
  return (
    <article className="pcv-page" style={{ color: "#172033" }}>
      <h1>
        {type === "privacy"
          ? "Privacy information"
          : type === "terms"
            ? "Terms of use"
            : "Contact PersonaCV"}
      </h1>
      <section className="pcv-card">
        {type === "privacy" ? (
          <>
            <p>
              PersonaCV stores your account identity through Firebase
              Authentication and your saved profile, projects, resumes, feedback
              and usage counts in the configured Firebase project. This
              information supports account access, resume generation and product
              administration.
            </p>
            <p>
              Workspace edits are also backed up in this browser under your
              account UID. On shared devices, sign out and clear site data after
              downloading any backup you need.
            </p>
            <p>
              Public GitHub imports request repository metadata. Optional AI
              writing sends only the text you choose to the configured provider
              when you request a suggestion.
            </p>
            <p>
              Download your data from account settings. Submit an account or
              data deletion request through feedback; the owner can delete the
              account and its content.
            </p>
          </>
        ) : type === "terms" ? (
          <>
            <p>
              Use PersonaCV to create resumes using information you have
              permission to share. You are responsible for reviewing exported
              content and verifying every qualification and factual claim.
            </p>
            <p>
              Resume quality checks and job keyword comparisons provide writing
              guidance. They do not guarantee compatibility with every applicant
              tracking system or any hiring outcome.
            </p>
            <p>
              Do not use the service for abuse, impersonation or unauthorized
              access. Accounts may be suspended for misuse. Keep independent
              backups of important documents.
            </p>
            <p>
              Pro access is assigned by the owner while online billing is
              unavailable. No payment is collected through this application.
            </p>
          </>
        ) : (
          <>
            <p>Need help with your profile, a resume, or access to Pro? Feedback & support in Settings sends your message directly to the product owner.</p>
            {!user && <p>Sign in to send a request linked to your account. If you cannot sign in, use Forgot password on the sign-in page. Google accounts can use Continue with Google. Public guides and pricing are available without an account.</p>}
            <p>For a save or export issue, include what you were doing and the error message. Never include passwords, tokens or private credentials.</p>
            <Link to="/features">Explore features</Link> · <Link to="/pricing">Free & Pro plans</Link>
          </>
        )}
        <Link className="pcv-button" to={user ? "/dashboard/settings#support" : "/get-started"}>{user ? "Account settings & support" : "Sign in for account support"}</Link>
      </section>
    </article>
  );
}
