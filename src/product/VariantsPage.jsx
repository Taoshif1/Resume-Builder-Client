import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useWorkspace } from "./workspaceContext";
import { addVariant, mutateWorkspace } from "./operations";
import { Field } from "./Fields";

export default function VariantsPage() {
  const { workspace, update, entitlements } = useWorkspace();
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState("resume");
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState(false);
  const limitReached =
    workspace.resumeVariants.length >= entitlements.maxVariants;
  const visible = workspace.resumeVariants.filter(
    (v) =>
      Boolean(v.archived) === archived &&
      `${v.name} ${v.labels || ""} ${v.targetRole || ""} ${v.company || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function create(original) {
    const next = addVariant(workspace, original, documentType);
    update(next);
    navigate(`/resume/${next.resumeVariants.at(-1).id}`);
  }
  return (
    <main className="pcv-page">
      <header>
        <p className="pcv-eyebrow">ONE PROFILE, MANY OPPORTUNITIES</p>
        <h1>Resumes &amp; CVs</h1>
        <p>
          Choose content for each role without changing your master profile.
        </p>
      </header>
      <section className="pcv-card">
        <div className="pcv-row">
          <h2>{workspace.resumeVariants.length} documents</h2>
          <label className="pcv-field">
            Document type
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <option value="resume">Resume</option>
              <option value="cv">CV</option>
            </select>
          </label>
          <button
            className="pcv-primary"
            disabled={
              workspace.resumeVariants.length >= entitlements.maxVariants
            }
            onClick={() => create()}
          >
            Create {documentType === "cv" ? "CV" : "resume"}
          </button>
        </div>
        {limitReached && (
          <p className="pcv-notice" role="status">
            You have reached your document limit ({entitlements.maxVariants}).
            Delete an unused variant to free space, or{" "}
            <Link to="/dashboard/settings#plan">
              request Pro access in Settings
            </Link>
            . Archived documents count toward this limit.
          </p>
        )}
        <Field
          label="Search names, roles, companies or labels"
          value={search}
          onChange={setSearch}
        />
        <label>
          <input
            type="checkbox"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
          />{" "}
          Show archived
        </label>
      </section>
      {!visible.length && (
        <section className="pcv-card">
          <h2>
            {search
              ? "No matching documents"
              : archived
                ? "No archived documents"
                : "Your next opportunity starts here"}
          </h2>
          <p>
            {search
              ? "Try a different name, role or label."
              : archived
                ? "Archived resumes and CVs will appear here. Restore one whenever you need it."
                : "Create a resume or CV, choose your strongest evidence, and tailor it to your goal."}
          </p>
          {search && (
            <button onClick={() => setSearch("")}>Clear search</button>
          )}
        </section>
      )}
      <div className="pcv-grid">
        {visible.map((v) => (
          <article key={v.id} className="pcv-card">
            <h2>
              <Link to={`/resume/${v.id}`}>{v.name}</Link>
            </h2>
            <p>
              {v.targetRole || (v.documentType === "cv" ? "General developer CV" : "General developer resume")}
              {v.company ? ` · ${v.company}` : ""}
            </p>
            <p className="pcv-muted">
              {v.projectIds.length} projects · {v.experienceIds.length}{" "}
              experience entries
            </p>
            <p>
              <span className="pcv-badge">
                {v.documentType === "cv" ? "CV" : "Resume"}
              </span>
              <span className="pcv-badge">{v.template} template</span>
              {v.archived && <span className="pcv-badge">Archived</span>}
              {v.labels && <span className="pcv-badge">{v.labels}</span>}
            </p>
            <p className="pcv-muted">
              Updated{" "}
              {v.updatedAt
                ? new Date(v.updatedAt).toLocaleString()
                : "date unavailable"}
            </p>
            <div className="pcv-actions">
              <Link className="pcv-button" to={`/resume/${v.id}`}>
                Edit document
              </Link>
              <button
                disabled={
                  workspace.resumeVariants.length >= entitlements.maxVariants
                }
                onClick={() => create(v)}
              >
                Duplicate
              </button>
              <button
                onClick={() =>
                  update((w) =>
                    mutateWorkspace(w, (n) => {
                      n.resumeVariants.find((x) => x.id === v.id).archived =
                        !v.archived;
                    }),
                  )
                }
              >
                {v.archived ? "Restore" : "Archive"}
              </button>
              <button
                disabled={workspace.resumeVariants.length === 1}
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete “${v.name}”? Your master data will remain.`,
                    )
                  )
                    update((w) =>
                      mutateWorkspace(w, (n) => {
                        n.resumeVariants = n.resumeVariants.filter(
                          (x) => x.id !== v.id,
                        );
                      }),
                    );
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
