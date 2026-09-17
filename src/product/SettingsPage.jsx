import { useContext, useRef, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../services/firebase";
import { useWorkspace } from "./workspaceContext";
import { api } from "./api";
import { Field } from "./Fields";
import { assertWorkspace } from "../resume/data/workspace";

export default function SettingsPage() {
  const { user, logout } = useContext(AuthContext);
  const { workspace, update, account, entitlements, backup, save, dirty } =
    useWorkspace();
  const supportRef = useRef(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  async function action(fn) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="pcv-page">
      <header>
        <p className="pcv-eyebrow">MAKE IT YOURS</p>
        <h1>Account & settings</h1>
        <p>Your data, plan and account controls.</p>
      </header>
      {message && (
        <p className="pcv-notice" role="status">
          {message}
        </p>
      )}
      <section className="pcv-card">
        <h2>Account</h2>
        <p>{user.email}</p>
        <p>
          Plan: {account.plan} · Role: {account.role} · Status: {account.status}
        </p>
        <button
          disabled={busy}
          onClick={() =>
            action(async () => {
              await sendPasswordResetEmail(auth, user.email);
              setMessage("Password reset email requested. Check your inbox.");
            })
          }
        >
          Send password reset email
        </button>
        <button
          onClick={() => {
            if (
              !dirty ||
              window.confirm(
                "You have unsaved cloud changes. Sign out and keep the local backup?",
              )
            )
              logout();
          }}
        >
          Sign out
        </button>
      </section>
      <section className="pcv-card" id="plan">
        <h2>Plan & usage</h2>
        <p>
          Projects: {workspace.projects.length} /{" "}
          {account.role === "owner" ? "Unlimited" : entitlements.maxProjects}
        </p>
        {account.role !== "owner" && (
          <progress
            className="pcv-usage"
            aria-label="Project usage"
            value={workspace.projects.length}
            max={entitlements.maxProjects}
          />
        )}
        <p>
          Resumes: {workspace.resumeVariants.length} /{" "}
          {account.role === "owner" ? "Unlimited" : entitlements.maxVariants}
        </p>
        {account.role !== "owner" && (
          <progress
            className="pcv-usage"
            aria-label="Resume usage"
            value={workspace.resumeVariants.length}
            max={entitlements.maxVariants}
          />
        )}
        <p>
          Free includes master profile, 10 projects, 3 resumes, public GitHub
          import and PDF export. Pro adds more capacity, templates, history and
          job targeting.
        </p>
        <p>
          Online billing is not configured. Send a Pro access request below; the
          owner can assign your plan.
        </p>
        <button
          onClick={() => {
            setFeedback("I would like to request Pro access for my account.");
            supportRef.current?.scrollIntoView();
            supportRef.current?.querySelector("textarea")?.focus();
          }}
        >
          Request Pro access
        </button>
      </section>
      <section className="pcv-card">
        <h2>Data & backup</h2>
        <button onClick={() => backup()}>Download full workspace backup</button>
        <label className="pcv-field">
          Restore a backup for this account
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              action(async () => {
                if (file.size > 700000)
                  throw new Error("Backup exceeds 700 KB.");
                const value = JSON.parse(await file.text());
                assertWorkspace(value, user.uid);
                if (
                  window.confirm(
                    "Replace the open workspace with this backup? Save to update the cloud.",
                  )
                ) {
                  backup();
                  update(value);
                  setMessage("Backup loaded. Review and save to cloud.");
                }
              });
              event.target.value = "";
            }}
          />
        </label>
        <p>
          Restoring requires the same account UID. Your existing workspace is
          downloaded before replacement.
        </p>
      </section>
      <section className="pcv-card">
        <h2>Version history · Pro</h2>
        {entitlements.history ? (
          <>
            <button
              disabled={busy}
              onClick={() =>
                action(async () => {
                  if (dirty) await save();
                  const result = await api("/history", {
                    method: "POST",
                    body: { label: "Saved checkpoint" },
                  });
                  setHistory(result.history);
                  setMessage("Checkpoint saved.");
                })
              }
            >
              Save checkpoint
            </button>
            <button
              disabled={busy}
              onClick={() =>
                action(async () => setHistory((await api("/history")).history))
              }
            >
              Load history
            </button>
            <p>The most recent 20 checkpoints are retained.</p>
            {history.map((h) => (
              <div className="pcv-record" key={h.id}>
                <p>
                  {h.label} · {h.createdAt}
                </p>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Restore this checkpoint into the editor? Save to replace the cloud version.",
                      )
                    ) {
                      backup();
                      update(h.workspace);
                    }
                  }}
                >
                  Restore
                </button>
              </div>
            ))}
          </>
        ) : (
          <p>
            Upgrade to retain and restore workspace checkpoints. JSON backups
            are available on every plan.
          </p>
        )}
      </section>
      <section className="pcv-card" id="support" ref={supportRef}>
        <h2>Feedback & support</h2>
        <Field
          label="Message to the owner"
          multiline
          maxLength={5000}
          value={feedback}
          onChange={setFeedback}
        />
        <button
          disabled={busy || !feedback.trim()}
          onClick={() =>
            action(async () => {
              await api("/feedback", {
                method: "POST",
                body: { message: feedback },
              });
              setFeedback("");
              setMessage("Feedback submitted. Thank you.");
            })
          }
        >
          Submit feedback
        </button>
      </section>
    </main>
  );
}
