import { useEffect, useState } from "react";
import { useWorkspace } from "./workspaceContext";
import { api } from "./api";
import { Field } from "./Fields";

export default function AdminPage() {
  const { account } = useWorkspace();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (account.role !== "owner") return;
    const controller = new AbortController();
    api("/admin", { signal: controller.signal })
      .then(setData)
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [account.role]);
  if (account.role !== "owner")
    return (
      <main className="pcv-page">
        <h1>Owner access required</h1>
        <p>Your account does not have admin permissions.</p>
      </main>
    );
  async function action(path, method, body) {
    setBusy(true);
    setError("");
    try {
      await api(path, { method, body });
      setData(await api("/admin"));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return (
      <main className="pcv-state">
        <h1>Admin dashboard</h1>
        <p role="status">{error || "Loading account metrics…"}</p>
        <button
          onClick={() =>
            api("/admin")
              .then(setData)
              .catch((e) => setError(e.message))
          }
        >
          Retry
        </button>
      </main>
    );
  return (
    <main className="pcv-page">
      <header>
        <h1>Owner dashboard</h1>
        <p>Account access, usage and product configuration.</p>
      </header>
      {error && (
        <p role="alert" className="pcv-notice">
          {error}
        </p>
      )}
      <div className="pcv-grid">
        {Object.entries(data.metrics).map(([key, value]) => (
          <div className="pcv-card" key={key}>
            <p>{key}</p>
            <h2>{value}</h2>
          </div>
        ))}
      </div>
      <section className="pcv-card">
        <h2>Users</h2>
        <Field
          label="Search name, email or UID"
          value={search}
          onChange={setSearch}
        />
        <label className="pcv-field">
          Filter
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {["all", "free", "pro", "suspended"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        {data.users
          .filter(
            (u) =>
              `${u.displayName} ${u.email} ${u.uid}`
                .toLowerCase()
                .includes(search.toLowerCase()) &&
              (filter === "all" || u.plan === filter || u.status === filter),
          )
          .map((u) => (
            <details className="pcv-record" key={u.uid}>
              <summary>
                {u.displayName || u.email || u.uid} · {u.plan} · {u.status}
              </summary>
              <p>{u.email}</p>
              <p>UID: {u.uid}</p>
              <p>
                Role: {u.role} · Created: {u.createdAt}
              </p>
              <p>
                {u.projects || 0} projects · {u.variants || 0} variants ·{" "}
                {u.exports || 0} exports
              </p>
              {u.role !== "owner" && (
                <>
                  <div className="pcv-actions">
                    <button
                      disabled={busy}
                      onClick={() =>
                        action(
                          `/admin/users/${encodeURIComponent(u.uid)}`,
                          "PATCH",
                          { plan: u.plan === "pro" ? "free" : "pro" },
                        )
                      }
                    >
                      {u.plan === "pro"
                        ? "Downgrade to Free"
                        : "Upgrade to Pro"}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => {
                        if (
                          window.confirm(
                            `${u.status === "active" ? "Suspend" : "Reactivate"} this account?`,
                          )
                        )
                          action(
                            `/admin/users/${encodeURIComponent(u.uid)}`,
                            "PATCH",
                            {
                              status:
                                u.status === "active" ? "suspended" : "active",
                            },
                          );
                      }}
                    >
                      {u.status === "active" ? "Suspend" : "Reactivate"}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => {
                        if (
                          window.prompt(
                            "Permanently delete this account, workspace and feedback? Type the user UID to confirm.",
                          ) === u.uid
                        )
                          action(
                            `/admin/users/${encodeURIComponent(u.uid)}`,
                            "DELETE",
                          );
                      }}
                    >
                      Delete account & content
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      action(
                        `/admin/users/${encodeURIComponent(u.uid)}`,
                        "PATCH",
                        { notes: new FormData(e.currentTarget).get("notes") },
                      );
                    }}
                  >
                    <label className="pcv-field">
                      Admin notes
                      <textarea
                        name="notes"
                        defaultValue={u.notes || ""}
                        maxLength={2000}
                      />
                    </label>
                    <button disabled={busy}>Save notes</button>
                  </form>
                </>
              )}
            </details>
          ))}
      </section>
      <section className="pcv-card">
        <h2>Global settings</h2>
        {["publicGithub", "aiEnabled"].map((key) => (
          <label className="pcv-check" key={key}>
            <input
              type="checkbox"
              disabled={busy}
              checked={data.settings[key] !== false}
              onChange={(e) =>
                action("/admin/settings", "PUT", { [key]: e.target.checked })
              }
            />
            {key === "publicGithub"
              ? "Public GitHub imports"
              : "AI writing (also requires provider configuration)"}
          </label>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fields = new FormData(e.currentTarget);
            action("/admin/settings", "PUT", {
              plans: Object.fromEntries(
                ["free", "pro"].map((plan) => [
                  plan,
                  {
                    maxProjects: Number(fields.get(`${plan}Projects`)),
                    maxVariants: Number(fields.get(`${plan}Variants`)),
                  },
                ]),
              ),
            });
          }}
        >
          <h3>Plan limits</h3>
          {["free", "pro"].map((plan) => (
            <div className="pcv-fields" key={plan}>
              <label className="pcv-field">
                {plan} projects
                <input
                  name={`${plan}Projects`}
                  type="number"
                  min="1"
                  max="10000"
                  required
                  defaultValue={
                    data.settings.plans?.[plan]?.maxProjects ||
                    data.plans[plan].maxProjects
                  }
                />
              </label>
              <label className="pcv-field">
                {plan} variants
                <input
                  name={`${plan}Variants`}
                  type="number"
                  min="1"
                  max="10000"
                  required
                  defaultValue={
                    data.settings.plans?.[plan]?.maxVariants ||
                    data.plans[plan].maxVariants
                  }
                />
              </label>
            </div>
          ))}
          <button disabled={busy}>Save limits</button>
        </form>
        <h3>Template catalog</h3>
        {['minimal','corporate'].map(template => <label className="pcv-check" key={template}><input type="checkbox" disabled={busy} checked={(data.settings.enabledTemplates || ['modern','minimal','corporate']).includes(template)} onChange={e => action('/admin/settings','PUT',{enabledTemplates:e.target.checked?[...(data.settings.enabledTemplates || ['modern','minimal','corporate']),template]:(data.settings.enabledTemplates || ['modern','minimal','corporate']).filter(t=>t!==template)})}/>{template} available for new selections</label>)}
        <p>
          Modern: Free · Minimal and Corporate: Pro. All use semantic,
          single-column export content.
        </p>
        <p>
          Template implementations are versioned with the application; deploy
          reviewed code to change their layouts.
        </p>
      </section>
      <section className="pcv-card">
        <h2>Feedback (latest 100)</h2>
        {!data.feedback.length && <p>No feedback yet.</p>}
        {data.feedback.map((f) => (
          <article className="pcv-record" key={f.id}>
            <p>{f.message}</p>
            <p>
              {f.uid} · {f.createdAt} · {f.status}
            </p>
            {f.status !== "resolved" && (
              <button
                disabled={busy}
                onClick={() => action(`/admin/feedback/${f.id}`, "PATCH", {})}
              >
                Resolve
              </button>
            )}
          </article>
        ))}
      </section>
      <section className="pcv-card">
        <h2>System health</h2>
        <p>
          Authenticated API and Firestore responded successfully to this
          dashboard request. Request errors are recorded in server logs; inspect
          your hosting log console for details.
        </p>
      </section>
    </main>
  );
}
