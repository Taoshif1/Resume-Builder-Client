import { Outlet } from "react-router";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";

export const MainLayout = () => {
  return (
    <div className="pcv-public-site">
      <Navbar />
      <main className="pcv-public-main">
        <Outlet />
      </main>
      <Footer></Footer>
    </div>
  );
};
