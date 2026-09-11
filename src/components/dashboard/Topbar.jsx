import { useContext } from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const Topbar = () => {
  const { user } = useContext(AuthContext);

  const handleSearch = (e) => {
    const query = e.target.value;
    console.log("Searching for:", query);
  };

  const getUserInitial = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  return (
    <div className="flex items-center justify-between mb-8 gap-2 md:gap-4">
      {/* Search Bar: Mobile-e width kom thakbe, desktop-e max-md */}
      <div className="flex items-center gap-2 md:gap-3 bg-white px-3 md:px-4 py-2.5 md:py-3 rounded-xl border flex-1 md:w-full md:max-w-md shadow-sm focus-within:ring-2 focus-within:ring-[#4A70A9] transition-all">
        <FaSearch className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="outline-none w-full text-sm bg-transparent text-gray-700 placeholder:text-gray-400"
          onChange={handleSearch}
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* Notification: Mobile-e padding ektu kom */}
        <button className="p-2.5 md:p-3 bg-white rounded-xl border hover:bg-gray-50 transition shadow-sm relative">
          <FaBell className="text-gray-600 text-sm md:text-base" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Section: Mobile-e shudhu chobi/initial dekhabe */}
        <div className="flex items-center gap-3 bg-white p-1 md:pr-4 rounded-xl border shadow-sm">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-8 h-8 md:w-9 md:h-9 rounded-lg object-cover border border-gray-100"
            />
          ) : (
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[#4A70A9] text-white flex items-center justify-center font-bold text-sm md:text-base shadow-inner shrink-0">
              {getUserInitial()}
            </div>
          )}

          {/* Mobile view-te (hidden) thakbe, shudhu md (medium) screen theke block hobe */}
          <div className="hidden lg:block max-w-[100px]">
            <p className="text-sm font-bold text-gray-800 leading-none truncate">
              {getUserName()}
            </p>
            <p className="text-[10px] text-gray-500 mt-1 font-medium uppercase tracking-wider">
              {user ? "Active" : "Guest"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
