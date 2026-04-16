import { createBrowserRouter } from "react-router";
import { MainLayout } from "../layouts/MainLayout";
import Home from "../pages/Home";
import Features from "../pages/Features"; // নতুন যোগ করা হয়েছে
import Pricing from "../pages/Pricing"; // নতুন যোগ করা হয়েছে
import GetStarted from "../pages/GetStarted";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PrivateRoute from "./PrivateRouter";
import { DashboardLayout } from "../layouts/DashboardLayout";
import Overview from "../pages/dashboard/Overview";
import Resumes from "../pages/dashboard/Resumes";
import Create from "../pages/dashboard/Create";
import Profile from "../pages/dashboard/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    children: [
      { index: true, element: <Home></Home> }, // এটি ন্যাভবারের "Product" হিসেবে কাজ করবে
      { path: "features", element: <Features></Features> }, // Features পেজের রাউট
      { path: "pricing", element: <Pricing></Pricing> }, // Pricing পেজের রাউট
      {
        path: "dashboard",
        element: (
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        ),
        children: [
          { index: true, element: <Overview /> },
          { path: "resumes", element: <Resumes /> },
          { path: "create", element: <Create /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },
  {
    path: "/get-started",
    element: <GetStarted />,
    children: [
      { index: true, element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
]);
