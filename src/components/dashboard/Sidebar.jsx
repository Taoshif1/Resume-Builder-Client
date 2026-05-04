import { NavLink } from "react-router";
import { useState } from "react";
import {
  FaHome,
  FaFileAlt,
  FaPlus,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
  FaGem,
} from "react-icons/fa";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { name: "Overview", path: "/dashboard", icon: <FaHome /> },
    { name: "Resumes", path: "/dashboard/resumes", icon: <FaFileAlt /> },
    { name: "Create", path: "/dashboard/create", icon: <FaPlus /> },
    { name: "Profile", path: "/dashboard/profile", icon: <FaUser /> },
  ];

  return (
    <aside
      className={`h-[100dvh] sticky top-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-500 ease-in-out shadow-sm z-45
      ${collapsed ? "w-24" : "w-70"}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-6 mb-4">
        {!collapsed && (
          <h1 className="text-2xl text-[#4A70A9] font-bold tracking-tighter animate-in fade-in">
            PERSONACV
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#4A70A9] transition-colors"
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2 px-4 flex-1 overflow-y-auto overflow-x-hidden">
        {" "}
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? "bg-[#4A70A9] text-white shadow-lg shadow-[#4a70a944]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-[#4A70A9]"
              }`
            }
          >
            <span
              className={`text-xl transition-transform duration-300 group-hover:scale-110`}
            >
              <span title={collapsed ? link.name : ""}>{link.icon}</span>
            </span>
            {!collapsed && (
              <span className="font-bold tracking-tight animate-in slide-in-from-left-2">
                {link.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Upgrade Section */}
      <div className="p-4 mt-auto">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="bg-[#4A70A9] p-3 rounded-xl text-white cursor-pointer hover:scale-110 transition-transform shadow-lg">
              <FaGem />
            </div>
          </div>
        ) : (
          <div className="bg-neutral-900 text-white p-6 rounded-[24px] relative overflow-hidden group cursor-pointer">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#4A70A9] rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <p className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
              Upgrade <FaGem className="text-yellow-400" />
            </p>
            <p className="text-[11px] opacity-60 mt-1 font-medium leading-tight">
              Unlock AI Writing & Premium Templates
            </p>
            <button className="mt-4 w-full py-2 bg-white text-black text-xs font-black rounded-lg uppercase tracking-tighter">
              Go Pro
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
