import { NavLink, Outlet } from "react-router";
import { useWorkspace } from "./workspaceContext";
export default function ProductLayout() {
  const { account } = useWorkspace();
  return (
    <div className="pcv-shell">
      <nav className="pcv-nav" aria-label="Workspace">
        <strong>PersonaCV</strong>
        {[
          ["Overview", "/dashboard"],
          ["Master profile", "/dashboard/profile"],
          ["Projects", "/dashboard/projects"],
          ["Resumes", "/dashboard/resumes"],
          ["Settings", "/dashboard/settings"],
          ...(account.role === "owner" ? [["Admin", "/admin"]] : []),
        ].map(([label, path]) => (
          <NavLink key={path} to={path} end>
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
