import { useContext, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { FiMenu, FiUser } from "react-icons/fi";
import { AuthContext } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(null);
  const [message, setMessage] = useState("");
  const trigger = useRef(null);
  const open = menu === pathname;
  return (
    <header
      className="pcv-public-header"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setMenu(null);
          trigger.current?.focus();
        }
      }}
    >
      <div className="pcv-public-nav">
        <Link className="pcv-brand" to="/">
          Persona<span>CV</span>
        </Link>
        <nav className="pcv-public-links" aria-label="Website">
          {[
            ["Product", "/"],
            ["Features", "/features"],
            ["Pricing", "/pricing"],
          ].map(([label, path]) => (
            <NavLink key={path} to={path} end>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="pcv-public-actions">
          <Link
            className="pcv-button pcv-primary"
            to={user ? "/dashboard" : "/get-started/register"}
          >
            {user ? "Dashboard" : "Get started"}
          </Link>
          <button
            ref={trigger}
            className="pcv-menu-button"
            aria-label={user ? "Account and navigation" : "Website navigation"}
            aria-expanded={open}
            aria-controls="public-menu"
            onClick={() => setMenu(open ? null : pathname)}
          >
            {user ? (
              <FiUser aria-hidden="true" />
            ) : (
              <FiMenu aria-hidden="true" />
            )}
          </button>
        </div>
        {open && (
          <nav
            id="public-menu"
            className="pcv-public-menu"
            aria-label="Account and mobile navigation"
          >
            {user && (
              <p className="pcv-muted">{user.displayName || user.email}</p>
            )}
            {[
              ["Home", "/"],
              ["Features", "/features"],
              ["Pricing", "/pricing"],
              ...(user
                ? [
                    ["Dashboard", "/dashboard"],
                    ["My Resumes", "/dashboard/resumes"],
                    ["Settings", "/dashboard/settings"],
                  ]
                : [["Sign in", "/get-started"]]),
            ].map(([label, path]) => (
              <Link key={label} to={path} onClick={() => setMenu(null)}>
                {label}
              </Link>
            ))}
            {user && (
              <button
                onClick={async () => {
                  try {
                    await logout();
                    setMenu(null);
                  } catch (e) {
                    setMessage(e.message);
                  }
                }}
              >
                Sign out
              </button>
            )}
            {message && <p role="alert">{message}</p>}
          </nav>
        )}
      </div>
    </header>
  );
}
