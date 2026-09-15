import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { WorkspaceContext } from "./workspaceContext";
import { api, downloadBlob } from "./api";
import { assertWorkspace } from "../resume/data/workspace";
import {
  loadWorkspace,
  saveWorkspace,
} from "../resume/storage/workspaceStorage";
import { createLegacyMigrationCandidate } from "../resume/data/legacyMigration";

export default function WorkspaceProvider({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading)
    return (
      <main className="pcv-state" role="status">
        Checking your session…
      </main>
    );
  if (!user) return children;
  return (
    <AccountWorkspace key={user.uid} uid={user.uid}>
      {children}
    </AccountWorkspace>
  );
}

function AccountWorkspace({ uid, children }) {
  const { logout } = useContext(AuthContext);
  const [workspace, setWorkspace] = useState(null);
  const [saved, setSaved] = useState(null);
  const [revision, setRevision] = useState(0);
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState("Loading your workspace…");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [legacy, setLegacy] = useState(null);
  const [localCandidate, setLocalCandidate] = useState(null);
  const [retry, setRetry] = useState(0);
  const latest = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    async function initialize() {
      try {
        const accountData = await api("/account", {
          signal: controller.signal,
        });
        const cloud = await api("/workspace", { signal: controller.signal });
        if (controller.signal.aborted) return;
        assertWorkspace(cloud.workspace, uid);
        let local = null;
        try {
          local = loadWorkspace(uid);
          setLegacy(createLegacyMigrationCandidate());
        } catch (e) {
          setError(e.message);
        }
        setLocalCandidate(
          local && JSON.stringify(local) !== JSON.stringify(cloud.workspace)
            ? local
            : null,
        );
        setAccount(accountData);
        setWorkspace(cloud.workspace);
        latest.current = cloud.workspace;
        setSaved(JSON.stringify(cloud.workspace));
        setRevision(cloud.revision);
        setStatus(
          cloud.revision
            ? "Cloud workspace loaded"
            : "Ready for your first save",
        );
      } catch (e) {
        if (!controller.signal.aborted) {
          setError(e.message);
          setStatus("Unable to load cloud workspace");
        }
      }
    }
    initialize();
    return () => controller.abort();
  }, [uid, retry]);
  const dirty = workspace && JSON.stringify(workspace) !== saved;
  useEffect(() => {
    const guard = (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  function update(next) {
    try {
      const value = typeof next === "function" ? next(latest.current) : next;
      assertWorkspace(value, uid);
      latest.current = value;
      setWorkspace(value);
      try {
        saveWorkspace(value);
        setError("");
        setStatus("Unsaved cloud changes · local backup saved");
      } catch (e) {
        setError(e.message);
        setStatus("Unsaved changes");
      }
    } catch (e) {
      setError(e.message);
    }
  }
  async function save() {
    if (saving) throw new Error("A save is already in progress.");
    setSaving(true);
    setError("");
    const snapshot = latest.current;
    try {
      const result = await api("/workspace", {
        method: "PUT",
        body: { workspace: snapshot, revision },
      });
      setRevision(result.revision);
      setSaved(JSON.stringify(snapshot));
      setStatus("Saved to cloud");
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  }
  function backup(value = latest.current) {
    downloadBlob(
      new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
      "personacv-workspace.json",
    );
  }
  if (!workspace)
    return (
      <main className="pcv-state">
        <h1>{status}</h1>
        <button onClick={logout}>Sign out</button>
        {error && <p role="alert">{error}</p>}
        <button
          onClick={() => {
            setError("");
            setRetry((n) => n + 1);
          }}
        >
          Retry
        </button>
        <button
          onClick={() => {
            try {
              const local = loadWorkspace(uid);
              if (local) backup(local);
              else setError("No local backup was found.");
            } catch (e) {
              setError(e.message);
            }
          }}
        >
          Download local backup
        </button>
      </main>
    );
  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        update,
        account: account.account,
        entitlements: account.entitlements,
        features: account.features,
        billing: account.billing,
        settings: account.settings,
        save,
        saving,
        dirty,
        status,
        error,
        backup,
      }}
    >
      <div className="pcv-savebar">
        <span role="status">
          {saving ? "Saving…" : dirty ? "Unsaved cloud changes" : status}
        </span>
        <button
          disabled={saving || !dirty}
          onClick={() => save().catch(() => {})}
        >
          Save workspace
        </button>
        {error && <p role="alert">{error}</p>}
      </div>
      {localCandidate && (
        <aside className="pcv-notice">
          A different local backup exists for this account.{" "}
          <button onClick={() => backup(localCandidate)}>
            Download backup
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Replace this open workspace with the local backup? Cloud data changes only after Save.",
                )
              ) {
                update(localCandidate);
                setLocalCandidate(null);
              }
            }}
          >
            Review local version
          </button>
          <button onClick={() => setLocalCandidate(null)}>
            Keep cloud version
          </button>
        </aside>
      )}
      {legacy && (
        <aside className="pcv-notice">
          An older, unassigned resume exists in this browser. Import only if it
          belongs to you.{" "}
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Import this legacy resume into your open workspace? Download your current backup first. The original legacy data is preserved.",
                )
              ) {
                backup();
                update({ ...legacy.workspace, ownerUid: uid });
                setLegacy(null);
              }
            }}
          >
            Import legacy resume
          </button>
          <button onClick={() => setLegacy(null)}>Dismiss</button>
        </aside>
      )}
      {children}
    </WorkspaceContext.Provider>
  );
}
