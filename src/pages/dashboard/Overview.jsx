import StatCard from "../../components/dashboard/StatCard";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import { FaFileInvoice, FaChartLine, FaCrown } from "react-icons/fa";

const Overview = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-black tracking-tight">
          Welcome back 👋
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Let’s build your next winning resume.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Resumes" value="3" icon={<FaFileInvoice />} />
        <StatCard title="ATS Score" value="92%" icon={<FaChartLine />} />
        <StatCard title="Plan" value="Free" icon={<FaCrown />} />
      </div>

      {/* CTA */}
      <div className="bg-[#4A70A9] text-white p-8 rounded-[32px] shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-2">Create a new Resume</h2>
          <p className="opacity-80 font-medium">
            Start building your AI-powered CV.
          </p>
        </div>

        <button className="bg-white text-[#4A70A9] px-8 py-4 rounded-2xl font-black hover:scale-105 transition">
          Create Now
        </button>
      </div>

      {/* Activity */}
      <ActivityFeed />
    </div>
  );
};

export default Overview;
