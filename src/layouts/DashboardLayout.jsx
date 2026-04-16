import { Outlet } from "react-router";
import Sidebar from "../components/dashboard/Sidebar";
import FloatingChatbot from "../components/shared/FloatingChatbot";
import Topbar from "../components/dashboard/Topbar";

export const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#EFECE3]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Topbar />
        <Outlet />
      </div>

      {/* Chatbot */}
      <FloatingChatbot />
    </div>
  );
};
