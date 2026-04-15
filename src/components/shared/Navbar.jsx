import { useState } from "react";
import { Link, NavLink } from "react-router";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  // মেনু আইটেমগুলোর লিস্ট
  const navItems = [
    { name: "Product", path: "/" },
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
  ];

  return (
    <div className="w-full bg-[#fcfcfc] border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto navbar px-4 lg:px-8 min-h-[70px]">
        {/* Start: Logo & Mobile Menu Toggle */}
        <div className="navbar-start">
          {/* Mobile Menu Dropdown */}
          <div className="dropdown">
            <button
              tabIndex={0}
              className="btn btn-ghost lg:hidden mr-2 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-800"
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

            {/* Mobile Menu Content */}
            <ul
              tabIndex={0}
              className="menu dropdown-content mt-3 z-[1] p-4 shadow-lg bg-white rounded-xl w-52 border border-gray-100 gap-2"
            >
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-medium ${
                        isActive
                          ? "text-[#4648D4] bg-[#4648D4]/10"
                          : "text-[#464554] hover:bg-gray-50"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
              <div className="divider my-1"></div>
              <li>
                <Link
                  to="/get-started"
                  className="text-[#464554] font-medium px-4 py-2"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Logo - Updated for Pixel Perfect Match */}
          <Link
            to="/"
            className="text-[22px] font-bold text-[#0F172A] tracking-normal hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            PERSONA<span className="text-[#4A70A9]">CV</span> AI
          </Link>
        </div>

        {/* Center: Desktop Links */}
        <div className="navbar-center hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `text-[15px] font-medium pb-1 transition-all duration-300 border-b-2 ${
                  isActive
                    ? "text-[#4648D4] border-[#4648D4]"
                    : "text-[#464554] border-transparent hover:text-[#191C1E]"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* End: Action Buttons */}
        <div className="navbar-end gap-6 items-center">
          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user?.photoURL || "https://i.pravatar.cc/40"}
                alt="user"
                className="w-8 h-8 rounded-full"
              />
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/get-started"
                className="text-[15px] font-medium text-[#464554] hover:text-[#191C1E] transition-colors hidden sm:block"
              >
                Login
              </Link>
              <Link
                to="/get-started/register"
                className="bg-[#4648D4] text-white text-[15px] font-medium rounded-lg px-6 py-2.5 hover:bg-[#3a3cbd] transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
