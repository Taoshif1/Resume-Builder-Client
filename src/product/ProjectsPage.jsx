import { useState } from "react";
import { useWorkspace } from "./workspaceContext";
import { Field, OrderButtons } from "./Fields";
import {
  importRepositories,
  mutateWorkspace,
  move,
  removeRecord,
  safeUrl,
} from "./operations";
import { newId, PROJECT_FIELDS } from "../resume/data/workspace";
import { api } from "./api";

export default function ProjectsPage() {
  const { workspace, update, entitlements, features } = useWorkspace();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [sort, setSort] = useState("manual");
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const edit = (fn) => update((w) => mutateWorkspace(w, fn));
  async function fetchRepos(nextPage = 1) {
    setBusy(true);
    setMessage("");
    try {
      const data = await api(
        `/github?username=${encodeURIComponent(username)}&page=${nextPage}`,
      );
      setRepos((old) =>
        nextPage === 1 ? data.repositories : [...old, ...data.repositories],
      );
      setPage(nextPage);
      setHasMore(data.hasMore);
      if (nextPage === 1) setSelected([]);
      if (!data.repositories.length)
        setMessage("No public repositories found.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  const visible = workspace.projects.filter(
    (p) =>
      (filter === "all" ||
        (filter === "archived") === (p.metadata?.visibility === "archived")) &&
      `${p.resumeData.title} ${p.resumeData.techStack} ${p.metadata?.tags || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  if (sort === "name")
    visible.sort((a, b) =>
      a.resumeData.title.localeCompare(b.resumeData.title),
    );
  return (
    <main className="pcv-page">
      <header>
        <p className="pcv-eyebrow">BUILD ON WHAT YOU HAVE SHIPPED</p>
        <h1>Project library</h1>
        <p>
          Reusable projects, with your writing kept separate from imported
          GitHub facts.
        </p>
      </header>
      <section className="pcv-card">
        <div className="pcv-row">
          <h2>{workspace.projects.length} projects</h2>
          <button
            disabled={workspace.projects.length >= entitlements.maxProjects}
            onClick={() =>
              edit((w) => {
                w.projects.push({
                  id: newId(),
                  source: "manual",
                  sourceData: {},
                  resumeData: {
                    title: "Untitled project",
                    techStack: "",
                    liveLink: "",
                    description: "",
                  },
                });
              })
            }
          >
            Add project
          </button>
        </div>
        <div className="pcv-fields">
          <Field
            label="Search names, technologies or tags"
            value={search}
            onChange={setSearch}
          />
          <label className="pcv-field">
            Visibility
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </label>
          <label className="pcv-field">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="manual">Your order</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
      </section>
      <details className="pcv-card">
        <summary>Import or refresh public GitHub repositories</summary>
        <p>
          Descriptions from GitHub appear as source facts. Write your own
          achievements below; refresh never replaces them.
        </p>
        <Field
          label="GitHub username"
          value={username}
          onChange={setUsername}
        />
        <button
          disabled={busy || !features.publicGithub}
          onClick={() => fetchRepos()}
        >
          {busy ? "Fetching…" : "Find public repositories"}
        </button>
        {message && <p role="status">{message}</p>}
        <div className="pcv-repos">
          {repos.map((repo) => (
            <label key={repo.id}>
              <input
                type="checkbox"
                checked={selected.includes(repo.id)}
                onChange={(e) =>
                  setSelected((old) =>
                    e.target.checked
                      ? [...old, repo.id]
                      : old.filter((id) => id !== repo.id),
                  )
                }
              />
              {repo.name}
              <span className="pcv-muted"> {repo.language}</span>
            </label>
          ))}
        </div>
        {hasMore && (
          <button disabled={busy} onClick={() => fetchRepos(page + 1)}>
            Load more repositories
          </button>
        )}
        {repos.length > 0 && (
          <button
            disabled={!selected.length}
            onClick={() => {
              const chosen = repos.filter((r) => selected.includes(r.id));
              const newCount = chosen.filter(
                (r) =>
                  !workspace.projects.some(
                    (p) => p.sourceData.githubRepoId === r.id,
                  ),
              ).length;
              if (
                workspace.projects.length + newCount >
                entitlements.maxProjects
              ) {
                setMessage(
                  "Project limit reached. Select fewer repositories or upgrade.",
                );
                return;
              }
              update((w) => importRepositories(w, chosen));
              setMessage(
                "Selected repositories imported or refreshed. Save your workspace to sync.",
              );
            }}
          >
            Import / refresh selected
          </button>
        )}
      </details>
      {!visible.length && (
        <section className="pcv-card">
          <h2>No projects here yet</h2>
          <p>Add a project manually or choose public repositories above.</p>
        </section>
      )}
      {visible.map((project) => {
        const index = workspace.projects.findIndex((p) => p.id === project.id);
        return (
          <section className="pcv-card" key={project.id}>
            <div className="pcv-row">
              <h2>{project.resumeData.title || "Untitled project"}</h2>
              <div>
                <OrderButtons
                  index={index}
                  length={workspace.projects.length}
                  name="project"
                  onMove={(delta) =>
                    edit((w) => {
                      w.projects = move(w.projects, index, delta);
                    })
                  }
                />
                <button
                  disabled={
                    workspace.projects.length >= entitlements.maxProjects
                  }
                  onClick={() =>
                    edit((w) => {
                      w.projects.push({
                        ...structuredClone(project),
                        id: newId(),
                        resumeData: {
                          ...project.resumeData,
                          title: `${project.resumeData.title} copy`,
                        },
                      });
                    })
                  }
                >
                  Duplicate
                </button>
                <button
                  onClick={() =>
                    edit((w) => {
                      const p = w.projects.find((p) => p.id === project.id);
                      p.metadata = {
                        ...p.metadata,
                        visibility:
                          p.metadata?.visibility === "archived"
                            ? "active"
                            : "archived",
                      };
                    })
                  }
                >
                  {project.metadata?.visibility === "archived"
                    ? "Restore"
                    : "Archive"}
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete this project and remove it from all resume variants?",
                      )
                    )
                      update((w) => removeRecord(w, "projects", project.id));
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="pcv-fields">
              {PROJECT_FIELDS.map((field) => (
                <Field
                  key={field}
                  label={
                    {
                      title: "Project name",
                      techStack: "Technologies",
                      liveLink: "Live URL",
                      description:
                        "Your description / achievement bullets (one per line)",
                    }[field]
                  }
                  value={project.resumeData[field]}
                  multiline={field === "description"}
                  onChange={(value) =>
                    edit((w) => {
                      w.projects.find((p) => p.id === project.id).resumeData[
                        field
                      ] = value;
                    })
                  }
                />
              ))}
              {[
                "shortName",
                "role",
                "tags",
                "githubUrl",
                "startDate",
                "endDate",
              ].map((field) => (
                <Field
                  key={field}
                  label={field.replace(/([A-Z])/g, " $1")}
                  value={project.metadata?.[field]}
                  onChange={(value) =>
                    edit((w) => {
                      const p = w.projects.find((p) => p.id === project.id);
                      p.metadata = { ...p.metadata, [field]: value };
                    })
                  }
                />
              ))}
            </div>
            {project.resumeData.liveLink &&
              !safeUrl(project.resumeData.liveLink) && (
                <p role="alert">
                  Use a complete http:// or https:// URL. Invalid URLs are
                  omitted from exports.
                </p>
              )}
            {project.source === "github" && (
              <aside className="pcv-notice">
                <strong>GitHub source facts</strong>
                <p>
                  {project.sourceData.githubDescription ||
                    "No repository description."}
                </p>
                <a
                  href={safeUrl(project.sourceData.repoUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {project.sourceData.repoUrl}
                </a>
                <p>Last refreshed: {project.sourceData.lastSyncedAt}</p>
              </aside>
            )}
          </section>
        );
      })}
    </main>
  );
}
