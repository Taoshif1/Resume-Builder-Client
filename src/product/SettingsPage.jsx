import { useContext, useEffect, useRef, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../services/firebase";
import { useWorkspace } from "./workspaceContext";
import { api } from "./api";
import { Field } from "./Fields";
import { assertWorkspace } from "../resume/data/workspace";

export default function SettingsPage() {
  const { user, logout } = useContext(AuthContext);
  const {
    workspace,
    update,
    account,
    entitlements,
    settings,
    backup,
    save,
    dirty,
  } = useWorkspace();
  const supportRef = useRef(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [history, setHistory] = useState([]);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [packQuantity, setPackQuantity] = useState(1);
  const [proPeriod, setProPeriod] = useState("monthly");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (account.role === "owner") return;
    const controller = new AbortController();
    api("/payments", { signal: controller.signal })
      .then(setPaymentData)
      .catch((e) => {
        if (!controller.signal.aborted) setMessage(e.message);
      });
    return () => controller.abort();
  }, [account.role]);
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
  const commerce = paymentData?.commerce || settings.commerce || {
    proMonthlyBdt: 499,
    proYearlyBdt: 4990,
    documentPackSize: 5,
    documentPackBdt: 100,
    paymentMethods: [],
  };
  const paymentMethods = commerce.paymentMethods || [];
  const selectedMethod = paymentMethods.find(
    (method) => method.id === paymentMethod,
  );
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
          Documents: {workspace.resumeVariants.length} /{" "}
          {account.role === "owner" ? "Unlimited" : entitlements.maxVariants}
        </p>
        {account.role !== "owner" && (
          <progress
            className="pcv-usage"
            aria-label="Document usage"
            value={workspace.resumeVariants.length}
            max={entitlements.maxVariants}
          />
        )}
        <p>
          Free includes master profile, 10 projects, 2 documents, public GitHub
          import and PDF export. Pro adds more capacity, templates, history and
          job targeting.
        </p>
        {account.role !== "owner" && (
          <p>
            Extra document slots purchased: {account.purchasedDocumentSlots || 0}.
            Manual payments are reviewed by the Owner before access changes.
          </p>
        )}
      </section>
      {account.role !== "owner" && (
        <section className="pcv-card" id="payments">
          <h2>Manual payments</h2>
          <p>
            Send the exact amount to an enabled account, then submit the transaction
            ID. Nothing is activated until the Owner verifies and approves it.
          </p>
          {!paymentMethods.length ? (
            <p className="pcv-notice">
              Manual payment numbers are not enabled right now. Use Feedback & support
              below if you need access.
            </p>
          ) : (
            <>
              <div className="pcv-payment-options">
                <form
                  className="pcv-record"
                  onSubmit={(e) => {
                    e.preventDefault();
                    action(async () => {
                      await api("/payments", {
                        method: "POST",
                        body: {
                          product: "document_pack",
                          quantity: Number(packQuantity),
                          method: paymentMethod,
                          transactionId,
                        },
                      });
                      setPaymentData(await api("/payments"));
                      setTransactionId("");
                      setMessage("Document-pack payment submitted for Owner review.");
                    });
                  }}
                >
                  <h3>Buy extra document slots</h3>
                  <p>
                    {commerce.documentPackSize} additional Resume/CV slots cost ৳
                    {commerce.documentPackBdt.toLocaleString("en-BD")} per pack.
                  </p>
                  <label className="pcv-field">
                    Quantity
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={packQuantity}
                      onChange={(e) => setPackQuantity(e.target.value)}
                    />
                  </label>
                  <p>
                    You receive{" "}
                    <strong>
                      {Number(packQuantity || 0) * commerce.documentPackSize}
                    </strong>{" "}
                    extra slots for{" "}
                    <strong>
                      ৳
                      {(
                        Number(packQuantity || 0) * commerce.documentPackBdt
                      ).toLocaleString("en-BD")}
                    </strong>
                    .
                  </p>
                  <label className="pcv-field">
                    Payment method
                    <select
                      required
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="">Choose method</option>
                      {paymentMethods.map((method) => (
                        <option value={method.id} key={method.id}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedMethod && (
                    <p className="pcv-payment-number">
                      Send to {selectedMethod.label}:{" "}
                      <strong>{selectedMethod.number}</strong>
                    </p>
                  )}
                  <label className="pcv-field">
                    Transaction ID
                    <input
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      maxLength="80"
                      autoComplete="off"
                    />
                  </label>
                  <button disabled={busy || !paymentMethod || !transactionId.trim()}>
                    Submit pack payment
                  </button>
                </form>

                <form
                  className="pcv-record"
                  onSubmit={(e) => {
                    e.preventDefault();
                    action(async () => {
                      await api("/payments", {
                        method: "POST",
                        body: {
                          product: "pro",
                          period: proPeriod,
                          method: paymentMethod,
                          transactionId,
                        },
                      });
                      setPaymentData(await api("/payments"));
                      setTransactionId("");
                      setMessage("Pro payment submitted for Owner review.");
                    });
                  }}
                >
                  <h3>Request Pro</h3>
                  <label className="pcv-field">
                    Billing period
                    <select
                      value={proPeriod}
                      onChange={(e) => setProPeriod(e.target.value)}
                    >
                      <option value="monthly">
                        Monthly · ৳{commerce.proMonthlyBdt.toLocaleString("en-BD")}
                      </option>
                      <option value="yearly">
                        Yearly · ৳{commerce.proYearlyBdt.toLocaleString("en-BD")}
                      </option>
                    </select>
                  </label>
                  <p>
                    Pro unlocks all bundled templates, history and job targeting.
                    Renewal is manually managed during this payment phase.
                  </p>
                  <label className="pcv-field">
                    Payment method
                    <select
                      required
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="">Choose method</option>
                      {paymentMethods.map((method) => (
                        <option value={method.id} key={method.id}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedMethod && (
                    <p className="pcv-payment-number">
                      Send to {selectedMethod.label}:{" "}
                      <strong>{selectedMethod.number}</strong>
                    </p>
                  )}
                  <label className="pcv-field">
                    Transaction ID
                    <input
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      maxLength="80"
                      autoComplete="off"
                    />
                  </label>
                  <button disabled={busy || !paymentMethod || !transactionId.trim()}>
                    Submit Pro payment
                  </button>
                </form>
              </div>
              <h3>Your recent payment requests</h3>
              {!paymentData?.requests?.length && <p>No requests submitted yet.</p>}
              {paymentData?.requests?.map((request) => (
                <div className="pcv-record" key={request.id}>
                  <div className="pcv-row">
                    <strong>
                      {request.product === "pro"
                        ? `Pro · ${request.period}`
                        : `${request.documentSlots} extra document slots`}
                    </strong>
                    <span className="pcv-badge">{request.status}</span>
                  </div>
                  <p>
                    ৳{request.amountBdt.toLocaleString("en-BD")} · {request.method} ·
                    Transaction {request.transactionId}
                  </p>
                </div>
              ))}
            </>
          )}
        </section>
      )}
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
