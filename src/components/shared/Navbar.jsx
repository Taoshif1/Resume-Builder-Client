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
        <div className="navbar-start relative">
          {/* Mobile Menu Toggle Button */}
          <button
            className="btn btn-ghost lg:hidden mr-2 p-2 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              // ❌ RED CLOSE ICON
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // ☰ MENU ICON (3 Lines)
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
            )}
          </button>

          {/* Mobile Menu Content - Controlled strictly by React State */}
          {isMobileMenuOpen && (
            <ul className="absolute top-[65px] left-0 z-50 p-4 shadow-2xl bg-white rounded-xl w-64 border border-gray-100 flex flex-col gap-2 list-none">
              {navItems.map((item) => (
                <li key={item.name} onClick={() => setIsMobileMenuOpen(false)}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg font-medium transition-colors ${
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
              {!user && (
                <li onClick={() => setIsMobileMenuOpen(false)}>
                  <Link
                    to="/get-started"
                    className="block px-4 py-3 text-[#464554] font-medium hover:bg-gray-50 rounded-lg"
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          )}

          {/* Logo */}
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
                    : "text-[#464554] border-transparent hover:text-[#191C1E] hover:border-gray-300"
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
            <div className="dropdown dropdown-end">
              {/* Trigger: Image + Info Row */}
              <div
                tabIndex={0}
                role="button"
                className="cursor-pointer flex items-center gap-3 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <img
                  src={user?.photoURL || "https://dicebear.com"}
                  alt="user"
                  className="w-9 h-9 rounded-full border border-gray-200 object-cover"
                />
                {/* Name and Email visible on Navbar */}
                <div className="hidden sm:flex flex-col items-start leading-tight pr-2">
                  <span className="text-[14px] font-bold text-[#191C1E]">
                    {user?.displayName || "User"}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {user?.email?.length > 20
                      ? `${user.email.substring(0, 20)}...`
                      : user.email}
                  </span>
                </div>
              </div>

              {/* Dropdown Menu */}
              <ul
                tabIndex={0}
                className="dropdown-content mt-3 z-[1] p-4 shadow-xl bg-white rounded-2xl w-64 border border-gray-100 flex flex-col gap-1"
              >
                <li className="px-2 py-1 mb-1">
                  <p className="text-xs font-bold text-[#4648D4] uppercase tracking-wider">
                    Account Status
                  </p>
                  <p className="text-sm font-semibold text-gray-600">
                    Free Plan
                  </p>
                </li>

                <div className="divider my-1"></div>

                <li>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 hover:bg-gray-50 p-2.5 rounded-xl transition-colors text-[#464554] font-medium"
                  >
                    <span className="text-lg">📊</span> Dashboard
                  </Link>
                </li>

                <li>
                  <Link
                    to="/my-resumes"
                    className="flex items-center gap-3 hover:bg-gray-50 p-2.5 rounded-xl transition-colors text-[#464554] font-medium"
                  >
                    <span className="text-lg">📄</span> My Resumes
                  </Link>
                </li>

                <div className="divider my-1"></div>

                <li>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-colors font-medium"
                  >
                    <span className="text-lg">🚪</span> Logout
                  </button>
                </li>
              </ul>
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
