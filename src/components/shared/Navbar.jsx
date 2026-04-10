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
            `transition-all duration-300 px-4 py-2 rounded-lg ${
              isActive 
                ? "text-[#4A70A9] font-bold underline decoration-2 underline-offset-4" 
                : "text-[#000000] font-medium hover:text-[#4A70A9]"
            }`
          }
        >
          Home
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `transition-all duration-300 px-4 py-2 rounded-lg ${
              isActive 
                ? "text-[#4A70A9] font-bold underline decoration-2 underline-offset-4" 
                : "text-[#000000] font-medium hover:text-[#4A70A9]"
            }`
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
            ? "bg-[#EFECE3]/90 w-full max-w-5xl border border-[#8FABD4]/30 shadow-lg backdrop-blur-xl rounded-2xl"
            : "w-full bg-[#8FABD4] rounded-2xl shadow-md" 
        }
      `}
      >
        <div className="navbar px-4 lg:px-8">
          {/* Start: Logo & Mobile Menu */}
          <div className="navbar-start">
            <div className="dropdown">
              <button 
                tabIndex={0} 
                className="btn btn-ghost lg:hidden hover:bg-[#4A70A9]/10 transition-colors duration-300 group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 transition-transform duration-300 group-hover:scale-110 text-[#000000]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <ul
                tabIndex={0}
                className="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-2xl border border-[#8FABD4]/20 bg-[#EFECE3] p-4 shadow-xl animate-in fade-in zoom-in duration-300 text-[#000000]"
              >
                {navLinks}
              </ul>
            </div>
            <Link
              to="/"
              className="text-xl font-black tracking-tighter lg:text-2xl hover:opacity-80 transition-opacity"
            >
              <span className="text-[#000000]">PERSONA</span>
              <span className={scrolled ? "text-[#4A70A9]" : "text-[#EFECE3]"}>CV</span>
            </Link>
          </div>

          {/* Center: Desktop Links */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal gap-2 px-1">
                {navLinks}
            </ul>
          </div>

          {/* End: Action Buttons */}
          <div className="navbar-end gap-3">
            <Link
              to="/dashboard"
              style={{ backgroundColor: '#4A70A9' }}
              className="btn btn-sm border-none text-[#EFECE3] rounded-xl px-6 lg:btn-md shadow-md hover:brightness-110 hover:scale-105 transition-all duration-300"
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