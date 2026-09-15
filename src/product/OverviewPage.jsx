import { Link } from "react-router";
import { useWorkspace } from "./workspaceContext";
export default function OverviewPage() {
  const { workspace, account } = useWorkspace();
  return (
    <main className="pcv-page">
      <header>
        <p className="pcv-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
        <h1>
          Welcome
          {workspace.profile.personalInfo.fullName
            ? `, ${workspace.profile.personalInfo.fullName}`
            : ""}
        </h1>
        <p>
          Build a reusable profile. Select the right evidence. Send a focused
          resume.
        </p>
      </header>
      <div className="pcv-grid">
        {[
          ["Projects", workspace.projects.length, "/dashboard/projects"],
          [
            "Resume variants",
            workspace.resumeVariants.length,
            "/dashboard/resumes",
          ],
          ["Plan", account.plan, "/dashboard/settings"],
        ].map(([label, value, path]) => (
          <Link className="pcv-card" to={path} key={label}>
            <p>{label}</p>
            <h2>{value}</h2>
          </Link>
        ))}
      </div>
      <section className="pcv-card">
        <h2>Your workflow</h2>
        <ol className="pcv-onboarding">
          <li>
            <Link to="/dashboard/profile">
              Complete your master developer profile
            </Link>
            <p>Contact details, skills, work and education.</p>
          </li>
          <li>
            <Link to="/dashboard/projects">Build your project library</Link>
            <p>Import public GitHub facts and author your achievements.</p>
          </li>
          <li>
            <Link to="/dashboard/resumes">Tailor a resume variant</Link>
            <p>
              Select, edit and reorder content; download an ATS-friendly PDF.
            </p>
          </li>
        </ol>
      </section>
    </main>
  );
}
