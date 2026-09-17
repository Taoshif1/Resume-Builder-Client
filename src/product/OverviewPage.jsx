import { Link } from "react-router";
import { FiCheckCircle, FiCircle, FiPlus, FiArrowRight } from "react-icons/fi";
import { useWorkspace } from "./workspaceContext";

export default function OverviewPage() {
  const { workspace, account } = useWorkspace();
  const { profile, projects, resumeVariants } = workspace;
  const info = profile.personalInfo;
  const steps = [
    ["Add contact information", Boolean(info.fullName && info.email), "/dashboard/profile"],
    ["Add at least one skill", profile.skills.some(s => s.name?.trim()), "/dashboard/profile#skills"],
    ["Add your experience or education", Boolean(profile.experience.length || profile.education.length), "/dashboard/profile#experience"],
    ["Add or import a project", projects.length > 0, "/dashboard/projects"],
    ["Tailor a resume", resumeVariants.some(v => v.targetRole?.trim()), "/dashboard/resumes"],
  ];
  const completed = steps.filter(([, done]) => done).length;
  const recent = [...resumeVariants].filter(v => !v.archived).sort((a,b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 4);
  return <main className="pcv-page">
    <header>
      <p className="pcv-eyebrow">YOUR NEXT CHAPTER</p>
      <h1>Welcome back{info.fullName ? `, ${info.fullName.split(" ")[0]}` : ""}</h1>
      <p>Your experience, ready for the next opportunity. Keep your foundation up to date and tailor a resume for each role.</p>
      <div className="pcv-actions">
        <Link className="pcv-button pcv-primary" to="/dashboard/resumes"><FiPlus aria-hidden="true" /> Create resume</Link>
        <Link className="pcv-button" to="/dashboard/profile">Complete profile</Link>
        <Link className="pcv-button" to="/dashboard/projects">Add / import project</Link>
      </div>
    </header>
    <div className="pcv-grid">
      {[["Resume variants", resumeVariants.length, "/dashboard/resumes"], ["Projects", projects.length, "/dashboard/projects"], ["Your plan", account.plan === "premium" ? "Pro" : account.plan, "/dashboard/settings"]].map(([label, value, path]) =>
        <Link className="pcv-card pcv-stat" style={{textDecoration:"none"}} to={path} key={label}><p className="pcv-muted">{label}</p><h2>{value}</h2><span className="pcv-muted">{label === "Your plan" ? "Plan & usage" : "Open collection"} →</span></Link>
      )}
    </div>
    <div className="pcv-grid">
      <section className="pcv-card">
        <div className="pcv-row"><h2>Recent resumes</h2><Link to="/dashboard/resumes">View all</Link></div>
        {recent.length ? recent.map(v => <div className="pcv-recent" key={v.id}><div><Link to={`/resume/${v.id}`}>{v.name}</Link><p className="pcv-muted">{v.targetRole || "Ready to tailor"}{v.company ? ` · ${v.company}` : ""}</p></div>{v.updatedAt && <time dateTime={v.updatedAt}>{new Date(v.updatedAt).toLocaleDateString()}</time>}</div>) : <p>No active resumes yet. Create one to choose the experience you want to share.</p>}
      </section>
      <section className="pcv-card">
        <h2>{completed === steps.length ? "Your foundation is ready" : "Make this workspace yours"}</h2>
        <p className="pcv-muted">{completed} of {steps.length} setup steps complete, based on your saved fields and selections.</p>
        <progress className="pcv-usage" aria-label="Workspace setup steps complete" value={completed} max={steps.length} />
        <ul className="pcv-checklist">{steps.map(([label, done, path]) => <li key={label}>{done ? <FiCheckCircle className="pcv-complete" aria-label="Complete" /> : <FiCircle aria-label="Incomplete" />}<Link to={path}>{label}</Link></li>)}</ul>
        <p className="pcv-muted">When ready, review your resume and download a PDF from the editor.</p>
      </section>
    </div>
    <section className="pcv-card">
      <div className="pcv-row"><h2>From your project library</h2><Link to="/dashboard/projects">View projects <FiArrowRight aria-hidden="true" /></Link></div>
      {projects.filter(p => p.metadata?.visibility !== "archived").slice(0,3).map(p => <div className="pcv-recent" key={p.id}><div><strong>{p.resumeData.title || "Untitled project"}</strong><p className="pcv-muted">{p.resumeData.techStack || "Add technologies and your achievements"}</p></div><span className="pcv-badge">{p.source === "github" ? "GitHub import" : "Manual project"}</span></div>)}
      {!projects.length && <p>Start with something you have built. Add it manually or import public GitHub facts, then describe your contribution.</p>}
    </section>
  </main>;
}
