import { FaBell, FaSearch } from "react-icons/fa";

const Topbar = () => {
  return (
    <div className="flex items-center justify-between mb-8 gap-4">
      {/* Search */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border w-full max-w-md focus-within:ring-2 focus-within:ring-[#4A70A9]">
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search resumes..."
          className="outline-none w-full text-sm bg-transparent"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <button className="p-3 bg-white rounded-xl border hover:bg-gray-50 transition">
          <FaBell />
        </button>

        <div className="w-10 h-10 rounded-full bg-[#4A70A9] text-white flex items-center justify-center font-bold">
          T
        </div>
      </div>
    </div>
  );
};

export default Topbar;
