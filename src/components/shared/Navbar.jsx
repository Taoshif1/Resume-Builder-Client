import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = (
    <>
      <li>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "text-primary font-bold glow" : "font-medium"
          }
        >
          Home
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "text-primary font-bold glow" : "font-medium"
          }
        >
          Dashboard
        </NavLink>
      </li>
    </>
  );

  return (
    <div className="fixed top-0 z-50 flex w-full justify-center px-4 pt-4">
      <div
        className={`
        transition-all duration-500 ease-in-out
        ${
          scrolled
            ? "bg-base-100/70 w-full max-w-5xl border border-white/10 shadow-lg backdrop-blur-xl rounded-2xl"
            : "w-full bg-transparent"
        }
      `}
      >
        <div className="navbar px-4 lg:px-8">
          {/* Start: Logo & Mobile Menu */}
          <div className="navbar-start">
            <div className="dropdown">
              <button tabIndex={0} className="btn btn-ghost lg:hidden">
                <svg
                  xmlns="http://w3.org"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </button>
              <ul
                tabIndex={0}
                className="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-2xl border border-white/10 bg-base-200 p-2 shadow-xl backdrop-blur-xl"
              >
                {navLinks}
              </ul>
            </div>
            <Link
              to="/"
              className="text-xl font-black tracking-tighter text-primary lg:text-2xl"
            >
              PERSONA<span className="text-white">CV</span>
            </Link>
          </div>

          {/* Center: Desktop Links */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal gap-2 px-1">{navLinks}</ul>
          </div>

          {/* End: Action Buttons */}
          <div className="navbar-end gap-3">
            <Link
              to="/dashboard"
              className="btn btn-primary btn-sm rounded-xl px-6 lg:btn-md shadow-[0_0_15px_rgba(0,245,212,0.3)]"
            >
              Build Resume
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
