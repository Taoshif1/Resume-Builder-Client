import { FaFileInvoice } from "react-icons/fa";

const ActivityFeed = () => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <h3 className="font-black text-black mb-6 text-lg uppercase tracking-widest">
        Recent Activity
      </h3>

      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <FaFileInvoice className="text-gray-300 text-2xl" />
        </div>

        <p className="text-gray-400 font-medium italic">
          No recent activity yet.
        </p>
      </div>
    </div>
  );
};

export default ActivityFeed;
