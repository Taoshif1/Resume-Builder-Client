import { Outlet } from "react-router";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#EFECE3] text-white">
      <Navbar />
      <main className="min-h-screen pt-15 container mx-auto px-4">
        <Outlet />
      </main>
      <Footer></Footer>
    </div>
  );
};
