import { Outlet } from "react-router";
import Navbar from "../components/shared/Navbar";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-base-100 text-white">
      <Navbar />
      <main className="pt-15 container mx-auto px-4">
        <Outlet />
      </main>
    </div>
  );
};
