import { createElement, useContext, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import {
  FiHome,
  FiUser,
  FiFolder,
  FiFileText,
  FiSettings,
  FiShield,
  FiArrowLeft,
  FiMenu,
  FiLogOut,
} from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";
import { useWorkspace } from "./workspaceContext";

export default function ProductLayout() {
  const { account, workspace, dirty, notices } = useWorkspace();
  const { user, logout } = useContext(AuthContext);
  const { pathname } = useLocation();
  const [openPath, setOpenPath] = useState(null);
  const [message, setMessage] = useState("");
  const toggle = useRef(null);
  const open = openPath === pathname;
  const name =
    workspace.profile.personalInfo.fullName ||
    user.displayName ||
    "Your workspace";
  const nav = [
    ["Overview", "/dashboard", FiHome],
    ["Master Profile", "/dashboard/profile", FiUser],
    ["Projects", "/dashboard/projects", FiFolder],
    ["Resumes & CVs", "/dashboard/resumes", FiFileText],
    ["Settings", "/dashboard/settings", FiSettings],
    ...(account.role === "owner" ? [["Admin", "/admin", FiShield]] : []),
  ];
  async function signOut() {
    if (
      dirty &&
      !window.confirm(
        "Sign out with unsaved changes? Your local backup will remain on this device.",
      )
    )
      return;
    try {
      await logout();
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <div className="pcv-shell">
      <a className="pcv-skip" href="#workspace-content">
        Skip to content
      </a>
      <header className="pcv-mobile-header">
        <Link to="/" className="pcv-brand">
          Persona<span>CV</span>
        </Link>
        <button
          ref={toggle}
          aria-expanded={open}
          aria-controls="workspace-navigation"
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          <FiMenu aria-hidden="true" /> Menu
        </button>
      </header>
      <aside
        className={`pcv-sidebar ${open ? "is-open" : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpenPath(null);
            toggle.current?.focus();
          }
        }}
      >
        <Link to="/" className="pcv-brand pcv-desktop-brand">
          Persona<span>CV</span>
        </Link>
        <Link to="/" className="pcv-home-link">
          <FiArrowLeft aria-hidden="true" /> Back to website
        </Link>
        <p className="pcv-eyebrow">WORKSPACE</p>
        <nav
          id="workspace-navigation"
          aria-label="Workspace"
          className="pcv-workspace-nav"
        >
          {nav.map(([label, path, Icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/dashboard"}
              className={({ isActive }) =>
                isActive ||
                (path === "/dashboard/resumes" &&
                  pathname.startsWith("/resume/"))
                  ? "active"
                  : ""
              }
              onClick={() => setOpenPath(null)}
            >
              {createElement(Icon, { "aria-hidden": true })}
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="pcv-account">
          <span className="pcv-avatar" aria-hidden="true">
            {name.slice(0, 1).toUpperCase()}
          </span>
          <strong>{name}</strong>
          <p>{user.email}</p>
          <span className="pcv-badge">
            {account.plan === "premium" ? "Pro" : account.plan} plan
          </span>
          {account.role === "owner" && <span className="pcv-badge">Owner</span>}
          <Link to="/dashboard/settings" onClick={() => setOpenPath(null)}>
            Account settings
          </Link>
          <button onClick={signOut}>
            <FiLogOut aria-hidden="true" /> Sign out
          </button>
          {message && <p role="alert">{message}</p>}
        </div>
      </aside>
      <div
        id="workspace-content"
        className="pcv-workspace-content"
        tabIndex={-1}
      >
        {notices}
        <Outlet />
      </div>
    </div>
  );
}
