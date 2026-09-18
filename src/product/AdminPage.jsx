import { useEffect, useState } from "react";
import { useWorkspace } from "./workspaceContext";
import { api } from "./api";
import { Field } from "./Fields";
import { DEFAULT_COMMERCE, PAYMENT_METHODS } from "./commerce";

export default function AdminPage() {
  const { account } = useWorkspace();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
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
  async function action(path, method, body, successMessage = "") {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(path, { method, body });
      if (successMessage) setNotice(successMessage);
      try {
        setData(await api("/admin"));
      } catch (refreshError) {
        setError(
          `${successMessage || "Change saved."} The dashboard could not refresh automatically: ${refreshError.message}`,
        );
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return (
      <main
        className="pcv-state pcv-loading-state"
        role="status"
        aria-live="polite"
        aria-busy={!error}
      >
        {!error && <div className="pcv-loader" aria-hidden="true" />}
        <h1>Admin dashboard</h1>
        <p>{error || "Loading users, payments and platform metrics…"}</p>
        {error && (
          <button
            onClick={() => {
              setError("");
              api("/admin")
                .then(setData)
                .catch((e) => setError(e.message));
            }}
          >
            Retry
          </button>
        )}
      </main>
    );
  return (
    <main className="pcv-page">
      <header>
        <p className="pcv-eyebrow">OWNER ADMINISTRATION</p>
        <h1>Owner dashboard</h1>
        <p>Account access, usage and product configuration.</p>
      </header>
      {busy && (
        <div className="pcv-admin-busy" role="status" aria-live="polite">
          <span className="pcv-loader pcv-loader-small" aria-hidden="true" />
          Updating admin data…
        </div>
      )}
      {notice && (
        <p role="status" className="pcv-notice pcv-notice-success">
          {notice}
        </p>
      )}
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
                {u.projects || 0} projects · {u.variants || 0} documents ·{" "}
                {u.exports || 0} exports · {u.purchasedDocumentSlots || 0} extra slots
              </p>
              {u.role !== "owner" && (
                <>
                  <div className="pcv-actions">
                    <button
                      disabled={busy}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Change this account to ${u.plan === "pro" ? "Free" : "Pro"}? Existing data is retained; new limits apply to future additions.`,
                          )
                        )
                          action(
                            `/admin/users/${encodeURIComponent(u.uid)}`,
                            "PATCH",
                            { plan: u.plan === "pro" ? "free" : "pro" },
                          );
                      }}
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
        <form
          key={JSON.stringify(data.settings.commerce || {})}
          onSubmit={(e) => {
            e.preventDefault();
            const fields = new FormData(e.currentTarget);
            action("/admin/settings", "PUT", {
              commerce: {
                version: DEFAULT_COMMERCE.version,
                proMonthlyBdt: Number(fields.get("proMonthlyBdt")),
                proYearlyBdt: Number(fields.get("proYearlyBdt")),
                documentPackSize: Number(fields.get("documentPackSize")),
                documentPackBdt: Number(fields.get("documentPackBdt")),
                paymentMethods: Object.fromEntries(
                  PAYMENT_METHODS.map(({ id }) => [
                    id,
                    {
                      enabled: fields.get(`${id}Enabled`) === "on",
                      number: fields.get(`${id}Number`) || "",
                    },
                  ]),
                ),
              },
            }, "Payment settings saved successfully.");
          }}
        >
          <h3>Manual payments</h3>
          <p className="pcv-muted">
            Control Bangladesh pricing and the payment numbers users see. Enter a
            number, tick "Enable" for that method, then save. Payments stay pending
            until you approve them below.
          </p>
          <div className="pcv-fields">
            <label className="pcv-field">
              Pro monthly (৳)
              <input
                name="proMonthlyBdt"
                type="number"
                min="1"
                max="100000"
                required
                defaultValue={data.settings.commerce?.proMonthlyBdt || 499}
              />
            </label>
            <label className="pcv-field">
              Pro yearly (৳)
              <input
                name="proYearlyBdt"
                type="number"
                min="1"
                max="1000000"
                required
                defaultValue={data.settings.commerce?.proYearlyBdt || 4990}
              />
            </label>
            <label className="pcv-field">
              Documents per pack
              <input
                name="documentPackSize"
                type="number"
                min="1"
                max="100"
                required
                defaultValue={data.settings.commerce?.documentPackSize || 1}
              />
            </label>
            <label className="pcv-field">
              Pack price (৳)
              <input
                name="documentPackBdt"
                type="number"
                min="1"
                max="100000"
                required
                defaultValue={data.settings.commerce?.documentPackBdt || 100}
              />
            </label>
          </div>
          <div className="pcv-payment-method-admin">
            {PAYMENT_METHODS.map(({ id, label }) => {
              const method = data.settings.commerce?.paymentMethods?.[id] || {};
              return (
                <div className="pcv-record" key={id}>
                  <label className="pcv-check">
                    <input
                      name={`${id}Enabled`}
                      type="checkbox"
                      defaultChecked={Boolean(method.enabled)}
                    />
                    Enable {label}
                  </label>
                  <label className="pcv-field">
                    {label} number
                    <input
                      name={`${id}Number`}
                      type="text"
                      inputMode="tel"
                      maxLength="50"
                      defaultValue={method.number || ""}
                      placeholder="01XXXXXXXXX"
                    />
                  </label>
                </div>
              );
            })}
          </div>
          <button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save payment settings"}
          </button>
          <div className="pcv-payment-admin-preview" aria-live="polite">
            <strong>Currently enabled for users:</strong>
            {PAYMENT_METHODS.filter(
              ({ id }) =>
                data.settings.commerce?.paymentMethods?.[id]?.enabled &&
                data.settings.commerce?.paymentMethods?.[id]?.number,
            ).length ? (
              <ul>
                {PAYMENT_METHODS.filter(
                  ({ id }) =>
                    data.settings.commerce?.paymentMethods?.[id]?.enabled &&
                    data.settings.commerce?.paymentMethods?.[id]?.number,
                ).map(({ id, label }) => (
                  <li key={id}>
                    {label}:{" "}
                    <strong>
                      {data.settings.commerce.paymentMethods[id].number}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No payment method is currently enabled.</p>
            )}
          </div>
        </form>
        <h3>Template catalog</h3>
        {["minimal", "corporate"].map((template) => (
          <label className="pcv-check" key={template}>
            <input
              type="checkbox"
              disabled={busy}
              checked={(
                data.settings.enabledTemplates || [
                  "modern",
                  "minimal",
                  "corporate",
                ]
              ).includes(template)}
              onChange={(e) =>
                action("/admin/settings", "PUT", {
                  enabledTemplates: e.target.checked
                    ? [
                        ...(data.settings.enabledTemplates || [
                          "modern",
                          "minimal",
                          "corporate",
                        ]),
                        template,
                      ]
                    : (
                        data.settings.enabledTemplates || [
                          "modern",
                          "minimal",
                          "corporate",
                        ]
                      ).filter((t) => t !== template),
                })
              }
            />
            {template} available for new selections
          </label>
        ))}
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
        <div className="pcv-row">
          <div>
            <h2>Manual payment requests</h2>
            <p className="pcv-muted">
              Verify the transaction in your bKash/Nagad/Rocket account before approval.
            </p>
          </div>
          <span className="pcv-badge">
            {data.paymentRequests.filter((request) => request.status === "pending").length} pending
          </span>
        </div>
        {!data.paymentRequests.length && <p>No payment requests yet.</p>}
        {data.paymentRequests.map((request) => (
          <article className="pcv-record" key={request.id}>
            <div className="pcv-row">
              <strong>
                {request.product === "pro"
                  ? `Pro · ${request.period}`
                  : `${request.documentSlots} extra documents`}
              </strong>
              <span className="pcv-badge">{request.status}</span>
            </div>
            <p>
              {request.email || request.uid} · ৳{request.amountBdt?.toLocaleString?.("en-BD") || request.amountBdt}
            </p>
            <p>
              {request.method}
              {request.receiverNumber ? ` · Sent to: ${request.receiverNumber}` : ""} · Transaction:{" "}
              <strong>{request.transactionId}</strong>
              {request.quantity > 1 ? ` · Quantity: ${request.quantity}` : ""}
            </p>
            <p className="pcv-muted">{request.createdAt}</p>
            {request.status === "pending" && (
              <div className="pcv-actions">
                <button
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Approve only after you have verified this transaction in the payment account.",
                      )
                    )
                      action(
                        `/admin/payments/${encodeURIComponent(request.id)}`,
                        "PATCH",
                        { action: "approve" },
                      );
                  }}
                >
                  Approve payment
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    action(
                      `/admin/payments/${encodeURIComponent(request.id)}`,
                      "PATCH",
                      { action: "reject" },
                    )
                  }
                >
                  Reject
                </button>
              </div>
            )}
          </article>
        ))}
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
