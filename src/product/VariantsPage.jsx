import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useWorkspace } from "./workspaceContext";
import { addVariant, mutateWorkspace } from "./operations";
import { Field } from "./Fields";

export default function VariantsPage() {
  const { workspace, update, entitlements } = useWorkspace();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState(false);
  const limitReached = workspace.resumeVariants.length >= entitlements.maxVariants;
  const visible = workspace.resumeVariants.filter(v => Boolean(v.archived) === archived && `${v.name} ${v.labels || ""} ${v.targetRole || ""} ${v.company || ""}`.toLowerCase().includes(search.toLowerCase()));
  function create(original) {
    const next = addVariant(workspace, original);
    update(next);
    navigate(`/resume/${next.resumeVariants.at(-1).id}`);
  }
  return (
    <main className="pcv-page">
      <header>
        <p className="pcv-eyebrow">ONE PROFILE, MANY OPPORTUNITIES</p>
        <h1>Resume variants</h1>
        <p>
          Choose content for each role without changing your master profile.
        </p>
      </header>
      <section className="pcv-card">
        <div className="pcv-row">
          <h2>{workspace.resumeVariants.length} resumes</h2>
          <button className="pcv-primary"
            disabled={
              workspace.resumeVariants.length >= entitlements.maxVariants
            }
            onClick={() => create()}
          >
            Create resume
          </button>
        </div>
        {limitReached && <p className="pcv-notice" role="status">You have reached your resume limit ({entitlements.maxVariants}). Delete an unused variant to free space, or <Link to="/dashboard/settings#plan">request Pro access in Settings</Link>. Archived resumes count toward this limit.</p>}
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
      {!visible.length && <section className="pcv-card"><h2>{search ? "No matching resumes" : archived ? "No archived resumes" : "Your next opportunity starts here"}</h2><p>{search ? "Try a different name, role or label." : archived ? "Archived resumes will appear here. Restore one whenever you need it." : "Create a resume, choose your strongest evidence, and tailor it to a role."}</p>{search && <button onClick={() => setSearch("")}>Clear search</button>}</section>}
      <div className="pcv-grid">
        {visible.map((v) => (
            <article key={v.id} className="pcv-card">
              <h2>
                <Link to={`/resume/${v.id}`}>{v.name}</Link>
              </h2>
              <p>
                {v.targetRole || "General developer resume"}
                {v.company ? ` · ${v.company}` : ""}
              </p>
              <p className="pcv-muted">
                {v.projectIds.length} projects · {v.experienceIds.length}{" "}
                experience entries
              </p>
              <p><span className="pcv-badge">{v.template} template</span>{v.archived && <span className="pcv-badge">Archived</span>}{v.labels && <span className="pcv-badge">{v.labels}</span>}</p>
              <p className="pcv-muted">Updated {v.updatedAt ? new Date(v.updatedAt).toLocaleString() : "date unavailable"}</p>
              <div className="pcv-actions">
                <Link className="pcv-button" to={`/resume/${v.id}`}>
                  Edit resume
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
