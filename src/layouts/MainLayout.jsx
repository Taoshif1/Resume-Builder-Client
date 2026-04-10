import { Outlet } from "react-router";
import Navbar from "../components/shared/Navbar";

export const MainLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar></Navbar>
      <Outlet></Outlet>
    </div>
  );
};
