import { createBrowserRouter } from "react-router";
import { MainLayout } from "../layouts/MainLayout";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import GetStarted from "../pages/GetStarted";
import Login from "../pages/Login";
import Register from "../pages/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    children: [
      { index: true, element: <Home></Home> },
      { path: "dashboard", element: <Dashboard></Dashboard> },
    ],
  },
  {
    path: "/get-started",
    element: <GetStarted />,
    children: [
      { index:true, element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
]);
